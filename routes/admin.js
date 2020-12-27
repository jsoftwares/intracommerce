const path = require('path');

const express = require('express');
const {body} = require('express-validator');

const adminController = require('../controllers/adminController');

const router = express.Router();

const isAuth = require('../middleware/is-auth');

// router.get('/', adminController.getProducts);

router.get('/admin/products', isAuth, adminController.getProducts);

router.get('/admin/add-product', isAuth, adminController.createProduct);

router.post('/admin/add-product', isAuth, [
	body('title')
		.trim()
		.isString().withMessage('Title should contain only String.')
		.isLength({min: 3, max: 90}).withMessage('Title should be a between 3 to 90 characters.'),
	body('price', 'Price should be a floating value').isFloat(),
	body('shortDesc', 'Description should be a between 5 to 300 characters.').isLength({min:5, max:300}),
	], adminController.storeProduct);

router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);

router.post('/update-product', isAuth, [
	body('title')
		.trim()
		.isAscii().withMessage('Title should contain only String.')
		.isLength({min: 3, max: 90}).withMessage('Title should be a between 3 to 90 characters.'),
	body('price', 'Price should be a floating value').isFloat(),
	body('shortDesc', 'Description should be a between 5 to 300 characters.').isLength({min:5, max:300}),
	], adminController.updateProduct);

// router.post('/delete-product', isAuth, adminController.postDeleteProduct);
router.delete('/admin/product/:productId', isAuth, adminController.deleteProduct);


module.exports = router;