const db = require('../utils/database');

const Cart = require('./cart');


module.exports = class Product {
    constructor(id, title, imgUrl, shortDesc, price) {
        this.id = id;
        this.title = title;
        this.imageURL = imgUrl;
        this.shortDescription = shortDesc;
        // this.longDescription = longDesc;
        this.price = price;
    }

    save() {

        return db.execute('INSERT INTO products (title, description, price, imageURL) VALUES (?, ?, ?, ?)', 
            [this.title, this.shortDescription, this.price, this.imageURL]);
        
    }

    static delete(id) {
        

    }

    //REM our call to DB returns a promise
    static fetchAll() {
        return db.execute('SELECT * FROM products');
    }

    /**getProductsFromFile() in the way we implemented it usually takes a callback function that would return
     * an array of products to us. We then use JS find() method to find an element with id === ID we are passing
     * At the end we invoke d callback we defined in at the call of findById() in shopController
     */
    static findById(id) {
       return db.execute('SELECT * FROM products WHERE products.id = ?', [id]);
    }
}