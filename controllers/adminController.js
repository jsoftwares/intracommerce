const Product = require('../models/product');


exports.createProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        pageTitle: 'Add Product',
        route: '/admin/add-product',
        editing: null,
        isAuthenticated: req.session.isLoggedIn
    });
}

exports.storeProduct = (req, res, next) => {
    const title = req.body.title;
    const imageURL = req.body.imageUrl;
    const description = req.body.shortDesc;
    const price = req.body.price;

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
        }).catch(err => console.log(err));
}

exports.getProducts = (req, res, next) => {
    Product.find({userId: req.user.id})
        .then( products => {
            res.render('admin/products', {
            prods: products,
            pageTitle: 'All Products',
            route: '/products',
            isAuthenticated: req.session.isLoggedIn
            });
        })
        .catch( err => console.log(err));
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
                editing: editMode,
                product: product,
                isAuthenticated: req.session.isLoggedIn
            });
        } else {
            res.redirect('/admin-products');
        }
    })
    .catch( err => console.log(err));

}

exports.updateProduct = (req, res, next) => {
    const updatedTitle = req.body.title;
    const updatedImageUrl = req.body.imageUrl;
    const updatedPrice = req.body.price;
    const updatedDescription = req.body.shortDesc;
    const prodId = req.body.productId;

    Product.findById(prodId)
    // Product.findByIdAndUpdate({_id:prodId}, {
    //     title: updatedTitle,
    //     price: updatedPrice,
    //     imageUrl: updatedImageUrl,
    //     description: updatedDescription
    // })
    .then( product => { //here we have a mongoose object & not just a product document, hence we can call mongoose methods on it.

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
    .catch( err => console.log(err));
};

exports.postDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;

    // Product.findByIdAndRemove(prodId)
    Product.deleteOne({_id: prodId, userId: req.user._id})  //only delete product with d prodId and product userId matching d logged in user 
        .then( () => {
            res.redirect('/admin/products');
        })
        .catch( err => console.log(err));
};