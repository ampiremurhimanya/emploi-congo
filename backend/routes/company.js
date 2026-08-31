const express = require('express');
const router = express.Router();
const pool = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');
const bcrypt = require('bcryptjs');

// ===== POST OPPORTUNITY =====
router.post('/opportunities', requireAuth, requireRole('COMPANY'), async (req, res) => {
  try {
    const { title, field, description, location, employmentType, salaryRange, applicationDeadline } = req.body;
    if (!title || !field) {
      return res.status(400).json({ message: 'Le titre et le domaine sont obligatoires.' });
    }
    const company = await pool.query(
      'SELECT company_name, verified_company FROM users WHERE id = $1', [req.user.userId]
    );
    const result = await pool.query(`
      INSERT INTO opportunities
        (title, company_name, company_id, field, description, location,
         employment_type, salary_range, application_deadline, verified_company)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *
    `, [
      title, company.rows[0].company_name, req.user.userId,
      field, description, location, employmentType,
      salaryRange, applicationDeadline || null,
      company.rows[0].verified_company
    ]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Post opportunity error:', err.message);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// ===== MY POSTINGS =====
router.get('/opportunities', requireAuth, requireRole('COMPANY'), async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM opportunities WHERE company_id = $1 ORDER BY created_at DESC',
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// ===== MY APPLICANTS =====
router.get('/applicants', requireAuth, requireRole('COMPANY'), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT a.*, u.full_name as student_name, u.email as student_email,
             u.degree_program, u.field_of_study,
             o.title as opportunity_title
      FROM applications a
      JOIN users u ON a.student_id = u.id
      JOIN opportunities o ON a.opportunity_id = o.id
      WHERE o.company_id = $1
      ORDER BY a.applied_at DESC
    `, [req.user.userId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// ===== UPDATE APPLICATION STATUS =====
router.patch('/applications/:id/status', requireAuth, requireRole('COMPANY'), async (req, res) => {
  try {
    const { status, companyFeedback, currentStep } = req.body;
    const validStatuses = ['SUBMITTED','UNDER_REVIEW','INTERVIEWING','APPROVED','REJECTED','POSITION_FILLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Statut invalide.' });
    }
    const result = await pool.query(`
      UPDATE applications
      SET status = $1, company_feedback = $2, current_step = $3, updated_at = NOW()
      WHERE id = $4
      AND opportunity_id IN (SELECT id FROM opportunities WHERE company_id = $5)
      RETURNING *
    `, [status, companyFeedback || null, currentStep || 2, req.params.id, req.user.userId]);

    if (result.rows.length === 0) {
      return res.status(403).json({ message: 'Action non autorisée.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// ===== DASHBOARD STATS =====
router.get('/dashboard', requireAuth, requireRole('COMPANY'), async (req, res) => {
  try {
    const total = await pool.query(
      `SELECT COUNT(*) FROM applications a
       JOIN opportunities o ON a.opportunity_id = o.id
       WHERE o.company_id = $1`, [req.user.userId]
    );
    const pending = await pool.query(
      `SELECT COUNT(*) FROM applications a
       JOIN opportunities o ON a.opportunity_id = o.id
       WHERE o.company_id = $1 AND a.status IN ('SUBMITTED','UNDER_REVIEW')`,
      [req.user.userId]
    );
    const active = await pool.query(
      `SELECT COUNT(*) FROM opportunities WHERE company_id = $1 AND status = 'APPROVED'`,
      [req.user.userId]
    );
    res.json({
      totalApplicants: parseInt(total.rows[0].count),
      pendingReviews: parseInt(pending.rows[0].count),
      activeListings: parseInt(active.rows[0].count)
    });
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