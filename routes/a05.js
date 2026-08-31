const express = require('express');
const router = express.Router();
const controller = require('../controllers/a05');

router.get('/', controller.index);
router.get('/login', controller.loginForm);
router.post('/login', controller.loginSubmit);
router.get('/search', controller.searchForm);
router.post('/search', controller.searchSubmit);
router.get('/ping', controller.pingForm);
router.post('/ping', controller.pingSubmit);

module.exports = router;
