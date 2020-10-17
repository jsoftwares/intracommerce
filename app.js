const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const errorController = require('./controllers/errors');

//get a DB connection - mongoConnection is d function in database.js that connects to our DB
const mongoConnection = require('./utils/database').mongoConnection;

const User = require('./models/user');



const app = express();
app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));

// We user a middleware here to add a user to our request
app.use((req, res, next) => {
	User.findById('5f805f828a672e40d8ef72e0')
	.then(user => {
		//here we add new keys to the user data and store in our request
		req.user = new User(user.name, user.email, user.cart, user._id);
		next();
	}).catch(err => console.log(err));
})

app.use(adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);


//REM mongoConnection() in database.js takes a callback
mongoConnection( () => {
	app.listen(3000);
})