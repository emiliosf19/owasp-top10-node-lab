/**
 * A04:2025 – Cryptographic Failures
 * Vulnerabilidades:
 *   - Contraseñas almacenadas como MD5 sin sal (trivialmente crackeable)
 *   - Datos "cifrados" con base64 (que es codificación, no cifrado)
 *   - Token de sesión débil basado en MD5 predecible
 */
const crypto = require('crypto');
const { getDb } = require('../db/database');
const { md5Hash, fakeEncrypt, fakeDecrypt, weakToken } = require('../lib/crypto-helpers');

const STATIC_SALT = 'static_salt_2024'; // BUG: sal estática y conocida

function index(req, res) {
  res.render('a04/index', { title: 'A04 · Fallos Criptográficos' });
}

function showHashes(req, res) {
  const db = getDb();
  const users = db.prepare('SELECT id, username, password_hash FROM a04_users').all();
  res.render('a04/hashes', { title: 'A04 · Hashes almacenados', users });
}

function loginForm(req, res) {
  res.render('a04/login', { title: 'A04 · Login', result: null });
}

function loginSubmit(req, res) {
  const { username = '', password = '' } = req.body;
  const db = getDb();
  // BUG: comparación con MD5 sin sal
  const hash = md5Hash(password);
  const user = db.prepare('SELECT * FROM a04_users WHERE username = ? AND password_hash = ?').get(username, hash);
  let result;
  if (user) {
    result = {
      status: 'success',
      user: username,
      secretNote: user.secret_note,
      sessionToken: weakToken(username, STATIC_SALT),
      tokenNote: 'Token = MD5(username + static_salt) — predecible'
    };
  } else {
    result = { status: 'fail', message: 'Credenciales inválidas' };
  }
  res.render('a04/login', { title: 'A04 · Login', result });
}

function storeForm(req, res) {
  res.render('a04/store', { title: 'A04 · "Cifrado" en base64', encoded: null, decoded: null });
}

function storeSubmit(req, res) {
  const { action, data = '' } = req.body;
  let encoded = null;
  let decoded = null;
  if (action === 'encode') {
    encoded = fakeEncrypt(data);
  } else if (action === 'decode') {
    try {
      decoded = fakeDecrypt(data);
    } catch {
      decoded = 'base64 inválido';
    }
  }
  res.render('a04/store', { title: 'A04 · "Cifrado" en base64', encoded, decoded });
}

function hashToolForm(req, res) {
  res.render('a04/hash-tool', { title: 'A04 · Herramienta de hash', result: null });
}

function hashToolSubmit(req, res) {
  const value = req.body.value || '';
  const result = {
    input: value,
    md5: crypto.createHash('md5').update(value).digest('hex'),
    sha1: crypto.createHash('sha1').update(value).digest('hex'),
    sha256: crypto.createHash('sha256').update(value).digest('hex')
  };
  res.render('a04/hash-tool', { title: 'A04 · Herramienta de hash', result });
}

module.exports = {
  index, showHashes, loginForm, loginSubmit, storeForm, storeSubmit, hashToolForm, hashToolSubmit
};
