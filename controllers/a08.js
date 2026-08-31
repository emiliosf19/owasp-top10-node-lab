/**
 * A08:2025 – Software and Data Integrity Failures
 * Vulnerabilidades:
 *   - Deserialización insegura: acepta un payload base64 con el patrón real del
 *     CVE-2017-5941 de `node-serialize` → RCE (ver lib/unsafe-deserialize.js)
 *   - Sin verificación de hash/firma en las "actualizaciones de software"
 */
const { unsafeDeserialize, buildRcePayload, serialize } = require('../lib/unsafe-deserialize');

// Manifiesto de actualización simulado, sin firma
const UPDATE_MANIFEST = {
  version: '2.1.0',
  url: 'http://updates.internal/app-2.1.0.tar.gz',
  sha256: null, // BUG: checksum nulo — nunca se verifica
  signature: null
};

function index(req, res) {
  res.render('a08/index', { title: 'A08 · Fallos de Integridad de Software y Datos' });
}

// ── VULNERABLE: deserialización de datos no confiables → RCE ─────────────────
function deserializeForm(req, res) {
  const safeObj = { user: 'alice', role: 'admin' };
  const payloadHint = Buffer.from(serialize(safeObj), 'utf8').toString('base64');
  res.render('a08/deserialize', { title: 'A08 · Deserialización insegura', result: null, error: null, payloadHint });
}

function deserializeSubmit(req, res) {
  const raw = req.body.data || '';
  let result = null;
  let error = null;
  try {
    const decoded = Buffer.from(raw, 'base64').toString('utf8');
    // BUG: deserializa datos controlados por el atacante
    const obj = unsafeDeserialize(decoded);
    result = JSON.stringify(obj);
  } catch (e) {
    error = e.message;
  }
  res.render('a08/deserialize', { title: 'A08 · Deserialización insegura', result, error, payloadHint: null });
}

// ── VULNERABLE: actualización aplicada sin verificar hash ni firma ───────────
function updateForm(req, res) {
  res.render('a08/update', { title: 'A08 · Actualización sin firmar', manifest: UPDATE_MANIFEST, message: null });
}

function updateSubmit(req, res) {
  const version = req.body.version || '';
  // BUG: no hay verificación de hash ni de firma
  const message = `Aplicando actualización v${version} desde ${UPDATE_MANIFEST.url} — verificación de integridad OMITIDA (sha256=null, signature=null)`;
  res.render('a08/update', { title: 'A08 · Actualización sin firmar', manifest: UPDATE_MANIFEST, message });
}

// ── Ayuda: genera un payload malicioso (fines de concientización defensiva) ──
function generatePayloadForm(req, res) {
  res.render('a08/generate-payload', { title: 'A08 · Generar payload', payload: null, command: '' });
}

function generatePayloadSubmit(req, res) {
  const command = req.body.command || 'id';
  const payload = buildRcePayload(command);
  res.render('a08/generate-payload', { title: 'A08 · Generar payload', payload, command });
}

module.exports = {
  index, deserializeForm, deserializeSubmit, updateForm, updateSubmit,
  generatePayloadForm, generatePayloadSubmit
};
