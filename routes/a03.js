const express = require('express');
const router = express.Router();
const controller = require('../controllers/a03');

router.get('/', controller.index);
router.get('/parse-config', controller.parseConfig);
router.post('/parse-config', controller.parseConfig);
router.get('/audit', controller.audit);
router.get('/install-plugin', controller.installPluginForm);
router.post('/install-plugin', controller.installPluginSubmit);

module.exports = router;
