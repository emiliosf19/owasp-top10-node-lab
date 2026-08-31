/* Punto de entrada de `npm run seed` — reinicializa la base de datos manualmente. */
const { initDb } = require('./database');

initDb();
console.log('[+] Base de datos inicializada con datos de práctica.');
