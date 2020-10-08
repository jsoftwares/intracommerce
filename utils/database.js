const mongodb = require('mongodb');	//give us us access to d mongodb package
const MongoClient = mongodb.MongoClient;	//extract MongoClient constructor from mongodb package


let _db;

//Using d MongoClient to connect to mongoDB database, connect() returns a promise. this function connects
//to d DD & storing d connection.
const mongoConnection = callback => {
	MongoClient.connect('mongodb+srv://jeffonochie:Audr3y321@cluster0.x6ez3.mongodb.net/localshop?retryWrites=true&w=majority'
	)
	.then(client => {	//d client object returned gives us access to our database
		console.log('CONNECTED');
		_db = client.db();	//store a connection to our DB in _db. u can also pass a DB name to .db('name') & this will overide d db in d connection string above
		callback();
	})
	.catch( err => {
		console(err);
		throw err;
	})
};

// this function returns access to the DB. It checks if a DB is set ie not undefined & return access to d DB or throw a msg
const getDB = () => {
	if (_db) 
	{
		return _db;
	}
	throw 'No database found!';
};



exports.mongoConnection = mongoConnection;
exports.getDB = getDB;