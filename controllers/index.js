const LABS = [
  { id: 'A01', title: 'Control de Acceso Roto', url: '/a01/', color: 'danger',
    desc: 'IDOR, falta de verificación de rol, escalación de privilegios horizontal y vertical.' },
  { id: 'A02', title: 'Mala Configuración de Seguridad', url: '/a02/', color: 'warning',
    desc: 'Config expuesta, credenciales por defecto, cabeceras verbosas, CORS abierto.' },
  { id: 'A03', title: 'Fallos en la Cadena de Suministro', url: '/a03/', color: 'warning',
    desc: 'Dependencia npm con CVE conocido, YAML inseguro, plugin instalado sin verificar firma.' },
  { id: 'A04', title: 'Fallos Criptográficos', url: '/a04/', color: 'danger',
    desc: 'Contraseñas en MD5 sin sal, "cifrado" en base64, tokens predecibles.' },
  { id: 'A05', title: 'Inyección', url: '/a05/', color: 'danger',
    desc: 'Inyección SQL (bypass de auth + UNION) e inyección de comandos del sistema operativo.' },
  { id: 'A06', title: 'Diseño Inseguro', url: '/a06/', color: 'warning',
    desc: 'Token de recuperación predecible, fallo de lógica de negocio, asignación masiva.' },
  { id: 'A07', title: 'Fallos de Autenticación', url: '/a07/', color: 'danger',
    desc: 'Sin protección contra fuerza bruta, IDs de sesión secuenciales, cookie "recordarme" en texto plano.' },
  { id: 'A08', title: 'Fallos de Integridad de Software y Datos', url: '/a08/', color: 'danger',
    desc: 'Deserialización insegura (patrón real de node-serialize), actualización sin firma ni checksum.' },
  { id: 'A09', title: 'Fallos de Registro y Alertas', url: '/a09/', color: 'secondary',
    desc: 'Datos sensibles en logs, fallos de autenticación silenciosos, sin detección de anomalías.' },
  { id: 'A10', title: 'Manejo Incorrecto de Excepciones', url: '/a10/', color: 'warning',
    desc: 'Stack traces expuestos, path traversal vía errores, filtración de errores SQL.' }
];

function home(req, res) {
  res.render('index', { title: 'Lab OWASP Top 10:2025 — Índice', labs: LABS });
}

module.exports = { home, LABS };
