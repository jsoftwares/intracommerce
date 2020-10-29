const path = require('path');

const express = require('express');

const adminController = require('../controllers/adminController');

const router = express.Router();

const isAuth = require('../middleware/is-auth');

// router.get('/', adminController.getProducts);

router.get('/admin/products', isAuth, adminController.getProducts);

router.get('/add-product', isAuth, adminController.createProduct);

router.post('/add-product', isAuth, adminController.storeProduct);

router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);

router.post('/update-product', isAuth, adminController.updateProduct);

router.post('/delete-product', isAuth, adminController.postDeleteProduct);


module.exports = router;