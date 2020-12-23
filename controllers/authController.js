const crypto = require('crypto');

const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');

const config = require('../utils/development.json');

const transporter = nodemailer.createTransport(sendgridTransport({
	auth: {
		api_key: config.sendgridKEY
	}
}) );

const { validationResult } = require('express-validator');

const User = require('../models/user');


const errorHandler  = (err, next) => {
    const error = new Error(err);
    error.httpStatusCode = 500;     //we can add fields to our error
    return next(error);
};

exports.getSignup = (req, res, next) => {

	let message = req.flash('error');
	if (message.length > 0) {
		message = message[0];
	}else {
		message = null;
	}
	res.render('auth/signup', {
		pageTitle: 'Create an Account',
		route: '/signup',
		errorMessage: message,
		oldInput: {
	      	name: '',
	      	email:'',
	      	password: '',
	      	confirmPassword: ''
	      },
	      validationErrors: []
	});
};

exports.postSignup = (req, res,next) => {
	const name = req.body.name.toUpperCase();
	const email = req.body.email.toLowerCase();
	const password = req.body.password;

	//check for form validation error
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).render('auth/signup', {
	      path: '/signup',
	      pageTitle: 'Signup',
	      route: 'signup',
	      errorMessage: errors.array(),/**.map(err => err.msg)**/
	      oldInput: {
	      	name: req.body.name,
	      	email:req.body.email,
	      	password: password,
	      	confirmPassword: req.body.confirmPassword
	      },
	      validationErrors: errors.array()

	    });
	}

	// check if a user with email already exist (moved to route validation)
	
	/**hash user password before storing to DB. hash() method takes the password to be hashed and a salt
	the salt value define how many rounds of hashing will be ran on the password; the higher the value, the
	longer it will take to hash it but the more secure it will be. 12 is accepted as highly secured. 
	bcrypt.hash() is an asynchronous task & give us a promise. We return it so that we can chain a 
	then() call where we recieve the hash PWD,    **/
	bcrypt.hash(password, 12)
		.then( hashedPassword => {
			const user = new User({
				name: name,
				email: email,
				password: hashedPassword,
				cart: { items: [] }
			});
			return user.save();
		})
			.then( result => {
				res.redirect('/login');
				// Send signup confirmation email
				return transporter.sendMail({
					to: email,
					from: 'IbeGadget<sales@ibegadget.com>',
					subject: 'Signup Successful',
					html: `<p>Dear ${name},<br> You have Successfully signuped at ExxonLocal Store.<br>Happy Shopping.</p>`
				});
		}).catch( err => {
            console.log(err);
            errorHandler(err, next);
        });
};

exports.getLogin = (req, res, next) => {

	let message = req.flash('error');
	let success = req.flash('success');

	if (message.length > 0) {
		message = message[0];
	}else{
		message = null;
	}
	if (success.length > 0) {
		success = success[0];
	}else{
		success = null;
	}

	res.render('auth/login', {
		pageTitle: 'Login',
		route: '/login',
		errorMessage: message,
		successMessage: success,
		oldInput: {
			email: '',
			password: ''
		}
	});
};

exports.postLogin = (req, res, next) => {
	const email = req.body.email.toLowerCase();
	const password = req.body.password;

	const errors = validationResult(req);
  	if (!errors.isEmpty()) {
	    return res.status(422).render('auth/login', {
	      route: '/login',
	      pageTitle: 'Login',
	      errorMessage: errors.array()[0].msg,
	      oldInput: {
	        email: email,
	        password: password
	      },
	      validationErrors: errors.array()
	    });
  }

	//Look in users in DB if a user with the entered email was exist
	User.findOne({email: email})
	.then( user => {
		if (!user) {
			return res.status(422).render('auth/login', {
				route: '/login',
	          	pageTitle: 'Login',
	          	errorMessage: 'Invalid email or password.',
	          	successMessage: null,
	          	oldInput: {
		            email: email,
		            password: ''
	          	},
	          	validationErrors: []
			});
		}
		
	/**compare() takes d PWD supplied & does a match taking into consideration the algorithm
	that was used to hash d user PWD during sign up, it gives us a promise which returns a boolean
	of true if d match is reasonable enough or false if it is not   **/
		bcrypt.compare(password, user.password)
			.then( doMatch => {
				if (doMatch) {
					req.session.isLoggedIn = true;
					req.session.user = user;
					/**we don't neccessarily need to call save() session, but you do so if you only want to proceed with
					redirect when d session keys(isLoggedIn & user in our case) u set have been persisted to your store.
					This is true in our case bcos we use isLoggedIn to control what menus show if a user is 
					uathenticated or not **/
					return req.session.save( err => {
						if (err) {
							console.log(err);
						}
						res.redirect('/admin/products');
					});
				}
				//else: ie doMatch returns false
				return res.status(422).render('auth/login', {
					route: '/login',
		          	pageTitle: 'Login',
		          	errorMessage: 'Invalid email or password.',
		          	successMessage: null,
		          	oldInput: {
		            email: email,
		            password: password
		          	},
		          	validationErrors: []
				});
			})
			.catch( err => {
	            console.log(err);
	            errorHandler(err, next);
        	});
	})
	.catch( err => console.log(err));	
};

exports.postLogout = (req, res, next) => {
	req.session.destroy( err => {
		if (err) {
			console.log(err);
		}
		res.redirect('/');
	})
};

exports.getResetPassword = (req, res, next) => {
	let message = req.flash('error');
	if (message.length > 0) {
		message = message[0];
	}else {
		message = null;
	}
	res.render('auth/password-reset', {
		pageTitle: 'Reset Password',
		route: '/reset',
		errorMessage: message
	})
};

/**we use Node crypto package randomBytes() method to generate a secure, unique random byte of 32, it takes
a callback as d 2nd argument which return either an error & a buffer of d generated bytes once its done.
if no err, we then create our token from the buffer by chaining toString() & passing it HEX, bcos d buffer 
will store hexadecimal value & HEX is d info toString() needs to convert hex value to ASCII characters
**/
exports.postResetPassword = (req, res, next) => {
	// const email = req.body.email;
	let accountName;
	crypto.randomBytes(32, (err, buffer) => {
		if (err) {
			console.log(err);
			return res.redirect('/reset-password');
		}
		const token = buffer.toString('hex');
		User.findOne({email: req.body.email.toLowerCase()})
			.then(user => {
				if (!user) {
					req.flash('error', 'No account with this email was found.');
					return res.redirect('/reset-password');
				}
				accountName = user.name;
				//add token date to users record
				user.resetToken = token;
				user.resetTokenExpiration = Date.now() + 3600000;	//1 hour in milliseconds 60*60*1000
				return user.save();
			})
				.then(result => {
					res.redirect('/');
					//send an email with password reset link.
					transporter.sendMail({
						to: req.body.email,
						from: 'IbeGadget<sales@ibegadget.com>',
						subject: 'Password Reset',
						html: `</p>Hello ${accountName},<br> 
						You have requested to reset the password for your ExxonLocal Store account.
						<p>Kindly click this link <a href="http://localhost:3000/reset/${token}">RESET</a> to change your password.</p>
						<p>Ignore this emaill if you did not make this request.</p>`
					});
				})
			.catch( err => {
	            console.log(err);
	            errorHandler(err, next);
        	});
	})
};


exports.getNewPassword = (req, res, next) => {
	const token = req.params.token;

	//We find a user with d supplied token and whose resetTokenExpiration date/time exceeds current time
	User.findOne({resetToken: token, resetTokenExpiration: {$gt: Date.now() }})
		.then(user => {
			if (!user) {
				return res.redirect('/');
			}

			let message = req.flash('error');
			if (message.length > 0) {
				message = message[0];
			}else {
				message = null;
			}
			res.render('auth/new-password', {
				pageTitle: 'New Password',
				route: '/reset',
				userId: user._id.toString(),
				passwordToken: token,
				errorMessage: message
			})

		})
		.catch(err => console.log(err));
};


exports.postNewPassword = (req, res, next) => {
	const newPassword = req.body.password;
	const userId = req.body.userId;
	const passwordToken = req.body.passwordToken;
	let resetUser;

	/**find user where resetToken=what we passed to form body andresetTokenExpiration > current date/time
	and userId=userId we passed to form body **/
	User.findOne({resetToken: passwordToken, resetTokenExpiration: {$gt:Date.now()}, _id: userId})
		.then( user => {
			if (!user) {
				// req.flash('error', 'Something went wrong.');
				return res.redirect('/');
			}

			resetUser = user;
			return bcrypt.hash(newPassword, 12);

		})
			.then( hashedPassword => {
				resetUser.password = hashedPassword;
				resetUser.resetToken = undefined;
				resetUser.resetTokenExpiration = undefined;
				return resetUser.save();
			})
				.then(result => {
					req.flash('success', 'Password reset successful.');
					res.redirect('/login');
				})
		.catch( err => {
            console.log(err);
            errorHandler(err, next);
        });

}

