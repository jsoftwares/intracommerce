const fs = require('fs');
const path = require('path');

const PDFDocument = require('pdfkit');  //it exposes a PDF document constructor.

const Product = require('../models/product');
const Order = require('../models/order');


const errorHandler  = (err, next) => {
    const error = new Error(err);
    error.httpStatusCode = 500;     //we can add fields to our error
    return next(error);
};


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
        });
    }).catch(err => console.log(err));
    
};

exports.getInvoice = (req, res, next) => {
    const orderId = req.params.orderId;
    const invoiceName = 'invoice-' + orderId + '.pdf';
    const invoicePath = path.join('data', 'invoices', invoiceName);

    Order.findById(orderId)
    .then(order => {
        if (!order) {
            return next(new Error('No order found.'));
        }
        if (order.user.userId.toString() !== req.user._id.toString()) {
            return next(new Error('Unauthorized.'));   
        }

        // Reading file all at once into memory & serve it - method is okay for small files
        /**
        fs.readFile(invoicePath, (err, pdf) => {
            if (err) {
                return next(err)
            }

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'inline; filename="'+invoiceName+'"');
            res.send(pdf);
        }); 
        **/

        /**
        // Reading file in chuncks
        const file = fs.createReadStream(invoicePath);

        /**We use pipe() to forward each read-stream chunk to our res. res object is a writable stream.
        Res will be streamed to the browser & would contain our file & d data will be downloaded by d browser
        in chunks. Hence efficient for large file as d most Node needs to store is 1 chunk of data
        // res.setHeader('Content-Type', 'application/pdf');
        // res.setHeader('Content-Disposition', 'inline; filename="'+invoiceName+'"');
        // file.pipe(res);

        **/
        //Create a PDF on the fly rather than loading one already on the server.

        /** pdfDoc is also a readable stream, so we can pipe() d output into a writable read stream 
        (createWriteStream). createWriteStream() bcos we're writing/creating a new file, so it ensures d 
        file we want to create gets saved on the server.We also pipe it to res which is also a writeable read stream.
        Whatever content we add to pdfDoc will be forwarded to our createWriteStream which stores the file on
        d server & res which server the file to our client browser 
        **/
        const pdfDoc = new PDFDocument();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename="'+invoiceName+'"');
        pdfDoc.pipe(fs.createWriteStream(invoicePath)); //this ensures d PDF is also stored on d server
        pdfDoc.pipe(res);   //this sends d PDF file to the client

        pdfDoc.fontSize(21).text('ORDER INVOICE', {align:'center'});
        pdfDoc.fontSize(14).text('Order Number:  ' + order._id, {align:'center'});
        pdfDoc.fontSize(21).text('------------------------------------------------------------------');
        let orderTotal = 0;
        order.products.forEach( (prod, index) => {
            orderTotal += prod.quantity * prod.product.price;
            pdfDoc.fontSize(14).text(index+1+'.  ' + prod.product.title + ' -- ' + prod.quantity + ' x ' + prod.product.price);
        })
        pdfDoc.text('__________________________');
        pdfDoc.text('TOTAL: NGN' + orderTotal);

        pdfDoc.end();  //closes writing to the stream

    }).catch(err => {
        console.log(err);
        errorHandler(err, next);
    });

    
};