const Sequelize = require('sequelize');
const sequelize = require('../utils/database');

// define is used to create a schema for a model
const Product = sequelize.define('product', {
	id: {
		type: Sequelize.INTEGER,
		autoIncrement: true,
		allowNull: false,
		primaryKey: true
	},
	title: {
		type: Sequelize.STRING,
		allowNull: false
	},
	price: {
		type: Sequelize.DOUBLE,
		allowNull: false
	},
	imageURL: Sequelize.STRING,
	description: {
		type: Sequelize.STRING,
		allowNull: false
	}
});

module.exports = Product;