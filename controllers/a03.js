/**
 * A03:2025 – Software Supply Chain Failures
 * Vulnerabilidades demostradas:
 *   - package.json fija una versión de js-yaml con CVE conocido (carga insegura de YAML)
 *   - yaml.load() sin schema seguro permite ejecución de código vía el tag !!js/function
 *   - Instalador de "plugins" simulado sin verificación de hash/firma
 *   - Detección de dependencias vulnerables vía `npm audit`
 */
const { execFile } = require('child_process');
const path = require('path');
const yaml = require('js-yaml'); // BUG: versión 3.13.0, fijada a propósito en package.json

const SAMPLE_YAML = 'name: MiApp\nversion: 1.0\ndebug: true';

function index(req, res) {
  res.render('a03/index', { title: 'A03 · Fallos en la Cadena de Suministro' });
}

// ── VULNERABLE: yaml.load() sin esquema seguro (CVE-2019-15891 style) ────────
function parseConfig(req, res) {
  let result = null;
  let error = null;
  if (req.method === 'POST') {
    const configText = req.body.config || '';
    try {
      // BUG: permite construir objetos/funciones arbitrarias vía !!js/function
      const parsed = yaml.load(configText);
      if (typeof parsed === 'function') {
        // BUG: la app trata el valor parseado como un "hook" ejecutable —
        // exactamente el paso que convierte la deserialización insegura en RCE real.
        const output = parsed();
        result = `[función construida por YAML e INVOCADA por la app]\n${parsed.toString()}\n\n→ valor de retorno: ${output}`;
      } else {
        result = JSON.stringify(parsed, null, 2);
      }
    } catch (e) {
      error = e.message;
    }
  }
  res.render('a03/parse-config', {
    title: 'A03 · YAML inseguro', result, error, sample: SAMPLE_YAML
  });
}

// ── TOOL: ejecuta `npm audit` para encontrar dependencias vulnerables ────────
function audit(req, res) {
  execFile('npm', ['audit', '--json'], { cwd: path.join(__dirname, '..'), timeout: 60000 },
    (err, stdout, stderr) => {
      const output = stdout || stderr || (err ? err.message : '');
      res.render('a03/audit', { title: 'A03 · npm audit', output });
    });
}

// ── VULNERABLE: instalador de plugins simulado sin verificación de integridad ─
const PLUGIN_REGISTRY = {
  logger: { version: '1.2', hash: null, url: 'http://plugins.internal/logger.tgz' },
  reporter: { version: '2.0', hash: null, url: 'http://plugins.internal/reporter.tgz' }
};

function installPluginForm(req, res) {
  res.render('a03/install-plugin', { title: 'A03 · Instalar plugin', pluginRegistry: PLUGIN_REGISTRY, message: null });
}

function installPluginSubmit(req, res) {
  const name = req.body.plugin || '';
  const plugin = PLUGIN_REGISTRY[name];
  let message;
  if (plugin) {
    // BUG: no se verifica ningún hash ni firma antes de "instalar"
    message = `Instalando '${name}' v${plugin.version} desde ${plugin.url} — ¡SIN verificación de integridad!`;
  } else {
    message = `Plugin '${name}' no encontrado.`;
  }
  res.render('a03/install-plugin', { title: 'A03 · Instalar plugin', pluginRegistry: PLUGIN_REGISTRY, message });
}

module.exports = { index, parseConfig, audit, installPluginForm, installPluginSubmit };
