/**
 * A05:2025 – Injection
 * Vulnerabilidades:
 *   - Inyección SQL en login (bypass de autenticación con ' OR '1'='1)
 *   - Inyección SQL en búsqueda de productos (extracción de datos vía UNION)
 *   - Inyección de comandos del sistema operativo en una utilidad de ping
 */
const { exec } = require('child_process');
const { getDb } = require('../db/database');

function index(req, res) {
  res.render('a05/index', { title: 'A05 · Inyección' });
}

// ── VULNERABLE: inyección SQL en login ────────────────────────────────────────
function loginForm(req, res) {
  res.render('a05/login', { title: 'A05 · Login vulnerable a SQLi', result: null });
}

function loginSubmit(req, res) {
  const { username = '', password = '' } = req.body;
  const db = getDb();
  // BUG: interpolación de strings directa en el SQL — inyectable
  const query = `SELECT * FROM a05_users WHERE username = '${username}' AND password = '${password}'`;
  let result;
  try {
    const user = db.prepare(query).get();
    result = user
      ? { status: 'success', message: `Sesión iniciada como: ${user.username} (rol: ${user.role})`, query }
      : { status: 'fail', message: 'Credenciales inválidas', query };
  } catch (e) {
    result = { status: 'error', message: e.message, query };
  }
  res.render('a05/login', { title: 'A05 · Login vulnerable a SQLi', result });
}

// ── VULNERABLE: inyección SQL en búsqueda (ataque UNION) ──────────────────────
function searchForm(req, res) {
  res.render('a05/search', { title: 'A05 · Búsqueda vulnerable a SQLi', products: [], query: null });
}

function searchSubmit(req, res) {
  const term = req.body.term || '';
  const db = getDb();
  // BUG: interpolación directa — permite UNION SELECT sobre otras tablas
  const query = `SELECT id, name, price, category FROM a05_products WHERE name LIKE '%${term}%'`;
  let products = [];
  let queryUsed = query;
  try {
    products = db.prepare(query).all();
  } catch (e) {
    queryUsed = `ERROR: ${e.message} | Query: ${query}`;
  }
  res.render('a05/search', { title: 'A05 · Búsqueda vulnerable a SQLi', products, query: queryUsed });
}

// ── VULNERABLE: inyección de comandos del sistema operativo ───────────────────
function pingForm(req, res) {
  res.render('a05/ping', { title: 'A05 · Ping vulnerable a Command Injection', output: null, host: '' });
}

function pingSubmit(req, res) {
  const host = req.body.host || '';
  // BUG: exec() lanza una shell — ';', '&&' y '|' encadenan comandos arbitrarios
  exec(`ping -c 2 ${host}`, { timeout: 10000 }, (err, stdout, stderr) => {
    const output = err && !stdout ? (err.message + stderr) : (stdout + stderr);
    res.render('a05/ping', { title: 'A05 · Ping vulnerable a Command Injection', output, host });
  });
}

module.exports = { index, loginForm, loginSubmit, searchForm, searchSubmit, pingForm, pingSubmit };
