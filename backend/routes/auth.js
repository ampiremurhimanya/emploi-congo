const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const rateLimit = require('express-rate-limit');

// Rate limiter — max 5 attempts per minute per IP
const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: {
    message: 'Trop de tentatives. Veuillez attendre une minute. / Too many attempts. Please wait a minute.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// ===== REGISTER =====
router.post('/register', async (req, res) => {
  try {
    const {
      fullName, email, password, role,
      fieldOfStudy, degreeProgram,
      companyName, companyWebsite, companyDescription
    } = req.body;

    // Validate required fields
    if (!fullName || !email || !password || !role) {
      return res.status(400).json({ message: 'Tous les champs obligatoires doivent être remplis.' });
    }
    if (!['STUDENT', 'COMPANY'].includes(role)) {
      return res.status(400).json({ message: 'Rôle invalide.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 6 caractères.' });
    }

    // Check email not already taken
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'Un compte avec cet email existe déjà.' });
    }

    if (role === 'COMPANY' && !companyName) {
      return res.status(400).json({ message: 'Le nom de la société est obligatoire.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Insert user
    const result = await pool.query(`
      INSERT INTO users (
        full_name, email, password, role,
        field_of_study, degree_program,
        company_name, company_website, company_description
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING id, full_name, email, role
    `, [
      fullName.trim(),
      email.toLowerCase().trim(),
      hashedPassword,
      role,
      fieldOfStudy || null,
      degreeProgram || null,
      companyName || null,
      companyWebsite || null,
      companyDescription || null
    ]);

    const user = result.rows[0];
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

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

    // Find user
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
    }

    const user = result.rows[0];

    if (!user.account_active) {
      return res.status(403).json({ message: 'Ce compte a été suspendu. Contactez l\'administration.' });
    }

    // Check password
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

module.exports = router;