const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const errorController = require('./controllers/errors');

const mongoose = require('mongoose');

const User = require('./models/user');



const app = express();
app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));

// We user a middleware here to add a user to our request
// app.use((req, res, next) => {
// 	User.findById('5f805f828a672e40d8ef72e0')
// 	.then(user => {
// 		//here we add new keys to the user data and store in our request
// 		req.user = new User(user.name, user.email, user.cart, user._id);
// 		next();
// 	}).catch(err => console.log(err));
// })

app.use(adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);


mongoose.connect('mongodb+srv://jeffonochie:Audr3y321@cluster0.x6ez3.mongodb.net/localshopv2?retryWrites=true&w=majority', 
	{useNewUrlParser: true, useUnifiedTopology: true})
.then( () => {
	app.listen(3000);
})