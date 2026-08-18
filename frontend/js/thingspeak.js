// ================================================
// js/thingspeak.js - Fetch live ESP32 sensor data
// ================================================
// SENSORS USED:
//   field1 = dripRate      (drops per minute from IR sensor)
//   field2 = flowStatus    (1=Running, 0=Stopped)
//   field3 = bloodDetected (1=Yes, 0=No from TCS34725)
// NOTE: Fluid Level removed from this system.
// ================================================

// ── Fetch latest reading from ThingSpeak ─────────
async function fetchThingSpeak(channelId, readKey, patientId) {
  // If no real channel configured, return default offline/stopped state (no fake data)
  if (!channelId || channelId === '123456') {
    return simulateReading(patientId || 'default');
  }
  try {
    const url  = `https://api.thingspeak.com/channels/${channelId}/feeds/last.json?api_key=${readKey}`;
    const res  = await fetch(url);
    const data = await res.json();

    // Map ThingSpeak fields
    // field1 = dripRate, field2 = flowStatus (1/0), field3 = bloodDetected (1/0)
    const dripRate      = Math.max(0, parseFloat(data.field1) || 0);
    // If drip rate is 0 dpm, flow MUST be Stopped
    const flowStatus    = (dripRate === 0 || data.field2 !== '1') ? 'Stopped' : 'Running';
    const bloodDetected = data.field3 === '1';

    return {
      dripRate: parseFloat(dripRate.toFixed(1)),
      flowStatus,
      bloodDetected,
      timestamp: data.created_at ? new Date(data.created_at).getTime() : Date.now(),
      isReal: true
    };
  } catch (err) {
    console.warn('ThingSpeak fetch failed, reporting Stopped:', err);
    return simulateReading(patientId || 'default');
  }
}

// ── Default zero/stopped sensor reading when hardware is offline ──
function simulateReading(patientId = 'default') {
  return {
    dripRate: 0.0,
    flowStatus: 'Stopped',
    bloodDetected: false,
    timestamp: Date.now(),
    isReal: false
  };
}

// ── Determine alert status from reading ──────────
// Critical: blood detected OR drip stopped
// Warning:  drip rate too high
// Normal:   everything ok
function getAlertStatus(reading) {
  if (reading.bloodDetected)             return 'critical';
  if (reading.flowStatus === 'Stopped')  return 'critical';
  if (reading.dripRate > 65)             return 'warning';
  return 'normal';
}

// ── Get alert messages list ───────────────────────
function getAlertMessages(reading) {
  const msgs = [];
  if (reading.bloodDetected)
    msgs.push({ type: 'backflow',     text: '🩸 Blood Backflow Detected!' });
  if (reading.flowStatus === 'Stopped')
    msgs.push({ type: 'drip_stopped', text: '🚫 Drip Stopped!' });
  if (reading.dripRate > 65)
    msgs.push({ type: 'high_rate',    text: '⚡ High Drip Rate!' });
  return msgs;
}