const express = require('express');
const router  = express.Router();
const checkAuth = require('./../middlewares');

const balanceController = require('./../controllers/balance.controller');
router.use(checkAuth);
router.get('/',balanceController.getBalance)
router.put('/',balanceController.updateBalance)
module.exports = router; 