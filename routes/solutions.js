const express = require('express');
const router = express.Router();
const controller = require('../controllers/solutions');

router.get('/:lab', controller.show);

module.exports = router;
