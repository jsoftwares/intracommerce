const { validationResult } = require('express-validator');

const Product = require('../models/product');


const errorHandler  = err => {
    const error = new Error(err);
    error.httpStatusCode = 500;     //we can add fields to our error
    return next(error);
    /**When we call next with an argument, we actually let Express know that an arror occurred & 
    it will skip all other middleware & move right-away to an error handling middleware. We will
    define this at the bottom of our APP.JS 
    NOTE: to throw this error inside of SYNCHRONOUS code, we can use 'throw new Error('Error MSG')
    but in ASYNCHRONOUS code eg inside Promise THEN, CATCH, we do so like we did inside catch block
    'next(new Error(err))' - you have to use next() around the error **/
};

exports.createProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        pageTitle: 'Add Product',
        route: '/admin/add-product',
        hasError: false,
        editing: false,
        // isAuthenticated: req.session.isLoggedIn,
        errorMessage: null,
        validationErrors: []
    });
}

exports.storeProduct = (req, res, next) => {
    const title = req.body.title;
    const imageURL = req.body.imageUrl;
    const description = req.body.shortDesc;
    const price = req.body.price;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render('admin/edit-product', {
            pageTitle: 'Add Product',
            route: '/admin/add-product',
            editing: false,
            hasError: true,
            product: {
                title: title,
                imageUrl: imageURL,
                shortDesc: description,
                price: price
            },
            errorMessage: errors.array(),
            validationErrors: errors.array()

        });
    }

    const product = new Product({
        title: title,
        price: price,
        imageUrl: imageURL,
        description: description,
        userId: req.user._id,
        isAuthenticated: req.session.isLoggedIn
    });
    product.save()  //mongoose gives us a save() method
        .then( result => {
            res.redirect('/admin/products');
        })
        .catch(err => this.errorHandler(err));
}

exports.getProducts = (req, res, next) => {
    Product.find({userId: req.user.id}) //searching for products created by a particular user.
        .then( products => {
            res.render('admin/products', {
            prods: products,
            pageTitle: 'All Products',
            route: '/products',
            isAuthenticated: req.session.isLoggedIn
            });
        })
        .catch( err => {
            console.log(err);
            this.errorHandler(err);
        });
}


exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit;

    if (editMode !== 'true') {
        return res.redirect('/admin/products');
    }
    const prodId = req.params.productId;
    Product.findById(prodId)
    .then( product => {
        if (product !== null) {
            res.render('admin/edit-product', {
                pageTitle: 'Edit Product',
                route: '/admin/edit-product',
                product: product,
                editing: true,
                hasError: false,
                // isAuthenticated: req.session.isLoggedIn,
                errorMessage: null,
                validationErrors: []
            });
        } else {
            res.redirect('/admin-products');
        }
    })
    .catch( err => {
        console.log(err);
        this.errorHandler(err);
    });

}

exports.updateProduct = (req, res, next) => {
    const updatedTitle = req.body.title;
    const updatedImageUrl = req.body.imageUrl;
    const updatedPrice = req.body.price;
    const updatedDescription = req.body.shortDesc;
    const prodId = req.body.productId;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render('admin/edit-product', {
            pageTitle: 'Edit Product',
            route: '/admin/add-product',
            editing: true,
            hasError: true,
            product: {
                title: updatedTitle,
                imageUrl: updatedImageUrl,
                description: updatedDescription,
                price: updatedPrice,
                _id: prodId
            },
            errorMessage: errors.array(),
            validationErrors: errors.array()
        });
    }

    Product.findById(prodId)
    // Product.findByIdAndUpdate({_id:prodId}, {
    //     title: updatedTitle,
    //     price: updatedPrice,
    //     imageUrl: updatedImageUrl,
    //     description: updatedDescription
    // })
    .then( product => { //here we have a mongoose object & not just a product document, hence we can call mongoose methods on it.
console.log(product)
        // Authorization- check if the product being edited was created by the logged in user.
        if (product.userId.toString() !== req.user._id.toString()) {
            return res.redirect('/admin/products');
        }

        product.title = updatedTitle;
        product.price = updatedPrice;
        product.imageUrl = updatedImageUrl;
        product.description = updatedDescription;

        return product.save()
            .then(result => {
                console.log('PRODUCT UPDATED');
                res.redirect('/admin/products');
            }).catch(err=>console.log(err));
    })
    .catch( err => {
        console.log(err);
        this.errorHandler(err);
    });
};

exports.postDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;

    // Product.findByIdAndRemove(prodId)
    Product.deleteOne({_id: prodId, userId: req.user._id})  //only delete product with d prodId and product userId matching d logged in user 
        .then( () => {
            res.redirect('/admin/products');
        })
        .catch( err => {
        console.log(err);
        this.errorHandler(err);
    });
};