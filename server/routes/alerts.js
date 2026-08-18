// ================================================
// routes/alerts.js - Alert Logging & Retrieval
// ================================================
// Alert types: drip_stopped, backflow, high_rate, emergency
// NOTE: bottle_low and critically_empty REMOVED
//       (no fluid level sensor in this system)
// ================================================

const express = require('express');
const db      = require('../db');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// ── POST /api/alerts ───────────────────────────
// Save a new alert (called automatically by nurse dashboard)
// Body: { patient_id, alert_type, message, drip_rate }
router.post('/', verifyToken, async (req, res) => {
  try {
    const { patient_id, alert_type, message, drip_rate } = req.body;

    if (!patient_id || !alert_type || !message) {
      return res.status(400).json({
        success: false,
        message: 'patient_id, alert_type and message are required.'
      });
    }

    // Valid alert types for this system (no fluid-related types)
    const validTypes = ['drip_stopped', 'backflow', 'high_rate', 'emergency'];
    if (!validTypes.includes(alert_type)) {
      return res.status(400).json({
        success: false,
        message: `Invalid alert_type. Use: ${validTypes.join(', ')}`
      });
    }

    const [result] = await db.execute(`
      INSERT INTO alerts_log (patient_id, alert_type, message, drip_rate)
      VALUES (?, ?, ?, ?)
    `, [patient_id, alert_type, message, drip_rate || null]);

    res.status(201).json({
      success: true,
      message: 'Alert saved.',
      alert_id: result.insertId
    });

  } catch (err) {
    console.error('Save alert error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ── GET /api/alerts ────────────────────────────
// Admin: all alerts with patient info
router.get('/', verifyAdmin, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;

    const [rows] = await db.query(`
      SELECT
        a.id, a.alert_type, a.message,
        a.drip_rate, a.created_at,
        p.name AS patient_name, p.bed_number
      FROM alerts_log a
      JOIN patients p ON a.patient_id = p.id
      ORDER BY a.created_at DESC
      LIMIT ${limit}
    `);

    res.json({ success: true, alerts: rows });

  } catch (err) {
    console.error('Get alerts error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ── GET /api/alerts/mine ───────────────────────
// Nurse: alerts for my assigned patients only
router.get('/mine', verifyToken, async (req, res) => {
  try {
    const [nurseRows] = await db.execute(
      'SELECT id FROM nurses WHERE user_id = ?', [req.user.id]
    );
    if (nurseRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Nurse profile not found.' });
    }

    const [rows] = await db.execute(`
      SELECT
        a.id, a.alert_type, a.message,
        a.drip_rate, a.created_at,
        p.name AS patient_name, p.bed_number
      FROM alerts_log a
      JOIN patients p ON a.patient_id = p.id
      WHERE p.assigned_nurse_id = ?
      ORDER BY a.created_at DESC
      LIMIT 50
    `, [nurseRows[0].id]);

    res.json({ success: true, alerts: rows });

  } catch (err) {
    console.error('Get my alerts error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ── GET /api/alerts/patient/:id ────────────────
// Get alerts for a specific patient
router.get('/patient/:id', verifyToken, async (req, res) => {
  try {
    const { id }  = req.params;
    const limit   = parseInt(req.query.limit) || 30;

    const [rows] = await db.execute(`
      SELECT id, alert_type, message, drip_rate, created_at
      FROM alerts_log
      WHERE patient_id = ?
      ORDER BY created_at DESC
      LIMIT ${limit}
    `, [id]);

    res.json({ success: true, alerts: rows });

  } catch (err) {
    console.error('Get patient alerts error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ── DELETE /api/alerts/all ─────────────────────
// Admin: clear ALL alert logs
router.delete('/all', verifyAdmin, async (req, res) => {
  try {
    await db.execute('DELETE FROM alerts_log');
    res.json({ success: true, message: 'All alert logs cleared successfully.' });
  } catch (err) {
    console.error('Clear all alerts error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ── DELETE /api/alerts/:id ─────────────────────
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    await db.execute('DELETE FROM alerts_log WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Alert deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;