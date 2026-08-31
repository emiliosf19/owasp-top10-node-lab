/**
 * A09:2025 — Security Logging and Alerting Failures
 *
 * Dos loggers con winston (una librería usada correctamente en cualquier stack
 * Node.js "de verdad") para mostrar que la herramienta no es el problema:
 * el problema es qué decides escribir en el log.
 *   - badLogger:  registra credenciales y datos sensibles en texto plano.
 *   - goodLogger: registra eventos de seguridad sin datos sensibles, con nivel adecuado.
 */
const path = require('path');
const winston = require('winston');

const LOG_DIR = path.join(__dirname, '..', 'logs');

const badLogger = winston.createLogger({
  level: 'debug',
  format: winston.format.printf(({ level, message, timestamp }) => `${timestamp} ${level.toUpperCase()} ${message}`),
  transports: [
    new winston.transports.File({
      filename: path.join(LOG_DIR, 'bad_app.log'),
      format: winston.format.combine(winston.format.timestamp(), winston.format.printf(
        ({ level, message, timestamp }) => `${timestamp} ${level.toUpperCase()} ${message}`
      ))
    })
  ]
});

const goodLogger = winston.createLogger({
  level: 'info',
  transports: [
    new winston.transports.File({
      filename: path.join(LOG_DIR, 'good_app.log'),
      format: winston.format.combine(winston.format.timestamp(), winston.format.printf(
        ({ level, message, timestamp }) => `${timestamp} ${level.toUpperCase()} ${message}`
      ))
    })
  ]
});

module.exports = { badLogger, goodLogger, LOG_DIR };
