/**
 * A02:2025 – Security Misconfiguration
 * Vulnerabilidades:
 *   - /config filtra toda la configuración de la app, incluido el secreto de sesión
 *   - /backup.cfg expone un archivo de respaldo con credenciales
 *   - Credenciales por defecto nunca rotadas en /login
 *   - Cabeceras verbosas que revelan la pila tecnológica
 *   - /api/data sin restricción de CORS
 */
const config = require('config');

const DEFAULT_CREDS = { admin: 'admin', operator: 'operator123' };

const BACKUP_CONTENT = `
[database]
host=localhost
port=5432
name=internal_records
user=db_admin
password=Pr0d_S3cr3t!

[smtp]
host=smtp.acme-corp.test
user=noreply@acme-corp.test
password=EmailP@ss2024

[api]
maps_api_key=AIzaFAKE_MAPS_KEY_FOR_TRAINING_0000
aws_access_key=AKIAFAKEACCESSKEYHERE
aws_secret=fAkEsEcReTkEyFoReDuCaTiOn
`.trim();

function index(req, res) {
  res.render('a02/index', { title: 'A02 · Mala Configuración de Seguridad' });
}

// ── VULNERABLE: expone toda la configuración de la app ───────────────────────
function showConfig(req, res) {
  // BUG: config.util.toObject() incluye el secreto de sesión y otros valores sensibles
  res.json(config.util.toObject());
}

// ── VULNERABLE: expone un archivo de respaldo con credenciales ───────────────
function backup(req, res) {
  res.type('text/plain').send(BACKUP_CONTENT);
}

// ── VULNERABLE: login con credenciales por defecto, sin bloqueo ──────────────
function loginForm(req, res) {
  res.render('a02/login', { title: 'A02 · Login', message: null });
}

function loginSubmit(req, res) {
  const { username = '', password = '' } = req.body;
  let message;
  if (DEFAULT_CREDS[username] === password) {
    message = `LOGIN SUCCESS — Bienvenido, ${username}! (rol: admin)`;
  } else {
    message = 'Credenciales inválidas';
  }
  res.render('a02/login', { title: 'A02 · Login', message });
}

// ── VULNERABLE: sin restricción de CORS, filtra detalles internos ────────────
function apiData(req, res) {
  res.set('Access-Control-Allow-Origin', '*');
  res.json({
    internal_users: ['alice', 'bob', 'admin'],
    server_version: '1.4.2-SNAPSHOT',
    environment: config.get('env'),
    db_connection: 'sqlite:///lab.db'
  });
}

// ── VULNERABLE: cabeceras que revelan la pila tecnológica exacta ─────────────
function verboseHeaders(req, res, next) {
  res.set('X-Powered-By', 'Express/4.19.2 Node/20');
  res.set('X-Debug-Mode', String(config.get('env') === 'development'));
  res.set('Server', 'Apache/2.4.50 (Ubuntu)'); // spoofeado, pero error típico
  next();
}

module.exports = { index, showConfig, backup, loginForm, loginSubmit, apiData, verboseHeaders };
