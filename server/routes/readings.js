// ================================================
// routes/readings.js - Sensor Readings History
// ================================================
// FIELDS STORED: drip_rate, flow_status, blood_detected
// NOTE: fluid_level column REMOVED from this system.
// ================================================

const express = require('express');
const db      = require('../db');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// ── POST /api/readings ─────────────────────────
// Save one reading (called by frontend every ~30s)
// Body: { patient_id, drip_rate, flow_status, blood_detected }
router.post('/', verifyToken, async (req, res) => {
  try {
    const { patient_id, drip_rate, flow_status, blood_detected } = req.body;

    if (!patient_id) {
      return res.status(400).json({ success: false, message: 'patient_id is required.' });
    }

    await db.execute(`
      INSERT INTO readings (patient_id, drip_rate, flow_status, blood_detected)
      VALUES (?, ?, ?, ?)
    `, [
      patient_id,
      drip_rate      || 0,
      flow_status    || 'Unknown',
      blood_detected ? 1 : 0
    ]);

    res.status(201).json({ success: true, message: 'Reading saved.' });

  } catch (err) {
    console.error('Save reading error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ── GET /api/readings/patient/:id ──────────────
// Get last N readings for a patient (for Chart.js)
// Query: ?limit=30 (default)
router.get('/patient/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const limit  = parseInt(req.query.limit) || 30;

    const [rows] = await db.execute(`
      SELECT drip_rate, flow_status, blood_detected, recorded_at
      FROM readings
      WHERE patient_id = ?
      ORDER BY recorded_at DESC
      LIMIT ${limit}
    `, [id]);

    rows.reverse(); // oldest first for graph left→right

    res.json({ success: true, readings: rows });

  } catch (err) {
    console.error('Get readings error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ── DELETE /api/readings/patient/:id ───────────
// Admin: clear all readings for a patient
router.delete('/patient/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await db.execute('DELETE FROM readings WHERE patient_id = ?', [id]);
    res.json({ success: true, message: 'Readings cleared.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;