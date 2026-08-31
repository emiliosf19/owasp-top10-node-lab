const express = require('express');
const router = express.Router();
const controller = require('../controllers/a02');

// BUG (A02): estas cabeceras verbosas solo deberían existir en un entorno
// mal configurado — aquí se aplican a propósito a todo el módulo /a02.
router.use(controller.verboseHeaders);

router.get('/', controller.index);
router.get('/config', controller.showConfig);
router.get('/backup.cfg', controller.backup);
router.get('/login', controller.loginForm);
router.post('/login', controller.loginSubmit);
router.get('/api/data', controller.apiData);

module.exports = router;
