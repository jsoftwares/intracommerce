const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const csrf = require('csurf');
const flash = require('connect-flash');
const multer = require('multer');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

const errorController = require('./controllers/errorsController');

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

const csrfProtection = csrf();

/** our storage config 4 multer will be a config of d "diskStorage()" function accessible on multer. diskStorage() takes 2 functions as arguments
which defines multer will handle incoming file upload request. Each argument function take as argument d request,
file objects & a callback u have to call once you're done setting up both of them. The callback take 1st argument
is an error msg we throw to inform multer that sth is wrong with d incoming file & it should not store it. We pass
"NULL" bcos we want to tell multer that its okay to store it. D 2nd argument for DESTINATION is d path we want 
to store the file.
**/
const fileStorage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, './images/')
	},
	filename: (req, file, cb) => {
		//using replace() below bcos dev machine OS (windows) does not support ':' in file names
		const name = new Date().toISOString().replace(/[-T:\.Z]/g,'-') + '_' + file.originalname
		cb(null,  name);
	}
});

//if file mimetype is not in d supported list, multer will not upload the file hence req.file will be undefined
//We call d callback to accept or reject uploaded file depending on if we support that file type
const fileFilter = (req, file, cb) => {
	if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
		cb(null, true);
	}else{
		cb(null, false);
	}
}

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(express.static('public'));
app.use('/images', express.static('images')); //we also serve our images folder statically. We say if we have a request for '/images' then server this folder statically
//To inititalize multer we execute multer & call a function its execution that defines if u expect a single or multiple files in the upload, then we pass the form input name. We use storage to configure how multer stores our upload
app.use(multer({storage:fileStorage, fileFilter:fileFilter}).single('image'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
	session({ secret:'enigMa2 5f8efab49e312810f33cad84', resave:false, saveUninitialized: false, store: store})
);
app.use(csrfProtection);
app.use(flash());

// We use this middleware here to add a user to our request, we get the userId from session which exist
//across diff request for a user
app.use((req, res, next) => {
	if (!req.session.user) {
		return next();	//if a session doesn't exist in the req, dont find a user just transfer control to d next middleware
	}
	User.findById(req.session.user._id)
	.then(user => {
		if (!user) {
			return next(); //exit the middleware if user in undefined
		}
		//here we store d found mongoose USER object with the keys 'user' in the request stream
		req.user = user;
		next();
	})
	.catch(err => {
		next(new Error(err));
	});
})

//Using locals to add variables that should be sent to all views for all requests using this middleware
app.use((req, res, next) => {
	res.locals.isAuthenticated = req.session.isLoggedIn;
	res.locals.csrfToken = req.csrfToken();
	next();
})

app.use(adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

// app.get('/500', errorController.get500);

app.use(errorController.get404);

/**Normally one would expect that this middleware cannot be reached because we have our catch all 404 middle-
ware just above, but Express also knows a specail middleware called - Error handling middleware which it invokes
when we call next(error) in our code and pass error as argument to it **/
// app.use( (error, req, res, next) => {
//  return res.redirect('/500');
// })



mongoose.connect(MONGODB_URI, 
	{useNewUrlParser: true, useUnifiedTopology: true})
.then( () => {
	app.listen(3000);
}).catch(err => console.log(err));