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
    Product.find({ mainCategory: categoryId }).then((products) => {
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
    Product.find({ supplier: supplierId }).then((supplierProducts) => {
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


router.put('/:productId', isAuth, async (req, res, next) => {
    const productId = req.params.productId;
    const productName = req.body.productName;
    const productDescription = req.body.productDescription;
    const price = +req.body.price;
    const inStock = +req.body.inStock;
    const productImages = req.body.productImages;
    const discount = req.body.discount;
    const mainCategory = req.body.mainCategory;
    const subCategory = req.body.subCategory;
    try {
        const product = await Product.findById(productId);
        if (!product) {
            const error = new Error('Product is not found');
            error.statusCode = 404;
            throw error;
        }
        if (product.supplier != req.userId) {
            const error = new Error('You are unauthorized to update this product');
            error.statusCode = 401;
            throw error;
        }
        const result = await Product.updateOne({ _id: productId },
            {
                productName: productName,
                productDescription: productDescription,
                price: price, inStock: inStock,
                productImages: productImages,
                discount: discount,
                mainCategory: mainCategory,
                subCategory: subCategory
            });
        if (result.matchedCount > 0) {
            return res.status(200).json({ message: 'Product updated successfully.', success: true });
        } else {
            const error = new Error("Could not update the product.");
            error.statusCode = 500;
            throw error;
        }
    } catch (err) {
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
    }
});


router.delete('/:productId', isAuth, async (req, res, next) => {
    const productId = req.params.productId;
    try {
        const product = await Product.findById(productId);
        if (!product) {
            const error = new Error('Product is not found');
            error.statusCode = 404;
            throw error;
        }
        const result = await Product.deleteOne({ _id: productId, supplier: req.userId });
        if (result.deletedCount > 0) {
            io.getIO().emit('products', {
                action: 'delete',
              }); 
            return res.status(200).json({ message: 'Deletion successful!', success: true });
        } else {
            const error = new Error('Not Authorized.');
            error.statusCode = 404;
            throw error;
        }
    } catch (err) {
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
    }
});


module.exports = router;