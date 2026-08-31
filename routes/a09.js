const express = require('express');
const router = express.Router();
const controller = require('../controllers/a09');

router.get('/', controller.index);
router.get('/login-bad', controller.loginBadForm);
router.post('/login-bad', controller.loginBadSubmit);
router.get('/login-good', controller.loginGoodForm);
router.post('/login-good', controller.loginGoodSubmit);
router.get('/transfer-bad', controller.transferBadForm);
router.post('/transfer-bad', controller.transferBadSubmit);
router.get('/transfer-good', controller.transferGoodForm);
router.post('/transfer-good', controller.transferGoodSubmit);
router.get('/view-logs', controller.viewLogs);

module.exports = router;
