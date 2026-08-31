const express = require('express');
const router = express.Router();
const controller = require('../controllers/a08');

router.get('/', controller.index);
router.get('/deserialize', controller.deserializeForm);
router.post('/deserialize', controller.deserializeSubmit);
router.get('/update', controller.updateForm);
router.post('/update', controller.updateSubmit);
router.get('/generate-payload', controller.generatePayloadForm);
router.post('/generate-payload', controller.generatePayloadSubmit);

module.exports = router;
