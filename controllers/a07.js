/**
 * A07:2025 – Authentication Failures
 * Vulnerabilidades:
 *   - Sin protección contra fuerza bruta / bloqueo de cuenta
 *   - Token de sesión débil: entero secuencial guardado en una cookie
 *   - "Recordarme" guarda la contraseña en texto plano en una cookie
 *   - Sin MFA, sin exigencia de complejidad de contraseña
 *   - La sesión no se invalida al cerrar sesión (el token viejo sigue funcionando)
 */
const { getDb } = require('../db/database');

// "Almacén de sesiones" en memoria — id -> username. Secuencial = predecible.
const sessions = new Map();
let nextSid = 1;

function newSession(username) {
  const sid = nextSid++;
  sessions.set(sid, username);
  return sid;
}

function index(req, res) {
  res.render('a07/index', { title: 'A07 · Fallos de Autenticación', sessions: Object.fromEntries(sessions) });
}

// ── VULNERABLE: sin bloqueo, sin límite de tasa ───────────────────────────────
function loginForm(req, res) {
  res.render('a07/login', { title: 'A07 · Login', result: null });
}

function loginSubmit(req, res) {
  const { username = '', password = '', remember } = req.body;
  const db = getDb();
  const user = db.prepare('SELECT * FROM a07_users WHERE username = ? AND password = ?').get(username, password);
  if (user) {
    const sid = newSession(username);
    res.cookie('session_id', String(sid));
    if (remember) {
      // BUG: contraseña en texto plano dentro de la cookie
      res.cookie('remember_me', `${username}:${password}`, { maxAge: 86400 * 30 * 1000 });
    }
    return res.render('a07/dashboard', {
      title: 'A07 · Panel', user, sid, sessions: Object.fromEntries(sessions)
    });
  }
  res.render('a07/login', { title: 'A07 · Login', result: { status: 'fail', message: 'Credenciales inválidas' } });
}

// ── VULNERABLE: token de sesión adivinable por fuerza bruta ───────────────────
function profile(req, res) {
  const sidCookie = req.cookies.session_id || '';
  const remember = req.cookies.remember_me || '';
  let username = null;

  if (sidCookie && /^\d+$/.test(sidCookie)) {
    username = sessions.get(Number(sidCookie));
  }

  if (!username && remember) {
    // BUG: auto-login a partir de una cookie en texto plano
    const parts = remember.split(':');
    if (parts.length === 2) {
      const [uname, pwd] = parts;
      const db = getDb();
      const user = db.prepare('SELECT * FROM a07_users WHERE username = ? AND password = ?').get(uname, pwd);
      if (user) username = uname;
    }
  }

  if (!username) return res.redirect('/a07/login');

  const db = getDb();
  const user = db.prepare('SELECT * FROM a07_users WHERE username = ?').get(username);
  res.render('a07/profile', {
    title: 'A07 · Perfil', user: user || {}, sid: sidCookie, sessions: Object.fromEntries(sessions)
  });
}

// ── VULNERABLE: logout no invalida el token ───────────────────────────────────
function logout(req, res) {
  // BUG: no elimina el sid de `sessions` — el token viejo sigue siendo válido
  res.clearCookie('session_id');
  res.redirect('/a07/');
}

module.exports = { index, loginForm, loginSubmit, profile, logout };
