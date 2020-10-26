const path = require('path');
const express = require('express');

const router = express.Router();

const shopController = require('../controllers/shopController');

router.get('/', shopController.index);

router.get('/products', shopController.allProducts);

router.get('/products/:productId', shopController.showProduct);

router.get('/cart', shopController.getCart);

router.post('/cart', shopController.postCart);

router.post('/cart-delete-item', shopController.postCartDeleteProduct);

router.get('/orders', shopController.getOrders);
router.post('/create-order', shopController.postOrder);

// router.get('/checkout', shopController.getCheckout);

module.exports = router;