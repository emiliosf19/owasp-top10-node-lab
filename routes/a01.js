const express = require('express');
const router = express.Router();
const controller = require('../controllers/a01');

router.get('/', controller.index);
router.get('/login', controller.loginForm);
router.post('/login', controller.loginSubmit);
router.get('/logout', controller.logout);
router.get('/profile/:userId', controller.profile);
router.get('/admin', controller.admin);
router.get('/orders/:orderId', controller.order);
router.get('/my-orders', controller.myOrders);

module.exports = router;
