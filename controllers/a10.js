/**
 * A10:2025 – Mishandling of Exceptional Conditions
 * Vulnerabilidades:
 *   - Excepciones no controladas exponen el stack trace completo con rutas internas
 *   - Mensajes de error que revelan detalles de implementación (motor de BD, rutas, versiones)
 *   - Path traversal expuesto a través de una excepción no controlada
 *   - División por cero / errores de tipo exponen la estructura de la consulta
 * Compara /calculate-bad y /read-bad (filtran información) vs *-good (manejo seguro).
 */
const fs = require('fs');
const path = require('path');
const { getDb } = require('../db/database');

const STATIC_DIR = path.join(__dirname, '..', 'public');

function index(req, res) {
  res.render('a10/index', { title: 'A10 · Manejo Incorrecto de Excepciones' });
}

// ── VULNERABLE: excepción no controlada filtra el stack trace ────────────────
function calculateBad(req, res) {
  let result = null;
  let error = null;
  if (req.method === 'POST') {
    const { a, b } = req.body;
    try {
      const ai = parseInt(a, 10);
      const bi = parseInt(b, 10);
      if (Number.isNaN(ai) || Number.isNaN(bi)) throw new TypeError(`invalid literal for int(): a=${a}, b=${b}`);
      if (bi === 0) throw new RangeError('Division by zero');
      result = ai / bi;
    } catch (e) {
      // BUG: expone el stack trace crudo al cliente (simula un framework mal configurado)
      error = e.stack;
    }
  }
  res.render('a10/calculate-bad', { title: 'A10 · Calculadora (insegura)', result, error });
}

// ── SEGURO: error genérico, detalle solo en el log del servidor ──────────────
function calculateGood(req, res) {
  let result = null;
  let error = null;
  if (req.method === 'POST') {
    const { a, b } = req.body;
    const ai = parseInt(a, 10);
    const bi = parseInt(b, 10);
    if (Number.isNaN(ai) || Number.isNaN(bi)) {
      error = 'Ingresa números enteros válidos.';
    } else if (bi === 0) {
      error = 'No se puede dividir entre cero.';
    } else {
      result = ai / bi;
    }
  }
  res.render('a10/calculate-good', { title: 'A10 · Calculadora (segura)', result, error });
}

// ── VULNERABLE: path traversal + la excepción revela el sistema de archivos ──
function readBad(req, res) {
  const fileParam = req.query.file || 'sample.txt';
  let content = null;
  let error = null;
  try {
    // BUG: sin saneamiento — '../' navega fuera del directorio esperado
    const filePath = path.join(STATIC_DIR, fileParam);
    content = fs.readFileSync(filePath, 'utf8');
  } catch (e) {
    error = e.stack; // BUG: revela la ruta absoluta completa en el stack trace
  }
  res.render('a10/read-bad', { title: 'A10 · Lector de archivos (inseguro)', content, error, fileParam });
}

// ── SEGURO: ruta saneada, error genérico ──────────────────────────────────────
function readGood(req, res) {
  const fileParam = req.query.file || 'sample.txt';
  let content = null;
  let error = null;
  try {
    const safeDir = fs.realpathSync(STATIC_DIR);
    const safePath = path.resolve(safeDir, fileParam);
    if (!safePath.startsWith(safeDir + path.sep) && safePath !== safeDir) {
      throw new Error('ACCESS_DENIED');
    }
    content = fs.readFileSync(safePath, 'utf8');
  } catch (e) {
    if (e.message === 'ACCESS_DENIED') error = 'Acceso denegado.';
    else if (e.code === 'ENOENT') error = 'Archivo no encontrado.';
    else error = 'No se pudo leer el archivo.';
  }
  res.render('a10/read-good', { title: 'A10 · Lector de archivos (seguro)', content, error, fileParam });
}

// ── VULNERABLE: el mensaje de error SQL se expone directamente ───────────────
function queryBad(req, res) {
  const table = req.query.table || 'a05_products';
  let result = null;
  let error = null;
  try {
    const db = getDb();
    // BUG: revela la estructura de tablas/columnas en el mensaje de error
    const rows = db.prepare(`SELECT * FROM ${table}`).all();
    result = rows;
  } catch (e) {
    error = e.message; // BUG: "no such table: xyz" revela detalles internos de la BD
  }
  res.render('a10/query-bad', { title: 'A10 · Consulta (insegura)', result, error, table });
}

module.exports = { index, calculateBad, calculateGood, readBad, readGood, queryBad };
