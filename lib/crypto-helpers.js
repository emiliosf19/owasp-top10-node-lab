const crypto = require('crypto');

function md5Hash(value) {
  return crypto.createHash('md5').update(String(value)).digest('hex');
}

/** BUG (A04): base64 es codificación, no cifrado. Cualquiera puede revertirlo. */
function fakeEncrypt(data) {
  return Buffer.from(String(data), 'utf8').toString('base64');
}

function fakeDecrypt(token) {
  return Buffer.from(String(token), 'base64').toString('utf8');
}

/** BUG (A04/A06): token = MD5(entrada + sal estática) — predecible por cualquiera que lea el código fuente. */
function weakToken(input, staticSalt) {
  return md5Hash(`${input}${staticSalt}`);
}

module.exports = { md5Hash, fakeEncrypt, fakeDecrypt, weakToken };
