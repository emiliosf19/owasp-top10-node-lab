# OWASP Top 10:2025 — Lab Node.js/Express

> **Laboratorio educativo de propósito general** — aplicación Node.js/Express
> deliberadamente vulnerable, pensada para enseñar el OWASP Top 10:2025 sin atarse a un
> solo dominio de negocio (los ejemplos cubren e-commerce, autenticación, administración
> interna, DevOps y utilidades de soporte).
>
> Ejecuta este laboratorio únicamente en entornos aislados (GitHub Codespaces, una VM
> local o un contenedor). **Nunca lo despliegues en un servidor público.**

## Inicio rápido

### GitHub Codespaces (recomendado)
1. Abre este repositorio en GitHub Codespaces.
2. El devcontainer instala las dependencias (`postCreateCommand`) y arranca el servidor
   automáticamente cada vez que el Codespace inicia o se reanuda (`postStartCommand`) —
   no necesitas escribir `npm start` a mano.
3. Cuando el puerto 3000 esté listo, Codespaces te ofrecerá abrirlo en el navegador
   automáticamente (o ábrelo tú desde la pestaña **Ports**, ícono del globo 🌐).

Si el arranque automático no aplica (por ejemplo, en un Codespace creado antes de este
cambio), corre manualmente `> Codespaces: Rebuild Container` desde la paleta de comandos
de VS Code — los cambios a `.devcontainer/devcontainer.json` solo toman efecto tras un
rebuild, no con solo reabrir el Codespace.

#### El puerto sale como "Private" y no abre / carga en blanco
- Revisa si el servidor realmente está corriendo: `cat /tmp/owasp-node-lab.log` (ahí queda
  la salida de `npm start` lanzado por `postStartCommand`). Debe aparecer
  `[+] OWASP Top 10:2025 Node Lab escuchando en http://localhost:3000`.
- "Private" es la visibilidad **por defecto** de Codespaces; no es un error. Como dueño
  del Codespace puedes abrirlo igual estando autenticado con la misma cuenta de GitHub en
  el navegador. Si el preview embebido de VS Code da problemas (cookies/iframe), ábrelo en
  una pestaña normal del navegador en vez del "Simple Browser".
- Si prefieres forzarlo a público, clic derecho sobre la fila del puerto 3000 en la
  pestaña **Ports** → **Port Visibility** → **Public** (el devcontainer ya lo declara
  público por defecto, pero eso solo aplica desde la creación del Codespace).
- Si el log muestra un error al arrancar: `better-sqlite3` es un módulo nativo y en
  arquitecturas poco comunes puede fallar su instalación — corre
  `npm rebuild better-sqlite3` y luego `npm start` a mano para reintentar.

### Local
```bash
npm install
npm run seed     # opcional: la app también siembra la BD al arrancar
npm start        # o: npm run dev (con recarga en caliente vía nodemon)
# Abre http://localhost:3000
```

## Estructura del laboratorio

| ID | Vulnerabilidad | Ataques clave |
|----|-----------------|----------------|
| [A01](http://localhost:3000/a01/) | Control de Acceso Roto | IDOR, falta de verificación de rol |
| [A02](http://localhost:3000/a02/) | Mala Configuración de Seguridad | Config expuesta, credenciales por defecto |
| [A03](http://localhost:3000/a03/) | Fallos en la Cadena de Suministro | Dependencia con CVE, YAML inseguro, plugin sin firmar |
| [A04](http://localhost:3000/a04/) | Fallos Criptográficos | MD5 sin sal, "cifrado" en base64, token predecible |
| [A05](http://localhost:3000/a05/) | Inyección | Inyección SQL, inyección de comandos del SO |
| [A06](http://localhost:3000/a06/) | Diseño Inseguro | Token predecible, cantidad negativa, asignación masiva |
| [A07](http://localhost:3000/a07/) | Fallos de Autenticación | Fuerza bruta, sesión secuencial, cookie en texto plano |
| [A08](http://localhost:3000/a08/) | Fallos de Integridad de Software y Datos | Deserialización insegura (RCE), actualización sin firma |
| [A09](http://localhost:3000/a09/) | Fallos de Registro y Alertas | Datos sensibles en logs, fallos silenciosos |
| [A10](http://localhost:3000/a10/) | Manejo Incorrecto de Excepciones | Stack trace expuesto, path traversal, error SQL filtrado |

## Cómo usarlo

Cada módulo tiene:
1. **Página de índice** — explica la vulnerabilidad y lista los retos.
2. **Endpoints vulnerables** — código real y roto, listo para explotar.
3. **Endpoints corregidos** (donde aplica) — comparación lado a lado con la corrección.
4. **Solución guiada** — en `/solutions/a01` a `/solutions/a10`.

### Orden recomendado
Trabaja A01 → A10 en secuencia; varios módulos reutilizan conceptos previos.

### Herramientas sugeridas
```bash
# Peticiones HTTP
curl -s -X POST http://localhost:3000/a05/login -d "username=admin&password=' OR '1'='1"

# Simulación de fuerza bruta
for pw in password sunshine 123456; do
  curl -s -X POST http://localhost:3000/a07/login -d "username=alice&password=$pw"
done

# Auditoría de dependencias
npm audit

# Crackeo de hashes (A04)
hashcat -a 0 -m 0 hashes.txt /usr/share/wordlists/rockyou.txt
```

## Arquitectura

Sigue el patrón `app → routes → controllers` de `express-generator`, con SQLite
(`better-sqlite3`) como almacén de datos de práctica:

```
owasp-top10-node-lab/
├── .devcontainer/devcontainer.json   # Config de GitHub Codespaces
├── app.js                            # App factory estilo express-generator
├── bin/www                           # Arranque del servidor HTTP
├── config/                           # default.json / production.json (paquete `config`)
├── db/
│   ├── database.js                   # Esquema + datos semilla (better-sqlite3)
│   └── seed.js                       # `npm run seed`
├── lib/
│   ├── crypto-helpers.js             # MD5/base64/token débil (A04, A06)
│   ├── unsafe-deserialize.js         # Patrón real de node-serialize (A08)
│   └── loggers.js                    # Loggers winston bueno/malo (A09)
├── controllers/                      # Lógica de cada módulo (a01.js … a10.js, index.js)
├── routes/                           # Enrutamiento HTTP → controlador
├── views/                            # Plantillas Pug (tema oscuro compartido)
├── public/                           # Estáticos (CSS, sample.txt para A10)
├── solutions/                        # Soluciones guiadas (a01.md … a10.md)
├── logs/                             # Generado en runtime por A09
└── test/                             # Pruebas de humo (jest + supertest)
```

### Buenas prácticas aplicadas en el andamiaje
- Separación estricta `routes` (enrutamiento) → `controllers` (lógica) → `db`/`lib`.
- Consultas parametrizadas en **todo** el código excepto en los endpoints marcados con
  `// BUG:` — la inyección es la lección, no un descuido general.
- Configuración vía el paquete `config` (nunca secretos hardcodeados fuera de los labs
  que enseñan exactamente ese fallo).
- Manejo de errores centralizado en `app.js`; A10 documenta explícitamente dónde y por qué
  sus endpoints `*-bad` se saltan ese manejo a propósito.
- Cada archivo vulnerable trae comentarios `// BUG:` (qué falla) y `// FIXED:`/`// SEGURO:`
  en su contraparte corregida.

## Reiniciar el laboratorio
```bash
rm db/lab.db && npm start
```

## Referencias
- [OWASP Top 10:2025](https://owasp.org/Top10/2025/)
- [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
- [PortSwigger Web Security Academy](https://portswigger.net/web-security)

## Uso ético
Este laboratorio es exclusivamente para fines educativos, en el entorno aislado provisto.
Queda prohibido aplicar estas técnicas sobre sistemas reales sin autorización explícita
por escrito.
