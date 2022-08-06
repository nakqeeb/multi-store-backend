const express = require('express');

const router = express.Router();

const io = require("../socket");
const Product = require('../models/product');
const isAuth = require('../middleware/is-auth');


router.post('/', isAuth, (req, res, next) => {
    const product = new Product({
        productName: req.body.productName,
        productDescription: req.body.productDescription,
        price: +req.body.price,
        inStock: +req.body.inStock,
        productImages: req.body.productImages,
        discount: +req.body.discount,
        mainCategory: req.body.mainCategory,
        subCategory: req.body.subCategory,
        supplier: req.userId
    });
    product.save().then(addedProduct => {
        if (!addedProduct) {
            const error = new Error("Could not add the product.");
            error.statusCode = 500;
            throw error;
        }
        io.getIO().emit('products', {
            action: 'create',
            product: addedProduct
          }); // 'products' is channel or event name. It could be any name. | (action) key is not required, you can set any data you want. we will use action key in the frontend code to check for create event
        res.status(200).json({
            product: addedProduct,
            success: true
        });
    }).catch(err => {
        if (!err.statusCode) {
            return res.status(401).json({
                message: "Unauthorized access.",
                success: false
            });
        }
        return res.status(err.statusCode).json({
            message: err.message,
            success: false
        });
    });
});


router.get('/', (req, res, next) => {
    Product.find().then((products) => {
        if (!products) {
            const error = new Error("Could not fetch the products.");
            error.statusCode = 500;
            throw error;
        }
        res.status(200).json({
            products: products,
            success: true
        });
    }).catch(err => {
        if (!err.statusCode) {
            return res.status(401).json({
                message: "Unauthorized access.",
                success: false
            });
        }
        return res.status(err.statusCode).json({
            message: err.message,
            success: false
        });
    });
});


router.get('/:productId', (req, res, next) => {
    const productId = req.params.productId;
    Product.findById(productId).then((product) => {
        if (!product) {
            const error = new Error("Could not fetch the product.");
            error.statusCode = 500;
            throw error;
        }
        res.status(200).json({
            product: product,
            success: true
        });
    }).catch(err => {
        if (!err.statusCode) {
            return res.status(401).json({
                message: "Unauthorized access.",
                success: false
            });
        }
        return res.status(err.statusCode).json({
            message: err.message,
            success: false
        });
    });
});


router.get('/category/:categoryId', (req, res, next) => {
    const categoryId = req.params.categoryId;
    Product.find({mainCategory: categoryId}).then((products) => {
        if (!products) {
            const error = new Error("Could not fetch the products.");
            error.statusCode = 500;
            throw error;
        }
        res.status(200).json({
            products: products,
            success: true
        });
    }).catch(err => {
        if (!err.statusCode) {
            return res.status(401).json({
                message: "Unauthorized access.",
                success: false
            });
        }
        return res.status(err.statusCode).json({
            message: err.message,
            success: false
        });
    });
});


router.get('/supplierproducts/:supplierId', (req, res, next) => {
    const supplierId = req.params.supplierId;
    Product.find({supplier: supplierId}).then((supplierProducts) => {
        if (!supplierProducts) {
            const error = new Error("Could not fetch the current supplier products.");
            error.statusCode = 500;
            throw error;
        }
        res.status(200).json({
            supplierProducts: supplierProducts,
            success: true
        });
    }).catch(err => {
        if (!err.statusCode) {
            return res.status(401).json({
                message: "Unauthorized access.",
                success: false
            });
        }
        return res.status(err.statusCode).json({
            message: err.message,
            success: false
        });
    });
});


module.exports = router;