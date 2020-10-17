const Product = require('../models/product');
// const Cart = require('../models/cart');

exports.index = (req, res, next) => {

    Product.fetchAll()
        .then( products => {
            res.render('shop/index', {
            prods: products,
            pageTitle: 'Shop',
            route: '/'
            });
        })
        .catch( err => console.log(err));

}

// exports.allProducts = (req, res, next) => {

//     Product.findAll()
//         .then( products => {
//             res.render('shop/index', {
//             prods: products,
//             pageTitle: 'All Products',
//             route: '/products'
//             });
//         })
//         .catch( err => console.log(err));

// }

exports.showProduct = (req, res, next) => {
    const prodId = req.params.productId;
    Product.findById(prodId)
    .then( product => {
        res.render('shop/product-details', {
            product: product,
            pageTitle: product.title,
            route: '/products'
        });
    })
    .catch( err => console.log(err));
}

exports.getCart = (req, res, next) => {
    req.user.getCart()
    .then(products => {
        res.render('shop/cart', {
            pageTitle: 'Your Cart',
            route: '/cart',
            products: products
        });
    })
    .catch( err => console.log(err));
};

exports.postCart = (req, res, next) => {
    const prodId = req.body.productId;
    let addedProductTitle;

    Product.findById(prodId)
    .then( product => {
        addedProductTitle = product.title;
        return req.user.addToCart(product);
    })
    .then( result => {
        console.log(addedProductTitle + ' Product Added to cart');
        res.redirect('/cart');
    })
}


exports.postCartDeleteProduct = (req, res, next) => {
    
    const prodId = req.body.productId;
    req.user.deleteCartItem(prodId)
    .then( result => {
        console.log('Cart item deleted');
        res.redirect('/cart');
    }).catch(err => console.log(err));
}

// exports.getCheckout = (req, res, next) => {
//     res.render('shop/checkout', {
//         pageTitle: 'Checkout',
//         route: '/checkout',
//     });
// }

exports.postOrder = (req, res, next) => {
    //get user cart, then cart products, then create new Order for user and add products to Order
    //then empty the user's cart, then return order view

    let userCart;
    req.user.addOrder()
    .then( result => {
        res.redirect('/orders');
    })
    .catch(err => console.log(err));
}

exports.getOrders = (req, res, next) => {
    req.user.getOrders()
    .then( orders => {
        res.render('shop/orders', {
            pageTitle: 'Your Orders',
            route: '/orders',
            orders: orders
        });
    }).catch(err => console.log(err));
    
}