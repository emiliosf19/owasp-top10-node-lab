const express = require('express');
const router = express.Router();
const controller = require('../controllers/a10');

router.get('/', controller.index);
router.get('/calculate-bad', controller.calculateBad);
router.post('/calculate-bad', controller.calculateBad);
router.get('/calculate-good', controller.calculateGood);
router.post('/calculate-good', controller.calculateGood);
router.get('/read-bad', controller.readBad);
router.get('/read-good', controller.readGood);
router.get('/query-bad', controller.queryBad);

module.exports = router;
