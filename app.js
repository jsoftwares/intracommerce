// const http = require('http');
const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const errorController = require('./controllers/errors');

const sequelize = require('./utils/database');
const Product = require('./models/product');
const User = require('./models/user');
const Cart = require('./models/cart');
const CartItem = require('./models/cart-item');
const Order = require('./models/order');
const OrderItem = require('./models/order-item');

const app = express();
app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));

// We user a middleware here to add a user to our request
app.use((req, res, next) => {
	User.findByPk(1)
	.then(user => {
		req.user = user;	//user here is a sequelize object not just JS object so we can call methods like destroy on it
		next();
	}).catch(err => console.log(err));
})

app.use(adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);


Product.belongsTo(User, {constraint:true, onDelete:'CASCADE'});
User.hasMany(Product);
User.hasOne(Cart);
Cart.belongsTo(User);
Cart.belongsToMany(Product, {through: CartItem});
Product.belongsToMany(Cart, {through: CartItem});
User.hasMany(Order);
Order.belongsTo(User);
Order.belongsToMany(Product, {through: OrderItem});
Product.belongsToMany(Order, {through: OrderItem});
/** sync() take alot at all the Models you define & create tables for them if table does not not exist, 
 * we also want to start our app only after the tables are created. 
 **/

sequelize.sync()
// sequelize.sync({force:true})
	.then( result => {
		return User.findByPk(1);
	})
	.then(user => {
		if (!user) {
			return User.create({name: 'Jeffrey Onochie', email:'jeff.ict@gmail.com'})
		}

		return user;
	})
	.then(user => {
		return user.createCart();
		// app.listen(3000);
	})
	.then( cart =>{
		app.listen(3000);
	})
	.catch( err => console.log(err));


// const server = http.createServer(app);
// server.listen(3000);