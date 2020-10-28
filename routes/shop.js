const path = require('path');
const express = require('express');

const router = express.Router();
const isAuth = require('../middleware/is-auth');
const shopController = require('../controllers/shopController');

router.get('/', shopController.index);

router.get('/products', shopController.allProducts);

router.get('/products/:productId', shopController.showProduct);

router.get('/cart', isAuth, shopController.getCart);

router.post('/cart', isAuth, shopController.postCart);

router.post('/cart-delete-item', isAuth, shopController.postCartDeleteProduct);

router.get('/orders', isAuth, shopController.getOrders);
router.post('/create-order', isAuth, shopController.postOrder);

// router.get('/checkout', shopController.getCheckout);

module.exports = router;