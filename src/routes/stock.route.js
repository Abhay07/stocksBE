const express = require('express');
const router  = express.Router();
const checkAuth = require('./../middlewares');

const stockController = require('./../controllers/stock.controller');
router.use(checkAuth);
router.get('/search',stockController.searchStock)
router.get('/:symbol',stockController.getStockQuote)
router.get('/',stockController.getStock)
router.put('/',stockController.updateStock)
router.delete('/',stockController.deleteStock)
module.exports = router; 