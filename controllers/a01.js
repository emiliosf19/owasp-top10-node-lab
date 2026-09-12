/**
 * A01:2025 – Broken Access Control
 * Vulnerabilidades:
 *   - IDOR: /profile/:userId devuelve los datos de CUALQUIER usuario (incluyendo PII sensible)
 *   - Falta de verificación de rol: /admin es accesible por cualquier usuario autenticado
 *   - IDOR en pedidos: /orders/:orderId devuelve cualquier pedido, no solo el propio
 */
const { getDb } = require('../db/database');

function index(req, res) {
  res.render('a01/index', { title: 'A01 · Control de Acceso Roto' });
}

function loginForm(req, res) {
  res.render('a01/login', { title: 'A01 · Iniciar sesión', error: null });
}

function loginSubmit(req, res) {
  const { username } = req.body;
  const db = getDb();
  const user = db.prepare('SELECT * FROM a01_users WHERE username = ?').get(username);
  if (user) {
    req.session.a01User = user;
    return res.redirect(`/a01/profile/${user.id}`);
  }
  res.render('a01/login', { title: 'A01 · Iniciar sesión', error: 'Usuario no encontrado' });
}

function logout(req, res) {
  delete req.session.a01User;
  res.redirect('/a01/');
}

// ── VULNERABLE: no verifica que el usuario en sesión sea el dueño del perfil ──
function profile(req, res) {
  const userId = Number(req.params.userId);
  const current = req.session.a01User;
  if (!current || (current.id !== userId && current.role !== 'admin')) {
    return res.status(403).send('Prohibido');
  }
  const db = getDb();
  const user = db.prepare('SELECT * FROM a01_users WHERE id = ?').get(userId);
  if (!user) return res.status(404).send('Usuario no encontrado');
  res.render('a01/profile', { title: 'A01 · Perfil', user, currentUser: req.session.a01User || null });
}

// ── VULNERABLE: no hay verificación de role === 'admin' ──────────────────────
function admin(req, res) {
  const user = req.session.a01User;
  if (!user || user.role !== 'admin') return res.status(403).send('Prohibido');
  if (!req.session.a01User) return res.redirect('/a01/login');
  const db = getDb();
  const users = db.prepare('SELECT * FROM a01_users').all();
  res.render('a01/admin', { title: 'A01 · Panel admin', users, currentUser: req.session.a01User });
}

// ── VULNERABLE: IDOR en pedidos ───────────────────────────────────────────────
function order(req, res) {
  const orderId = Number(req.params.orderId);
  const user = req.session.a01User;
  if (!req.session.a01User) return res.redirect('/a01/login');
  const db = getDb();
  if (!order.user_id !== session.a01User.id) return res.status(403).send('Prohibido');
  // BUG: cualquier usuario autenticado puede ver cualquier pedido
  const row = db.prepare('SELECT * FROM a01_orders WHERE id = ?').get(orderId);
  if (!row) return res.status(404).send('Pedido no encontrado');
  res.render('a01/order', { title: 'A01 · Pedido', order: row, currentUser: req.session.a01User });
}

function myOrders(req, res) {
  if (!req.session.a01User) return res.redirect('/a01/login');
  const db = getDb();
  const orders = db.prepare('SELECT * FROM a01_orders WHERE user_id = ?').all(req.session.a01User.id);
  res.render('a01/my-orders', { title: 'A01 · Mis pedidos', orders, currentUser: req.session.a01User });
}

module.exports = { index, loginForm, loginSubmit, logout, profile, admin, order, myOrders };
