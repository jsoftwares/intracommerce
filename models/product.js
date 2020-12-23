// const mongoose = require('mongoose')
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
	title: {
		type: String,
		required: true
	},
	price: {
		type: Number,
		required: true
	},
	description: {
		type: String,
		required: true
	},
	imageUrl: String,
	userId: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: true
	}
});

module.exports = mongoose.model('Product', productSchema);



// const mongodb = require('mongodb');
// const getDB = require('../utils/database').getDB;

// class Product {

// 	constructor(title, price, description, imageUrl, id, userId)
// 	{
// 		this.title = title;
// 		this.price = price;
// 		this.description = description;
// 		this.imageUrl = imageUrl;
// 		this._id = id ? new mongodb.ObjectId(id) : null;
// 		this.userId = userId;
// 	}

// 	save()
// 	{
// 		const db = getDB();	//invote d function that gives us access to our DB; function is imported above.
// 		let dbOp;
// 		if (this._id) {
// 			dbOp = db.collection('products').updateOne({_id: this._id}, {$set: this});
// 		}else {
// 			dbOp = db.collection('products').insertOne(this);
// 		}
// 		return dbOp
// 			.then(result => {
// 				console.log(result)
// 			})
// 			.catch(err => console.log(err));
// 	}

// 	static fetchAll()
// 	{
// 		const db = getDB();
// 		*find() doesnt immediately return a promise but a cursor; a cursor is an object provided by mongoDB that allows u
// 		*goes tru returned documents/records step-by-step, becos theoritical in a collection, find() could 
// 		*return millions of documents & you do not want to transfer them over d wire all at once. So instead
// 		*find() gives u a handle that you can use to eg parginate d documents; hence mongoDB can give you a
// 		*count of documents at a time. toArray() method can be used to turn all documents into a JS array. It
// 		*advisable to use toArray() only when d documents returned are around 100, else use pagination
// 		* 
// 		return db.collection('products').find().toArray()
// 			.then( products => {
// 				console.log(products);
// 				return products;
// 			}).catch( err => console.log(err));
// 	}

// 	static findById(productId)
// 	{
// 		const db = getDB();
// 		return db.collection('products').find({_id: new mongodb.ObjectId(productId)}).next()
// 			.then( product => {
// 				return product;
// 			}).catch( err => console.log(err));
// 	}

// 	static deleteById(productId)
// 	{
// 		const db = getDB();
// 		return db.collection('products').deleteOne({_id:new mongodb.ObjectId(productId)})
// 			.then( result => {
// 				console.log('PRODUCT DELETED');
// 			}).catch( err => console.log(err));
// 	}
// }

// module.exports = Product;