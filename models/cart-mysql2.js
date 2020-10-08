const fs = require('fs');
const path = require('path');

const file = path.join(path.dirname(process.mainModule.filename), 'data', 'cart.json');

module.exports = class Cart {
    /**Since we always have one cart (cart is not an object we constantly create) that would be updated and 
     * do not need to create a new cart for each product added to the cart, so we do not need a constructor 
     * function. We only need static function that will help use add to or remove products from the cart
     */

    static addProduct(id, productPrice) {
        // Fetch current products in cart
        fs.readFile(file, (err, fileContent) => {
            let cart = { products: [], cartTotal: 0 };
            if (!err) {
                //if no error then there are contents in the file so we assign d parsed content to cart to give
                //us an object or array depending on d cart.json content data type
                cart = JSON.parse(fileContent);
            }
            //Anaylyze the cart => find existing product
            const existingProductIndex = cart.products.findIndex(product => product.id === id);
            const existingProduct = cart.products[existingProductIndex];
            let updatedProduct;
            //Add new product or increase quantity if product already exist in cart
            if (existingProduct) {
                updatedProduct = {...existingProduct };
                updatedProduct.qty += 1;
                cart.products = [...cart.products];
                cart.products[existingProductIndex] = updatedProduct;
            } else {
                updatedProduct = { id: id, qty: 1 };
                //append new product details to existing cart products
                cart.products = [...cart.products, updatedProduct];
            }

            cart.cartTotal += +productPrice; //since we store price as string adding + converts it to Number
            fs.writeFile(file, JSON.stringify(cart), err => {
                console.log(err);
            });
        });

    }

    static deleteProduct(id, productPrice) {
        //read the cart
        fs.readFile(file, (err, fileContent) => {
            if (err) {
                //if there is nothing to delete, we end execution here
                console.log(err);
                return;
            }
            //Find d product to be deleted in the cart
            const updatedCart = {...JSON.parse(fileContent) };
            const product = updatedCart.products.find(prod => prod.id === id);
            //delete the product
            if (!product) {
                return;
            }
            updatedCart.products = updatedCart.products.filter(prod => prod.id !== id);
            updatedCart.cartTotal -= (productPrice * product.qty);

            //update cart
            fs.writeFile(file, JSON.stringify(updatedCart), err => {
                if (err) {
                    //if there is nothing to delete, we end execution here
                    console.log(err);
                }
            });
        });
    }

    static getCarts(callback) {
        fs.readFile(file, (err, fileContent) => {
            const cart = JSON.parse(fileContent);
            if (err) {
                callback(null);
            } else {
                callback(cart);
            }
        });
    }
}