const express = require('express');
const router = express.Router();
const controller = require('../controllers/a04');

router.get('/', controller.index);
router.get('/hashes', controller.showHashes);
router.get('/login', controller.loginForm);
router.post('/login', controller.loginSubmit);
router.get('/store', controller.storeForm);
router.post('/store', controller.storeSubmit);
router.get('/hash-tool', controller.hashToolForm);
router.post('/hash-tool', controller.hashToolSubmit);

module.exports = router;
