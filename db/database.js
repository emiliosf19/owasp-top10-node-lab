const path = require('path');
const crypto = require('crypto');
const Database = require('better-sqlite3');
const config = require('config');

const DB_PATH = path.join(__dirname, config.get('database.file'));

let db = null;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
  }
  return db;
}

function md5(value) {
  return crypto.createHash('md5').update(value).digest('hex');
}

/**
 * Recrea el esquema y los datos de práctica desde cero.
 * Este es un laboratorio: el estado se reinicia en cada arranque a propósito.
 */
function initDb() {
  const conn = getDb();

  conn.exec(`
    DROP TABLE IF EXISTS a01_users;
    DROP TABLE IF EXISTS a01_orders;
    CREATE TABLE a01_users (
      id INTEGER PRIMARY KEY,
      username TEXT,
      email TEXT,
      phone TEXT,
      national_id TEXT,
      role TEXT DEFAULT 'user'
    );
    CREATE TABLE a01_orders (
      id INTEGER PRIMARY KEY,
      user_id INTEGER,
      item TEXT,
      amount REAL
    );
  `);
  const insA01Users = conn.prepare('INSERT INTO a01_users VALUES (?,?,?,?,?,?)');
  insA01Users.run(1, 'alice', 'alice@acme-corp.test', '+52 55 1000 0001', 'CURP-ALIC900101HDFR01', 'user');
  insA01Users.run(2, 'bob', 'bob@acme-corp.test', '+52 55 1000 0002', 'CURP-BOBX880202HDFR02', 'user');
  insA01Users.run(3, 'admin', 'admin@acme-corp.test', '+52 55 1000 0003', 'CURP-ADMN750303HDFR03', 'admin');

  const insA01Orders = conn.prepare('INSERT INTO a01_orders VALUES (?,?,?,?)');
  insA01Orders.run(1, 1, 'Teclado mecánico', 89.99);
  insA01Orders.run(2, 2, 'Monitor 27"', 259.99);
  insA01Orders.run(3, 3, 'Servidor NAS', 749.99);

  conn.exec(`
    DROP TABLE IF EXISTS a04_users;
    CREATE TABLE a04_users (
      id INTEGER PRIMARY KEY,
      username TEXT UNIQUE,
      password_hash TEXT,
      secret_note TEXT
    );
  `);
  const insA04 = conn.prepare('INSERT INTO a04_users VALUES (?,?,?,?)');
  insA04.run(1, 'alice', md5('password123'), 'El nombre de mi perro es Rex');
  insA04.run(2, 'bob', md5('bob123'), 'Contraseña root del servidor: toor');
  insA04.run(3, 'carol', md5('123456'), 'API key interna: sk-abc123xyz');

  conn.exec(`
    DROP TABLE IF EXISTS a05_users;
    DROP TABLE IF EXISTS a05_products;
    CREATE TABLE a05_users (
      id INTEGER PRIMARY KEY,
      username TEXT,
      password TEXT,
      role TEXT
    );
    CREATE TABLE a05_products (
      id INTEGER PRIMARY KEY,
      name TEXT,
      price REAL,
      category TEXT
    );
  `);
  const insA05Users = conn.prepare('INSERT INTO a05_users VALUES (?,?,?,?)');
  insA05Users.run(1, 'alice', 'alice_pass', 'user');
  insA05Users.run(2, 'admin', 'sup3r_s3cr3t', 'admin');

  const insA05Products = conn.prepare('INSERT INTO a05_products VALUES (?,?,?,?)');
  insA05Products.run(1, 'Laptop 14"', 999.99, 'Electrónica');
  insA05Products.run(2, 'Audífonos', 79.99, 'Electrónica');
  insA05Products.run(3, 'Escritorio', 299.99, 'Mobiliario');
  insA05Products.run(4, 'Silla ergonómica', 199.99, 'Mobiliario');

  conn.exec(`
    DROP TABLE IF EXISTS a06_users;
    CREATE TABLE a06_users (
      id INTEGER PRIMARY KEY,
      username TEXT UNIQUE,
      password TEXT,
      email TEXT,
      credits REAL DEFAULT 100.0,
      role TEXT DEFAULT 'user'
    );
  `);
  const insA06 = conn.prepare('INSERT INTO a06_users VALUES (?,?,?,?,?,?)');
  insA06.run(1, 'alice', 'alicepass', 'alice@acme-corp.test', 100.0, 'user');
  insA06.run(2, 'admin', 'adminpass', 'admin@acme-corp.test', 9999.0, 'admin');

  conn.exec(`
    DROP TABLE IF EXISTS a07_users;
    CREATE TABLE a07_users (
      id INTEGER PRIMARY KEY,
      username TEXT UNIQUE,
      password TEXT,
      role TEXT DEFAULT 'user'
    );
  `);
  const insA07 = conn.prepare('INSERT INTO a07_users VALUES (?,?,?,?)');
  insA07.run(1, 'alice', 'sunshine', 'user');
  insA07.run(2, 'admin', 'admin123', 'admin');
  insA07.run(3, 'bob', 'password', 'user');

  conn.exec(`
    DROP TABLE IF EXISTS a09_records;
    CREATE TABLE a09_records (
      id INTEGER PRIMARY KEY,
      username TEXT,
      record_id TEXT,
      action TEXT,
      timestamp TEXT
    );
  `);
  const insA09 = conn.prepare('INSERT INTO a09_records VALUES (?,?,?,?,?)');
  insA09.run(1, 'alice', 'CURP-ALIC900101HDFR01', 'update', '2026-01-10 09:00:00');
  insA09.run(2, 'bob', 'CURP-BOBX880202HDFR02', 'export', '2026-01-11 10:30:00');
  insA09.run(3, 'alice', 'CURP-ALIC900101HDFR01', 'delete-request', '2026-01-12 03:17:00');
}

module.exports = { getDb, initDb, md5 };
