const express = require('express');
const router = express.Router();
const controller = require('../controllers/a07');

router.get('/', controller.index);
router.get('/login', controller.loginForm);
router.post('/login', controller.loginSubmit);
router.get('/profile', controller.profile);
router.get('/logout', controller.logout);

module.exports = router;
