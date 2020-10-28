const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
	name: {
		type: String,
		required: true
	},
	email: {
		type: String,
		required: true
	},
	password: {
		type: String,
		required: true
	},
	cart: {
		items: [
			{
				productId: {type: Schema.Types.ObjectId, ref:'Product', required: true},
				quantity: {type: Number, required: true}
			}
		]
	}
});

userSchema.methods.addToCart = function(product) {
		// check if product is already in cart
		// IF yes upate quantity of product
		// ELSE add new product with qty of 1 to cart
		const cartProductIndex = this.cart.items.findIndex( cp => {
			return cp.productId.toString() === product._id.toString();	
			//since we are matching both type & value (===), productId & product._id are not of same type event if they look same, so we had to convert them to string
		});
		let newQuantity = 1;
		const updatedCartItems = [...this.cart.items];	//copy user current cart items property

		// if the item is already in the user cart
		if (cartProductIndex >= 0)
		{
			newQuantity = this.cart.items[cartProductIndex].quantity + 1;	//update the product quantity by one
			updatedCartItems[cartProductIndex].quantity = newQuantity;
		}else
		{
			updatedCartItems.push({
				productId: product._id,
				quantity:newQuantity
			});
		}	

		const updatedCart = {items: updatedCartItems};
		this.cart = updatedCart;
		return this.save();
		
		
}

userSchema.methods.removeFromCart = function(productId) {
	const newCartItems = [...this.cart.items].filter( item => {
		return item.productId.toString() !== productId.toString();
	});

	this.cart.items = newCartItems;
	return this.save();
}

userSchema.methods.clearCart = function() {
	this.cart = {items: []};
	return this.save();
}


module.exports = mongoose.model('User', userSchema);


// const mongodb = require('mongodb');
// const getDB = require('../utils/database').getDB;

// const ObjectId = mongodb.ObjectId;	//storing reference to mongoObjectId so we can invoke it below

// class User {
// 	constructor(name, email, cart, id)
// 	{
// 		this.name = name;
// 		this.email = email;
// 		this.cart = cart; //{items:[]}
// 		this._id = id;
// 	}

// 	save()
// 	{
// 		const db = getDB();
// 		return db.collection('users').insertOne(this);

// 	}

// 	static findById(userId)
// 	{
// 		const db = getDB();
// 		return db.collection('users').findOne({_id:new ObjectId(userId)});
// 	}

// // USER CART
// 	addToCart(product)
// 	{
// 		// check if product is already in cart
// 		// IF yes upate quantity of product
// 		// ELSE add product with qty of 1 to cart
// 		const cartProductIndex = this.cart.items.findIndex( cp => {
// 			return cp.productId.toString() === product._id.toString();	
// 			//since we are matching both type & value (===), productId & product._id are not of same type event if they look same, so we had to convert them to string
// 		});
// 		let newQuantity = 1;
// 		const updatedCartItems = [...this.cart.items];	//copy user current cart items property

// 		if (cartProductIndex >= 0)
// 		{
// 			newQuantity = this.cart.items[cartProductIndex].quantity + 1;	//update quantity variable by one
// 			updatedCartItems[cartProductIndex].quantity = newQuantity;
// 		}else
// 		{
// 			updatedCartItems.push({
// 				productId: new ObjectId(product._id),
// 				quantity:newQuantity
// 			});
// 		}	

// 		//We dont want to store all product into bcos eg if d price changes in product collect, we would have wrong price for d product in d user cart
// 		// const updatedCart = cart: {item:[{...product, quantity:1 }]}
// 		// const updatedCart = {items: [{productId: new ObjectId(product._id), quantity:1}]};

// 		const updatedCart = {items: updatedCartItems};
// 		const db = getDB();
// 		return db.collection('users').updateOne({_id: new ObjectId(this._id)}, {$set:{
			
// 			cart: updatedCart
// 			}});
// 	}

// 	getCart()
// 	{
		
// 		//get user cart items, loop through the items to get product info from ID

// 		//map takes an array an return another array with elements that meets our condition in return, in
// 		//this case we turn a new array with only the productId property of elements in original array
// 		const productIds = this.cart.items.map(item => {
// 			return item.productId;
// 		});

// 		const db = getDB();
// 		return db.collection('products').find({_id: {$in: productIds} }).toArray()
// 		.then( products => {
// 			return products.map(p => {
// 				return {...p, quantity: this.cart.items.find( item => {
// 						return item.productId.toString() === p._id.toString();
// 					}).quantity
// 				};
// 			})
// 		});
		

// 	}

// 	deleteCartItem(productId)
// 	{
// 		const newCartItems = [...this.cart.items].filter( item => {
// 			return item.productId.toString() !== productId.toString();
// 		});

// 		const db = getDB();
// 		return db.collection('users').updateOne({
// 			_id: new ObjectId(this._id)}, 
// 			{$set: {cart: {items:newCartItems}} });

// 	}

// // USER ORDERS

// 	//addOrder will not take any argument bcos the cart which is already embedded in the user document 
// 	//has items that would form the order.
// 	addOrder()
// 	{
// 		const db = getDB();

// 		return this.getCart()	//returns user-cart products with full details & quatities
// 		.then( products => {
// 			const order = {
// 				items: products,
// 				user: {
// 					_id: new ObjectId(this._id),
// 					name: this.name
// 				}
// 			};

// 			return db.collection('orders').insertOne(order);
// 		})
// 		.then(result => {
// 			this.cart = {items: []};

// 			return db.collection('users').updateOne(
// 				{_id : new ObjectId(this._id)}, 
// 				{$set: {cart : {items: []} }}
// 				);
// 		}).catch(err => console.log(err));
// 	}

// 	getOrders()
// 	{
// 		const db = getDB();

// 		return db.collection('orders').find({'user._id': new ObjectId(this._id)}).toArray();
// 	}


// }

// module.exports = User;