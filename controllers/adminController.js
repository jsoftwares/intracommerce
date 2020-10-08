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
    const shortDescription = req.body.shortDesc;
    const price = req.body.price;

    req.user.createProduct({
        title: title,
        price: price,
        imageURL: imageURL,
        description: shortDescription
    })
    // Product.create({});
    .then( result => {
        res.redirect('/admin-products');
    }).catch(err => console.log(err));
    //USING MYSQL2
    // const product = new Product(null, title, imageURL, shortDescription, price);
    // product.save().
    //     then( () => {
    //         res.redirect('/admin-products');
    //     })
    //     .catch( err => console.log(err));
}

exports.getProducts = (req, res, next) => {
    Product.findAll()
        .then( (products) => {
            res.render('admin/products', {
            prods: products,
            pageTitle: 'All Products',
            route: '/products'
            });
        })
        .catch( err => console.log(err));

    //USING MYSQL2
    // Product.fetchAll()
    //         //We use destructuring here to pick d 1st 2 elements of our DB query response which are the data
    //         //we are querying and info about d table respectively
    //     .then( ([rows, fieldData]) => {
    //         res.render('admin/products', {
    //         prods: rows,
    //         pageTitle: 'All Products',
    //         route: '/products'
    //     });
    // });
}


exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit;
    if (editMode !== 'true') {
        res.redirect('/admin-products');
    }

    const prodId = req.params.productId;
    Product.findByPk(prodId)
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

    //USING MYSQL2
    // Product.findById(prodId, product => {
    //     if (product !== null) {
    //         res.render('admin/edit-product', {
    //             pageTitle: 'Edit Product',
    //             route: '/admin/edit-product',
    //             editing: editMode,
    //             product
    //         });
    //     } else {
    //         return res.redirect('/');
    //     }

    // });

}

exports.updateProduct = (req, res, next) => {
    const updatedTitle = req.body.title;
    const updatedImageUrl = req.body.imageUrl;
    const updatedPrice = req.body.price;
    const updatedShortDescription = req.body.shortDesc;
    const prodId = req.body.productId;

    Product.findByPk(prodId)
    .then( product => {
        if (product !== null) 
        {
            product.title = updatedTitle;
            product.price = updatedPrice;
            product.description = updatedShortDescription;
            product.imageURL = updatedImageUrl;

            return product.save();  //return here so that we can catch this promise in d current catch block

        }else{
            res.redirect('/admin-products');
        }
    })
    .then(result => {
        console.log('PRODUCT UPDATED');
        res.redirect('/admin-products');
    })
    .catch( err => console.log(err));

    //USING MYSQL2
    // Product.findById(prodId, product => {

    //     if (product !== null) {
    //         // Create new product instance and populate it with updated info from form
    //         const updatedTitle = req.body.title;
    //         const updatedImageUrl = req.body.imageUrl;
    //         const updatedPrice = req.body.price;
    //         const updatedShortDescription = req.body.shortDesc;

    //         //Invoke the constructor
    //         const updatedProduct = new Product(prodId, updatedTitle, updatedImageUrl, updatedShortDescription, updatedPrice);

    //         // call save()
    //         updatedProduct.save();
    //         res.redirect('/admin-products');
    //     } else {
    //         return res.redirect('/products');
    //     }
    // });

    // res.redirect('');
}

exports.postDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    //call method in Model
    Product.destroy({where:{
        id:prodId
        }
    })
    .then( result => {
        console.log('PRODUCT DELETED');
        res.redirect('/admin-products');
    })
    .catch( err => console.log(err));

    //USING MYSQL2
    // Product.delete(prodId);
    // res.redirect('admin-products');
}