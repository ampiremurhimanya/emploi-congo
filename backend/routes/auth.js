'use strict';

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Resend } = require('resend');
const pool = require('../db');
const rateLimit = require('express-rate-limit');

require('dotenv').config();

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

async function sendEmail(to, subject, html) {
  const resend = getResend();
  const { data, error } = await resend.emails.send({
    from: 'EmploiCongo <onboarding@resend.dev>',
    to: [to],
    subject,
    html
  });
  if (error) throw new Error(JSON.stringify(error));
  return data;
}

function emailEnabled() {
  return process.env.MAIL_ENABLED === 'true' && !!process.env.RESEND_API_KEY;
}

const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { message: 'Trop de tentatives. Attendez une minute.' }
});

const forgotLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { message: 'Trop de demandes. Attendez 15 minutes.' }
});

// ===== TEST EMAIL =====
router.get('/test-email', async (req, res) => {
  try {
    if (!emailEnabled()) {
      return res.status(400).json({
        message: 'Email désactivé. Vérifiez MAIL_ENABLED et RESEND_API_KEY dans .env'
      });
    }
    await sendEmail(
      'ampireguillaume4@gmail.com',
      'Test Email EmploiCongo',
      '<h2>Email fonctionne !</h2><p>Votre configuration Resend est correcte.</p>'
    );
    res.json({ message: 'Email envoyé ! Vérifiez votre boîte mail.' });
  } catch (err) {
    console.error('Test email error:', err.message);
    res.status(500).json({ message: 'Echec: ' + err.message });
  }
});

// ===== REGISTER =====
router.post('/register', async (req, res) => {
  try {
    const {
      fullName, email, password, role,
      fieldOfStudy, degreeProgram,
      companyName, companyWebsite, companyDescription
    } = req.body;

    if (!fullName || !email || !password || !role) {
      return res.status(400).json({
        message: 'Tous les champs obligatoires doivent être remplis.'
      });
    }
    if (!['STUDENT', 'COMPANY'].includes(role)) {
      return res.status(400).json({ message: 'Rôle invalide.' });
    }
    if (password.length < 6) {
      return res.status(400).json({
        message: 'Le mot de passe doit contenir au moins 6 caractères.'
      });
    }

    const existing = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({
        message: 'Un compte avec cet email existe déjà.'
      });
    }
    if (role === 'COMPANY' && !companyName) {
      return res.status(400).json({
        message: 'Le nom de la société est obligatoire.'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const result = await pool.query(
      `INSERT INTO users (
        full_name, email, password, role,
        field_of_study, degree_program,
        company_name, company_website, company_description
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING id, full_name, email, role`,
      [
        fullName.trim(),
        email.toLowerCase().trim(),
        hashedPassword, role,
        fieldOfStudy || null,
        degreeProgram || null,
        companyName || null,
        companyWebsite || null,
        companyDescription || null
      ]
    );

    const user = result.rows[0];
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    if (emailEnabled()) {
      sendEmail(
        user.email,
        'Bienvenue sur EmploiCongo !',
        '<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;">'
        + '<div style="background:#0d1e3d;padding:24px;text-align:center;border-radius:12px 12px 0 0;">'
        + '<h1 style="color:#f5c842;margin:0;font-size:1.8rem;">EmploiCongo</h1>'
        + '</div>'
        + '<div style="background:#fff;padding:32px;border:1px solid #e2e8f0;border-radius:0 0 12px 12px;">'
        + '<h2 style="color:#0d1e3d;">Bienvenue, ' + user.full_name + ' !</h2>'
        + '<p style="color:#374151;line-height:1.7;">Votre compte a été créé avec succès sur EmploiCongo.</p>'
        + '<ul style="color:#374151;line-height:2.2;">'
        + '<li>Parcourir des centaines d offres d emploi et de stages</li>'
        + '<li>Télécharger votre CV et postuler en un clic</li>'
        + '<li>Suivre vos candidatures en temps réel</li>'
        + '</ul>'
        + '<hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;">'
        + '<p style="color:#94a3b8;font-size:0.82rem;text-align:center;">2026 EmploiCongo. Tous droits réservés.</p>'
        + '</div></div>'
      ).catch(err => console.error('Welcome email error:', err.message));
    }

    res.status(201).json({
      token,
      userId: user.id,
      fullName: user.full_name,
      email: user.email,
      role: user.role
    });

  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// ===== LOGIN =====
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email et mot de passe requis.' });
    }

    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
    }

    const user = result.rows[0];

    if (!user.account_active) {
      return res.status(403).json({
        message: 'Ce compte a été suspendu. Contactez l administration.'
      });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      userId: user.id,
      fullName: user.full_name,
      email: user.email,
      role: user.role
    });

  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// ===== FORGOT PASSWORD =====
router.post('/forgot-password', forgotLimiter, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: 'Veuillez entrer votre adresse email.'
      });
    }

    const result = await pool.query(
      'SELECT id, full_name, email FROM users WHERE email = $1 AND account_active = true',
      [email.toLowerCase().trim()]
    );

    if (result.rows.length === 0) {
      return res.json({
        message: 'Si cet email est enregistré, un code a été envoyé. Vérifiez votre boîte mail.',
        emailSent: false
      });
    }

    const user = result.rows[0];

    await pool.query(
      'DELETE FROM password_reset_tokens WHERE user_id = $1',
      [user.id]
    );

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedCode = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    await pool.query(
      'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, hashedCode, expiresAt]
    );

    console.log('[SERVER] Reset code for ' + user.email + ': ' + code);

    if (emailEnabled()) {
      // Respond immediately — do not wait for email
      res.json({
        message: 'Un code a été envoyé à ' + email + '. Vérifiez votre boîte mail et vos spams. Le code expire dans 30 minutes.',
        emailSent: true
      });

      // Send email in background
      sendEmail(
        user.email,
        'Code de réinitialisation — EmploiCongo',
        '<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;">'
        + '<div style="background:#0d1e3d;padding:24px;text-align:center;border-radius:12px 12px 0 0;">'
        + '<h1 style="color:#f5c842;margin:0;font-size:1.8rem;">EmploiCongo</h1>'
        + '</div>'
        + '<div style="background:#fff;padding:32px;border:1px solid #e2e8f0;border-radius:0 0 12px 12px;">'
        + '<h2 style="color:#0d1e3d;">Réinitialisation du mot de passe</h2>'
        + '<p style="color:#374151;">Bonjour ' + user.full_name + ',</p>'
        + '<p style="color:#374151;line-height:1.7;">Voici votre code de vérification :</p>'
        + '<div style="background:#f3f6fb;border-radius:14px;padding:32px;text-align:center;margin:28px 0;">'
        + '<p style="color:#64748b;font-size:0.85rem;margin:0 0 12px;font-weight:600;letter-spacing:0.05em;">CODE DE VÉRIFICATION</p>'
        + '<div style="font-size:3rem;font-weight:900;letter-spacing:0.6rem;color:#0d1e3d;background:#fff;display:inline-block;padding:20px 40px;border-radius:12px;border:2px solid #e2e8f0;">'
        + code
        + '</div>'
        + '<p style="color:#64748b;font-size:0.82rem;margin:16px 0 0;">Ce code expire dans <strong>30 minutes</strong></p>'
        + '</div>'
        + '<div style="background:#fef3c7;border:1px solid #fcd34d;border-radius:10px;padding:14px;margin-bottom:24px;">'
        + '<p style="color:#b45309;margin:0;font-size:0.88rem;">Si vous n avez pas demandé cette réinitialisation, ignorez cet email.</p>'
        + '</div>'
        + '<hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;">'
        + '<p style="color:#94a3b8;font-size:0.82rem;text-align:center;">2026 EmploiCongo. Tous droits réservés.</p>'
        + '</div></div>'
      ).then(() => {
        console.log('Reset email delivered to: ' + user.email);
      }).catch(err => {
        console.error('Email failed for ' + user.email + ': ' + err.message);
      });

      return;
    }

    return res.json({
      message: 'Mode développement.',
      code: code,
      emailSent: false
    });

  } catch (err) {
    console.error('Forgot password error:', err.message);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// ===== VERIFY RESET CODE =====
router.post('/verify-reset-code', async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ message: 'Email et code requis.' });
    }

    const user = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );
    if (!user.rows.length) {
      return res.status(400).json({ message: 'Code invalide ou expiré.' });
    }

    const tokenResult = await pool.query(
      'SELECT * FROM password_reset_tokens WHERE user_id = $1 AND expires_at > NOW() AND used = false ORDER BY created_at DESC LIMIT 1',
      [user.rows[0].id]
    );

    if (!tokenResult.rows.length) {
      return res.status(400).json({
        message: 'Ce code est invalide ou a expiré. Veuillez en demander un nouveau.'
      });
    }

    const valid = await bcrypt.compare(code.toString(), tokenResult.rows[0].token);
    if (!valid) {
      return res.status(400).json({ message: 'Code incorrect. Vérifiez et réessayez.' });
    }

    res.json({ message: 'Code vérifié avec succès.' });

  } catch (err) {
    console.error('Verify code error:', err.message);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// ===== RESET PASSWORD =====
router.post('/reset-password', async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({ message: 'Tous les champs sont requis.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({
        message: 'Le mot de passe doit contenir au moins 6 caractères.'
      });
    }

    const user = await pool.query(
      'SELECT id, full_name, email FROM users WHERE email = $1 AND account_active = true',
      [email.toLowerCase().trim()]
    );
    if (!user.rows.length) {
      return res.status(400).json({ message: 'Code invalide ou expiré.' });
    }

    const tokenResult = await pool.query(
      'SELECT * FROM password_reset_tokens WHERE user_id = $1 AND expires_at > NOW() AND used = false ORDER BY created_at DESC LIMIT 1',
      [user.rows[0].id]
    );

    if (!tokenResult.rows.length) {
      return res.status(400).json({
        message: 'Ce code est invalide ou a expiré. Veuillez en demander un nouveau.'
      });
    }

    const valid = await bcrypt.compare(code.toString(), tokenResult.rows[0].token);
    if (!valid) {
      return res.status(400).json({ message: 'Code incorrect.' });
    }

    const hashed = await bcrypt.hash(newPassword, 12);
    await pool.query(
      'UPDATE users SET password = $1 WHERE id = $2',
      [hashed, user.rows[0].id]
    );

    await pool.query(
      'UPDATE password_reset_tokens SET used = true WHERE id = $1',
      [tokenResult.rows[0].id]
    );

    if (emailEnabled()) {
      sendEmail(
        user.rows[0].email,
        'Mot de passe modifié — EmploiCongo',
        '<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;">'
        + '<div style="background:#0d1e3d;padding:24px;text-align:center;border-radius:12px 12px 0 0;">'
        + '<h1 style="color:#f5c842;margin:0;font-size:1.8rem;">EmploiCongo</h1>'
        + '</div>'
        + '<div style="background:#fff;padding:32px;border:1px solid #e2e8f0;border-radius:0 0 12px 12px;">'
        + '<h2 style="color:#15803d;">Mot de passe modifié</h2>'
        + '<p style="color:#374151;">Bonjour ' + user.rows[0].full_name + ',</p>'
        + '<p style="color:#374151;line-height:1.7;">Votre mot de passe EmploiCongo a été réinitialisé avec succès.</p>'
        + '<div style="background:#dcfce7;border:1px solid #86efac;border-radius:10px;padding:14px;margin:20px 0;">'
        + '<p style="color:#15803d;margin:0;font-size:0.88rem;">Si vous n avez pas effectué cette modification, contactez-nous à contact@emploicongo.cd</p>'
        + '</div>'
        + '<hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;">'
        + '<p style="color:#94a3b8;font-size:0.82rem;text-align:center;">2026 EmploiCongo. Tous droits réservés.</p>'
        + '</div></div>'
      ).catch(err => console.error('Confirmation email error:', err.message));
    }

    res.json({
      message: 'Mot de passe réinitialisé avec succès. Vous pouvez maintenant vous connecter.'
    });

  } catch (err) {
    console.error('Reset password error:', err.message);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

module.exports = router;