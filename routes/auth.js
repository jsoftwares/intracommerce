const authController = require('../controllers/authController');
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');	//we use {body} (destructuring) to retrieve only the body property which is a function from the list of functions available in the express-validator package.
const User = require('../models/user');


router.get('/login', authController.getLogin);

router.post('/login', [
	body('email')
		.isEmail().withMessage('Enter a valid email address.'),
	body('password')
		.trim(),
	], authController.postLogin);

router.post('/logout', authController.postLogout);

router.get('/signup', authController.getSignup);

router.post('/signup', [
		body('name')
			.isLength({min:5}).withMessage('Name must be minimum 5 characters long.'),
		body('email')
			.isEmail().withMessage('Enter a valid email address.')
			// .normalizeEmail()
			.custom( (value) => {
				return User.findOne({email: value.toLowerCase()})
				.then( userDoc => {
					if (userDoc) {
						return Promise.reject('E-mail is already in use.');
					}
				})

			}),
		body('password')
			.trim()
			.isLength({min:6}).withMessage('Password must be at least 6 characters.')
			.matches(/\d/).withMessage('Password must contain an integer.')
			.not().isIn(['123456', '654321', 'password']).withMessage('Password must not contain common words.'),
		body('confirmPassword')
			.trim()
			.custom( (value, {req}) => {
				if (value !== req.body.password) {
					throw new Error(' Passwords must match')
				}
				return true;
			})
	], authController.postSignup);

router.get('/reset-password', authController.getResetPassword);
router.post('/reset-password', authController.postResetPassword);
router.get('/reset/:token', authController.getNewPassword);
router.post('/new-password', [
	body('password')
		.trim()
		.isLength({min:6}).withMessage('Password must be at least 6 characters.')
		.matches(/\d/).withMessage('Password must contain an integer.')
		.not().isIn(['123456', '654321', 'password']).withMessage('Password must not contain common words.')
	], authController.postNewPassword);





module.exports = router;