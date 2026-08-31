/**
 * A06:2025 – Insecure Design
 * Vulnerabilidades:
 *   - Recuperación de contraseña con token predecible: MD5(username + sal estática)
 *   - Sin límite de tasa en ninguna operación sensible
 *   - Fallo de lógica de negocio: cantidad negativa reduce el total (crédito para el atacante)
 *   - Asignación masiva: /update-profile acepta cualquier campo, incluido 'role' o 'credits'
 */
const { getDb } = require('../db/database');
const { weakToken } = require('../lib/crypto-helpers');

const RESET_SALT = 'corp2024'; // BUG: sal estática y conocida

const CART_ITEMS = [
  { name: 'Laptop 14"', price: 999.99 },
  { name: 'Audífonos', price: 79.99 }
];

function index(req, res) {
  res.render('a06/index', { title: 'A06 · Diseño Inseguro' });
}

function loginForm(req, res) {
  res.render('a06/login', { title: 'A06 · Login', error: null });
}

function loginSubmit(req, res) {
  const { username = '', password = '' } = req.body;
  const db = getDb();
  const user = db.prepare('SELECT * FROM a06_users WHERE username = ? AND password = ?').get(username, password);
  if (user) {
    req.session.a06User = user;
    return res.render('a06/dashboard', { title: 'A06 · Panel', user });
  }
  res.render('a06/login', { title: 'A06 · Login', error: 'Credenciales inválidas' });
}

// ── VULNERABLE: token de recuperación predecible ──────────────────────────────
function forgotPasswordForm(req, res) {
  res.render('a06/forgot-password', { title: 'A06 · Recuperar contraseña', token: null, message: null });
}

function forgotPasswordSubmit(req, res) {
  const username = req.body.username || '';
  const db = getDb();
  const user = db.prepare('SELECT * FROM a06_users WHERE username = ?').get(username);
  let token = null;
  let message;
  if (user) {
    token = weakToken(username, RESET_SALT);
    message = `Enlace de recuperación enviado a ${user.email} (token mostrado aquí solo para la demo)`;
  } else {
    message = 'Usuario no encontrado';
  }
  res.render('a06/forgot-password', { title: 'A06 · Recuperar contraseña', token, message });
}

function resetPasswordForm(req, res) {
  res.render('a06/reset-password', { title: 'A06 · Restablecer contraseña', message: null });
}

function resetPasswordSubmit(req, res) {
  const { username = '', token = '', newPassword = '' } = req.body;
  const expected = weakToken(username, RESET_SALT);
  let message;
  if (token === expected) {
    const db = getDb();
    db.prepare('UPDATE a06_users SET password = ? WHERE username = ?').run(newPassword, username);
    message = `Contraseña de '${username}' restablecida correctamente.`;
  } else {
    message = 'Token inválido.';
  }
  res.render('a06/reset-password', { title: 'A06 · Restablecer contraseña', message });
}

// ── VULNERABLE: lógica de negocio — cantidad negativa ─────────────────────────
function cartForm(req, res) {
  res.render('a06/cart', { title: 'A06 · Carrito', items: CART_ITEMS, message: null, total: null });
}

function cartSubmit(req, res) {
  const itemName = req.body.item;
  const quantity = parseInt(req.body.quantity, 10) || 0;
  const item = CART_ITEMS.find((i) => i.name === itemName);
  const price = item ? item.price : 0;
  // BUG: no se valida que quantity > 0
  const total = price * quantity;
  const message = `Agregado ${quantity}× ${itemName} @ $${price.toFixed(2)} c/u. Subtotal: $${total.toFixed(2)}`;
  res.render('a06/cart', { title: 'A06 · Carrito', items: CART_ITEMS, message, total });
}

// ── VULNERABLE: asignación masiva ─────────────────────────────────────────────
const ALLOWED_COLUMNS = new Set(['password', 'email', 'credits', 'role']); // 'role' NO debería estar aquí

function updateProfileForm(req, res) {
  res.render('a06/update-profile', { title: 'A06 · Actualizar perfil', user: req.session.a06User || null, message: null });
}

function updateProfileSubmit(req, res) {
  if (!req.session.a06User) return res.status(401).send('No autenticado');
  const db = getDb();
  // BUG: acepta cualquier campo del body, incluido 'role' o 'credits'
  for (const [field, value] of Object.entries(req.body)) {
    if (field !== 'username' && ALLOWED_COLUMNS.has(field)) {
      db.prepare(`UPDATE a06_users SET ${field} = ? WHERE username = ?`).run(value, req.session.a06User.username);
    }
  }
  const updated = db.prepare('SELECT * FROM a06_users WHERE username = ?').get(req.session.a06User.username);
  req.session.a06User = updated;
  res.render('a06/update-profile', {
    title: 'A06 · Actualizar perfil', user: updated, message: `Perfil actualizado: ${JSON.stringify(updated)}`
  });
}

module.exports = {
  index, loginForm, loginSubmit,
  forgotPasswordForm, forgotPasswordSubmit,
  resetPasswordForm, resetPasswordSubmit,
  cartForm, cartSubmit,
  updateProfileForm, updateProfileSubmit
};
