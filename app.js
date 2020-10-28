const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');
const errorController = require('./controllers/errors');

const User = require('./models/user');

const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);

const MONGODB_URI = 'mongodb+srv://jeffonochie:Audr3y321@cluster0.x6ez3.mongodb.net/localshop';

const app = express();
const store = new MongoDBStore({
	uri: MONGODB_URI,
	collection: 'sessions'
});

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
	session({ secret:'enigMa2 5f8efab49e312810f33cad84', resave:false, saveUninitialized: false, store: store})
);

// We user a middleware here to add a user to our request, we get the userId from session which persist
//across diff request for a user
app.use((req, res, next) => {
	if (!req.session.user) {
		return next();	//if a session doesn;t exist in the req, dont find a user just transfer control to d next middleware
	}
	User.findById(req.session.user._id)
	.then(user => {
		//here we add new keys to the request data and store in our request
		req.user = user;
		next();
	}).catch(err => console.log(err));
})

app.use('/admin',adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);


mongoose.connect(MONGODB_URI, 
	{useNewUrlParser: true, useUnifiedTopology: true})
.then( () => {
	app.listen(3000);
}).catch(err => console.log(err));