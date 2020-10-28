const Product = require('../models/product');
const Order = require('../models/order');

exports.index = (req, res, next) => {

//find() does not return a cursor but we can add .cursor().each() to loop through each product or .next() to
//return d next set of products. It is important to use cursor() if we are loading large data from DB
    Product.find()
        .then( products => {
            res.render('shop/index', {
                prods: products,
                pageTitle: 'Shop',
                route: '/',
                // isAuthenticated: req.session.isLoggedIn
            });
        })
        .catch( err => console.log(err));

}

exports.allProducts = (req, res, next) => {

    Product.find()
        .then( products => {
            res.render('shop/index', {
                prods: products,
                pageTitle: 'All Products',
                route: '/products',
                // isAuthenticated: req.session.isLoggedIn
            });
        })
        .catch( err => console.log(err));

}

exports.showProduct = (req, res, next) => {
    const prodId = req.params.productId;
    Product.findById(prodId)
    .then( product => {
        res.render('shop/product-details', {
            product: product,
            pageTitle: product.title,
            route: '/products',
            // isAuthenticated: req.session.isLoggedIn
        });
    })
    .catch( err => console.log(err));
}

exports.getCart = (req, res, next) => {
    req.user.populate('cart.items.productId')
    .execPopulate()
    .then(user => {
        res.render('shop/cart', {
            pageTitle: 'Your Cart',
            route: '/cart',
            products: user.cart.items,
            // isAuthenticated: req.session.isLoggedIn
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
    req.user.removeFromCart(prodId)
    .then( result => {
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
	userCartItems = req.user.cart.items;
    req.user.populate('cart.items.productId')
    .execPopulate()
    .then( user => {
    	/**Bcos user.cart.items is an array of objects containing quantity property and the product details 
    	in a property named productId, we had to build another array where the name of the property is now
    	"product" bcos that is what we named the property in our Order schema. We could have also named
    	it "productId" hence we would not have to use map.  **/
    	const products = user.cart.items.map( item => {
    		return {product: {...item.productId._doc}, quantity: item.quantity};
    	});

    	const order = new Order({
    		user: {
    			name: req.user.name,
    			userId: req.user
    		},
    		products: products,
    	});

        return order.save();
    })
    .then( result => {
    	return req.user.clearCart();
    })
    .then( () => {
  
    	res.redirect('/orders');
    })
    .catch(err => console.log(err));
}

exports.getOrders = (req, res, next) => {

	Order.find({'user.userId':req.user._id})
    .then( orders => {
        res.render('shop/orders', {
            pageTitle: 'Your Orders',
            route: '/orders',
            orders: orders,
            // isAuthenticated: req.session.isLoggedIn
        });
    }).catch(err => console.log(err));
    
}