const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const errorController = require('./controllers/errors');

//get a DB connection - mongoConnection is d function in database.js that connects to our DB
const mongoConnection = require('./utils/database').mongoConnection;



const app = express();
app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));

// We user a middleware here to add a user to our request
app.use((req, res, next) => {
	// User.findByPk(1)
	// .then(user => {
	// 	req.user = user;	//user here is a sequelize object not just JS object so we can call methods like destroy on it
	// 	next();
	// }).catch(err => console.log(err));
	next();
})

app.use(adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);


//REM mongoConnection() in database.js takes a callback
mongoConnection( () => {
	app.listen(3000);
})