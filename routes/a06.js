const express = require('express');
const router = express.Router();
const controller = require('../controllers/a06');

router.get('/', controller.index);
router.get('/login', controller.loginForm);
router.post('/login', controller.loginSubmit);
router.get('/forgot-password', controller.forgotPasswordForm);
router.post('/forgot-password', controller.forgotPasswordSubmit);
router.get('/reset-password', controller.resetPasswordForm);
router.post('/reset-password', controller.resetPasswordSubmit);
router.get('/cart', controller.cartForm);
router.post('/cart', controller.cartSubmit);
router.get('/update-profile', controller.updateProfileForm);
router.post('/update-profile', controller.updateProfileSubmit);

module.exports = router;
