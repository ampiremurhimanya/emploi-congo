const express = require('express');
const router = express.Router();
const pool = require('../db');

// ===== PUBLIC: Search approved opportunities =====
router.get('/public/search', async (req, res) => {
  try {
    const { keyword, field, companyName, page = 0, size = 10 } = req.query;
    const offset = page * size;
    const conditions = [
      `o.status = 'APPROVED'`,
      `(o.application_deadline IS NULL OR o.application_deadline >= CURRENT_DATE)`
    ];
    const params = [];
    let i = 1;

    if (keyword) {
      conditions.push(`(
        LOWER(o.title) LIKE $${i} OR
        LOWER(o.company_name) LIKE $${i} OR
        LOWER(o.description) LIKE $${i}
      )`);
      params.push(`%${keyword.toLowerCase()}%`);
      i++;
    }
    if (field) {
      conditions.push(`o.field = $${i}`);
      params.push(field);
      i++;
    }
    if (companyName) {
      conditions.push(`LOWER(o.company_name) LIKE $${i}`);
      params.push(`%${companyName.toLowerCase()}%`);
      i++;
    }

    const where = conditions.join(' AND ');

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM opportunities o WHERE ${where}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    params.push(parseInt(size));
    params.push(parseInt(offset));

    const result = await pool.query(`
      SELECT o.* FROM opportunities o
      WHERE ${where}
      ORDER BY o.created_at DESC
      LIMIT $${i} OFFSET $${i + 1}
    `, params);

    res.json({
      content: result.rows,
      totalElements: total,
      totalPages: Math.ceil(total / size),
      number: parseInt(page)
    });

  } catch (err) {
    console.error('Search error:', err.message);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// ===== PUBLIC: Latest approved opportunities =====
router.get('/public/latest', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 6;
    const result = await pool.query(`
      SELECT * FROM opportunities
      WHERE status = 'APPROVED'
        AND (application_deadline IS NULL OR application_deadline >= CURRENT_DATE)
      ORDER BY created_at DESC
      LIMIT $1
    `, [limit]);
    res.json(result.rows);
  } catch (err) {
    console.error('Latest error:', err.message);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// ===== PUBLIC: Single opportunity =====
router.get('/public/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM opportunities WHERE id = $1',
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Opportunité non trouvée.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// ===== PUBLIC: Stats for landing page =====
router.get('/stats', async (req, res) => {
  try {
    const opps = await pool.query(`
      SELECT COUNT(*) FROM opportunities
      WHERE status = 'APPROVED'
        AND (application_deadline IS NULL OR application_deadline >= CURRENT_DATE)
    `);
    const companies = await pool.query(
      `SELECT COUNT(*) FROM users WHERE role = 'COMPANY'`
    );
    const students = await pool.query(
      `SELECT COUNT(*) FROM users WHERE role = 'STUDENT'`
    );
    res.json({
      activeOpportunities: parseInt(opps.rows[0].count),
      partnerCompanies:    parseInt(companies.rows[0].count),
      registeredStudents:  parseInt(students.rows[0].count)
    });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

module.exports = router;