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

// exports.getCart = (req, res, next) => {
//     req.user.getCart()
//     .then(cart => {
//         return cart.getProducts();
//     })
//     .then(products => {
//         res.render('shop/cart', {
//             pageTitle: 'Your Cart',
//             route: '/cart',
//             products: products
//         });
//     })
//     .catch( err => console.log(err));
// }

// exports.postCart = (req, res, next) => {
//     const prodId = req.body.productId;
//     let product;
//     let userCart;
//     let newQuantity = 1;
//     //Get current user's cart
//     // check if product is already in user card
//     //Yes? Update quanty
//     //No: Add new product to card
//     req.user.getCart()
//     .then( cart => {
//         userCart = cart;
//         return cart.getProducts({where: { id: prodId}});
//     })
//     .then( products => {
//         if (products.length > 0) {  //if product array is not empty
//             product = products[0];  //d 1st element of d returned array is usually d product object so we assign it to our product variable
//         }

//         if (product) {  //if product is anything other than null

//                 const oldQuantity = product.cartItem.quantity;
//                 newQuantity = oldQuantity + 1;
//                 return product; //this will be wrapped as a promise

//         }else {
//             // if product does not exist in cart, we find the product in DB
//             return Product.findByPk(prodId);
//         }
//     })
//     .then(product => {
//         // here addProduct() will either create a new product of update existing product
//         return userCart.addProduct(product, {
//             through: {quantity: newQuantity}
//         });
//     })
//     .then(() => {
//         res.redirect('/cart');
//     })
//     .catch(err => console.log(err));
// }


// exports.getCheckout = (req, res, next) => {
//     res.render('shop/checkout', {
//         pageTitle: 'Checkout',
//         route: '/checkout',
//     });
// }

// exports.postCartDeleteProduct = (req, res, next) => {
//     /**Get the user's cart, get get the product with d required product ID from cart,
//     destroy then product **/
    
//     const prodId = req.body.productId;
//     req.user.getCart()
//     .then(cart => {
//         return cart.getProducts({where:{id:prodId}});
//     })
//     .then(products => {
//         const product = products[0];

//         return product.cartItem.destroy();

//     })
//     .then(result => {
//         res.redirect('/cart');
//     })
//     .catch(err => console.log(err));
// }

// exports.postOrder = (req, res, next) => {
//     //get user cart, then cart products, then create new Order for user and add products to Order
//     //then empty the user's cart, then return order view

//     let userCart;
//     req.user.getCart()
//     .then( cart => {
//         userCart = cart;
//         return cart.getProducts();
//     })
//     .then( products => {
//         return req.user.createOrder()
//         .then( order => {
//             order.addProducts(products.map( product => {
//                 product.orderItem = {quantity:product.cartItem.quantity};
//                 return product;
//             })
//             );
//         }).catch(err => console.log(err));
//     })
//     .then( result => {
//         // clear cart
//         return userCart.setProducts(null);
//     })
//     .then( result => {
//         res.redirect('/orders');
//     })
//     .catch(err => console.log(err));
// }

// exports.getOrders = (req, res, next) => {
//     req.user.getOrders({include : ['products']})
//     .then( orders => {
//         res.render('shop/orders', {
//             pageTitle: 'Your Orders',
//             route: '/orders',
//             orders: orders
//         });
//     }).catch(err => console.log(err));
    
// }