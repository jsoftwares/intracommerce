const Product = require('../models/product');


exports.createProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        pageTitle: 'Add Product',
        route: '/admin/add-product',
        editing: null
    });
}

exports.storeProduct = (req, res, next) => {
    const title = req.body.title;
    const imageURL = req.body.imageUrl;
    const description = req.body.shortDesc;
    const price = req.body.price;

    const product = new Product(title, price, description, imageURL);
    product.save()
        .then( result => {
            res.redirect('/admin-products');
        }).catch(err => console.log(err));
}

exports.getProducts = (req, res, next) => {
    Product.fetchAll()
        .then( (products) => {
            res.render('admin/products', {
            prods: products,
            pageTitle: 'All Products',
            route: '/products'
            });
        })
        .catch( err => console.log(err));
}


exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit;
    if (editMode !== 'true') {
        res.redirect('/admin-products');
    }

    const prodId = req.params.productId;
    Product.findById(prodId)
    .then( product => {
            if (product !== null) {
            res.render('admin/edit-product', {
                pageTitle: 'Edit Product',
                route: '/admin/edit-product',
                editing: editMode,
                product: product
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

    const product = new Product(updatedTitle, updatedPrice, updatedDescription, updatedImageUrl, prodId);
    product.save()
        .then(result => {
            console.log('PRODUCT UPDATED');
            res.redirect('/admin-products');
        })
        .catch( err => console.log(err));
}

exports.postDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    //call method in Model
    Product.deleteById(prodId)
    .then( () => {
        res.redirect('/admin-products');
    })
    .catch( err => console.log(err));
}