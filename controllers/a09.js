/**
 * A09:2025 – Security Logging and Alerting Failures
 * Demuestra:
 *   - Registro de datos sensibles (contraseñas, identificadores) en texto plano
 *   - Ausencia de registro de intentos de autenticación fallidos
 *   - Sin alertas ante acciones anómalas
 * Compara /transfer-bad (inseguro) vs /transfer-good (corregido).
 */
const fs = require('fs');
const path = require('path');
const { getDb } = require('../db/database');
const { badLogger, goodLogger, LOG_DIR } = require('../lib/loggers');

function index(req, res) {
  res.render('a09/index', { title: 'A09 · Fallos de Registro y Alertas' });
}

// ── VULNERABLE: registra la contraseña en texto plano ─────────────────────────
function loginBadForm(req, res) {
  res.render('a09/login-bad', { title: 'A09 · Login (log inseguro)', result: null });
}

function loginBadSubmit(req, res) {
  const { username = '', password = '' } = req.body;
  // BUG: registra credenciales en texto plano
  badLogger.debug(`LOGIN ATTEMPT user=${username} password=${password} ip=${req.ip}`);
  const db = getDb();
  const user = db.prepare('SELECT * FROM a07_users WHERE username = ? AND password = ?').get(username, password);
  let result;
  if (user) {
    badLogger.info(`LOGIN SUCCESS user=${username}`);
    result = { status: 'success', user: username };
  } else {
    // BUG: no se registra el fallo — fallo de autenticación silencioso
    result = { status: 'fail' };
  }
  res.render('a09/login-bad', { title: 'A09 · Login (log inseguro)', result });
}

// ── SEGURO: logs saneados, eventos de fallo registrados ───────────────────────
function loginGoodForm(req, res) {
  res.render('a09/login-good', { title: 'A09 · Login (log seguro)', result: null });
}

function loginGoodSubmit(req, res) {
  const { username = '', password = '' } = req.body;
  const db = getDb();
  const user = db.prepare('SELECT * FROM a07_users WHERE username = ? AND password = ?').get(username, password);
  let result;
  if (user) {
    goodLogger.info(`AUTH_SUCCESS username=${username} ip=${req.ip}`);
    result = { status: 'success', user: username };
  } else {
    // FIXED: registra el fallo sin exponer la contraseña
    goodLogger.warn(`AUTH_FAILURE username=${username} ip=${req.ip}`);
    result = { status: 'fail' };
  }
  res.render('a09/login-good', { title: 'A09 · Login (log seguro)', result });
}

// ── VULNERABLE: sin alertas ante una transferencia sospechosa ─────────────────
function transferBadForm(req, res) {
  const db = getDb();
  const records = db.prepare('SELECT * FROM a09_records').all();
  res.render('a09/transfer-bad', { title: 'A09 · Transferencia (log inseguro)', records, message: null });
}

function transferBadSubmit(req, res) {
  const username = req.body.username || 'alice';
  const recordId = req.body.recordId || '';
  // BUG: registra el identificador sensible completo, sin alerta por volumen/horario
  badLogger.info(`RECORD_TRANSFER user=${username} record_id=${recordId}`);
  const db = getDb();
  const records = db.prepare('SELECT * FROM a09_records').all();
  res.render('a09/transfer-bad', {
    title: 'A09 · Transferencia (log inseguro)', records, message: `Registro transferido para ${username}.`
  });
}

// ── SEGURO: identificador enmascarado, detección de anomalías ────────────────
function transferGoodForm(req, res) {
  const db = getDb();
  const records = db.prepare('SELECT * FROM a09_records').all();
  res.render('a09/transfer-good', { title: 'A09 · Transferencia (log seguro)', records, message: null, alert: null });
}

function transferGoodSubmit(req, res) {
  const username = req.body.username || 'alice';
  const recordId = req.body.recordId || '';
  const masked = recordId.length >= 4 ? `****${recordId.slice(-4)}` : '****';
  const hour = new Date().getHours();

  // FIXED: solo se registra el identificador enmascarado
  goodLogger.info(`RECORD_TRANSFER user=${username} record_id=${masked} ip=${req.ip}`);

  let alert = null;
  if (hour < 6 || hour > 22) {
    goodLogger.warn(`OFF_HOURS_TRANSFER user=${username} hour=${hour}`);
    alert = 'Alerta: transferencia fuera de horario marcada para revisión.';
  }

  const db = getDb();
  const records = db.prepare('SELECT * FROM a09_records').all();
  res.render('a09/transfer-good', {
    title: 'A09 · Transferencia (log seguro)', records,
    message: `Registro transferido para ${username} (id ${masked}).`, alert
  });
}

function viewLogs(req, res) {
  const logs = {};
  for (const fname of ['bad_app.log', 'good_app.log']) {
    const fpath = path.join(LOG_DIR, fname);
    try {
      logs[fname] = fs.readFileSync(fpath, 'utf8');
    } catch {
      logs[fname] = '(vacío — aún no hay eventos)';
    }
  }
  res.render('a09/view-logs', { title: 'A09 · Ver logs', logs });
}

module.exports = {
  index, loginBadForm, loginBadSubmit, loginGoodForm, loginGoodSubmit,
  transferBadForm, transferBadSubmit, transferGoodForm, transferGoodSubmit, viewLogs
};
