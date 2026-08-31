const express = require('express');
const router = express.Router();
const pool = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads/cvs');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx'];
    if (allowed.includes(path.extname(file.originalname).toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error('Seuls les fichiers PDF, DOC et DOCX sont acceptés.'));
    }
  }
});

// ===== GET PROFILE =====
router.get('/profile', requireAuth, requireRole('STUDENT'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, full_name, email, role, field_of_study, degree_program,
       cv_file_name, cv_original_name, account_active, created_at
       FROM users WHERE id = $1`, [req.user.userId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// ===== UPLOAD CV =====
router.post('/cv', requireAuth, requireRole('STUDENT'), upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Aucun fichier reçu.' });
    await pool.query(
      'UPDATE users SET cv_file_name = $1, cv_original_name = $2 WHERE id = $3',
      [req.file.filename, req.file.originalname, req.user.userId]
    );
    const result = await pool.query(
      `SELECT id, full_name, email, role, field_of_study, degree_program,
       cv_file_name, cv_original_name FROM users WHERE id = $1`,
      [req.user.userId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// ===== APPLY =====
router.post('/applications/:opportunityId', requireAuth, requireRole('STUDENT'), async (req, res) => {
  try {
    const { opportunityId } = req.params;
    const { coverNote } = req.body;
    const studentId = req.user.userId;

    const opp = await pool.query(
      `SELECT * FROM opportunities WHERE id = $1 AND status = 'APPROVED'`,
      [opportunityId]
    );
    if (opp.rows.length === 0) {
      return res.status(400).json({ message: 'Cette opportunité n\'est plus disponible.' });
    }

    const student = await pool.query(
      'SELECT cv_file_name FROM users WHERE id = $1', [studentId]
    );
    if (!student.rows[0].cv_file_name) {
      return res.status(400).json({ message: 'Veuillez d\'abord télécharger votre CV.' });
    }

    const existing = await pool.query(
      'SELECT id FROM applications WHERE student_id = $1 AND opportunity_id = $2',
      [studentId, opportunityId]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'Vous avez déjà postulé à cette opportunité.' });
    }

    const result = await pool.query(`
      INSERT INTO applications (student_id, opportunity_id, cover_note, cv_file_snapshot)
      VALUES ($1, $2, $3, $4) RETURNING *
    `, [studentId, opportunityId, coverNote || null, student.rows[0].cv_file_name]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Apply error:', err.message);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// ===== MY APPLICATIONS =====
router.get('/applications', requireAuth, requireRole('STUDENT'), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT a.*, o.title as opportunity_title, o.company_name, o.location
      FROM applications a
      JOIN opportunities o ON a.opportunity_id = o.id
      WHERE a.student_id = $1
      ORDER BY a.applied_at DESC
    `, [req.user.userId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// ===== TOGGLE SAVE =====
router.post('/saved/:opportunityId', requireAuth, requireRole('STUDENT'), async (req, res) => {
  try {
    const { opportunityId } = req.params;
    const studentId = req.user.userId;
    const existing = await pool.query(
      'SELECT id FROM saved_opportunities WHERE student_id = $1 AND opportunity_id = $2',
      [studentId, opportunityId]
    );
    if (existing.rows.length > 0) {
      await pool.query(
        'DELETE FROM saved_opportunities WHERE student_id = $1 AND opportunity_id = $2',
        [studentId, opportunityId]
      );
      res.json({ saved: false });
    } else {
      await pool.query(
        'INSERT INTO saved_opportunities (student_id, opportunity_id) VALUES ($1, $2)',
        [studentId, opportunityId]
      );
      res.json({ saved: true });
    }
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// ===== SAVED JOBS =====
router.get('/saved', requireAuth, requireRole('STUDENT'), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT o.* FROM saved_opportunities s
      JOIN opportunities o ON s.opportunity_id = o.id
      WHERE s.student_id = $1
      ORDER BY s.saved_at DESC
    `, [req.user.userId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// ===== CHANGE PASSWORD =====
router.post('/change-password', requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Les deux champs sont obligatoires.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Le nouveau mot de passe doit contenir au moins 6 caractères.' });
    }
    if (currentPassword === newPassword) {
      return res.status(400).json({ message: 'Le nouveau mot de passe doit être différent de l\'ancien.' });
    }

    const result = await pool.query(
      'SELECT password FROM users WHERE id = $1', [req.user.userId]
    );
    if (!result.rows.length) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }

    const valid = await bcrypt.compare(currentPassword, result.rows[0].password);
    if (!valid) {
      return res.status(400).json({ message: 'Mot de passe actuel incorrect.' });
    }

    const hashed = await bcrypt.hash(newPassword, 12);
    await pool.query(
      'UPDATE users SET password = $1 WHERE id = $2',
      [hashed, req.user.userId]
    );

    res.json({ message: 'Mot de passe modifié avec succès.' });
  } catch (err) {
    console.error('Change password error:', err.message);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

module.exports = router;