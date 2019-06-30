const express = require('express');
const router  = express.Router();

const baseController = require('./../controllers/base.controller');
router.post('/login',baseController.login)
router.post('/register',baseController.register)
module.exports = router; 