const express = require('express');
const router = express.Router();
const pool = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');
const bcrypt = require('bcryptjs');

// ===== DASHBOARD STATS =====
router.get('/dashboard', requireAuth, requireRole('ADMIN'), async (req, res) => {
  try {
    const pending = await pool.query(`SELECT COUNT(*) FROM opportunities WHERE status = 'PENDING'`);
    const active = await pool.query(`SELECT COUNT(*) FROM opportunities WHERE status = 'APPROVED'`);
    const students = await pool.query(`SELECT COUNT(*) FROM users WHERE role = 'STUDENT'`);
    const companies = await pool.query(`SELECT COUNT(*) FROM users WHERE role = 'COMPANY'`);
    const total = await pool.query(`SELECT COUNT(*) FROM users`);
    res.json({
      pendingApprovals: parseInt(pending.rows[0].count),
      activeOpportunities: parseInt(active.rows[0].count),
      totalStudents: parseInt(students.rows[0].count),
      totalCompanies: parseInt(companies.rows[0].count),
      totalUsers: parseInt(total.rows[0].count)
    });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// ===== PENDING OPPORTUNITIES =====
router.get('/opportunities/pending', requireAuth, requireRole('ADMIN'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM opportunities WHERE status = 'PENDING' ORDER BY created_at ASC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// ===== APPROVE OPPORTUNITY =====
router.patch('/opportunities/:id/approve', requireAuth, requireRole('ADMIN'), async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE opportunities SET status = 'APPROVED', approved_at = NOW()
       WHERE id = $1 RETURNING *`, [req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// ===== REJECT OPPORTUNITY =====
router.patch('/opportunities/:id/reject', requireAuth, requireRole('ADMIN'), async (req, res) => {
  try {
    const { reason } = req.body;
    const result = await pool.query(
      `UPDATE opportunities SET status = 'REJECTED', rejection_reason = $1
       WHERE id = $2 RETURNING *`, [reason || null, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// ===== INTERNAL POST (admin posts directly, auto-approved) =====
router.post('/opportunities/internal', requireAuth, requireRole('ADMIN'), async (req, res) => {
  try {
    const { title, companyName, field, description, location, employmentType, salaryRange, applicationDeadline } = req.body;
    if (!title || !companyName || !field) {
      return res.status(400).json({ message: 'Titre, société et domaine sont obligatoires.' });
    }
    const result = await pool.query(`
      INSERT INTO opportunities
        (title, company_name, field, description, location, employment_type,
         salary_range, application_deadline, status, internal_post, verified_company, approved_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'APPROVED',true,true,NOW())
      RETURNING *
    `, [title, companyName, field, description, location, employmentType, salaryRange, applicationDeadline || null]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// ===== LIST ALL USERS =====
router.get('/users', requireAuth, requireRole('ADMIN'), async (req, res) => {
  try {
    const { role, search, page = 0, size = 20 } = req.query;
    const offset = page * size;
    const conditions = [];
    const params = [];
    let i = 1;

    if (role) { conditions.push(`role = $${i}`); params.push(role); i++; }
    if (search) {
      conditions.push(`(LOWER(full_name) LIKE $${i} OR LOWER(email) LIKE $${i} OR LOWER(COALESCE(company_name,'')) LIKE $${i})`);
      params.push(`%${search.toLowerCase()}%`);
      i++;
    }

    const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    const countResult = await pool.query(`SELECT COUNT(*) FROM users ${where}`, params);
    params.push(parseInt(size));
    params.push(parseInt(offset));

    const result = await pool.query(`
      SELECT id, full_name, email, role, company_name, verified_company,
             account_active, created_at
      FROM users ${where}
      ORDER BY created_at DESC
      LIMIT $${i} OFFSET $${i+1}
    `, params);

    res.json({
      content: result.rows,
      totalElements: parseInt(countResult.rows[0].count),
      totalPages: Math.ceil(countResult.rows[0].count / size),
      number: parseInt(page)
    });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// ===== TOGGLE USER ACTIVE =====
router.patch('/users/:id/toggle-active', requireAuth, requireRole('ADMIN'), async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE users SET account_active = NOT account_active WHERE id = $1
       RETURNING id, full_name, email, role, account_active`, [req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// ===== VERIFY COMPANY =====
router.patch('/users/:id/verify-company', requireAuth, requireRole('ADMIN'), async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE users SET verified_company = true WHERE id = $1 AND role = 'COMPANY'
       RETURNING id, full_name, email, role, verified_company`, [req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

module.exports = router;