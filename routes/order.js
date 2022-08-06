const express = require('express');

const router = express.Router();
const io = require("../socket");
const isAuth = require('../middleware/is-auth');

const Cart = require('../models/cart');
const Order = require('../models/order');
const Product = require('../models/product');


router.post('/', isAuth, async (req, res, next) => {
    const customerId = req.userId || req.body.customer;
    const productId = req.body.product;
    const supplierId = req.body.supplier;
    const orderQuantity = +req.body.orderQuantity
    try {
        const order = new Order({
            customer: customerId,
            product: productId,
            supplier: supplierId,
            orderQuantity: orderQuantity,
            orderPrice: +req.body.orderPrice,
            deliveryStatus: req.body.deliveryStatus,
            deliveryDate: req.body.deliveryDate,
            orderDate: req.body.orderDate,
            paymentStatus: req.body.paymentStatus,
            orderReview: req.body.orderReview
        });
        const addedorder = await order.save();
        if (!addedorder) {
            const error = new Error("Order can not be placed.");
            error.statusCode = 401;
            throw error;
        }
        /* io.getIO().emit('products', {
            action: 'create',
            product: addedorder
          }); */ // 'products' is channel or event name. It could be any name. | (action) key is not required, you can set any data you want. we will use action key in the frontend code to check for create event
        const updatedProduct = await Product.updateOne({ _id: productId }, { "$inc": { "inStock": -orderQuantity } });
        if (!updatedProduct) {
            const error = new Error("Product stock quantity can not be updated.");
            error.statusCode = 401;
            throw error;
        }

        res.status(200).json({
            order: addedorder,
            success: true
        });
    } catch (err) {
        // console.log(err);
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


router.get('/', isAuth, (req, res, next) => {
    Order.find({ $or: [{ customer: req.userId }, { supplier: req.userId }] }).select('-__v').populate('customer', '-password -cart -__v').populate('supplier', '-password -__v').populate('product', '-__v').then(orders => {
        if (!orders) {
            const error = new Error("Can not fetch the orders.");
            error.statusCode = 401;
            throw error;
        }
        res.status(200).json({
            orders: orders,
            success: true
        });
    }).catch(err => {
        // console.log(err);
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


router.put('/:orderId', isAuth, async (req, res, next) => {
    const orderId = req.params.orderId;
    const deliveryStatus = req.body.deliveryStatus;
    try {
        var order = await Order.findById(orderId);
        if (!order) {
            const error = new Error("Could not find the order.");
            error.statusCode = 404;
            throw error;
        }
        const deliveryDate = order.deliveryDate == null ? req.body.deliveryDate : order.deliveryDate;
        var result = await Order.updateOne({ _id: orderId }, { deliveryStatus: deliveryStatus, deliveryDate: deliveryDate });
        //console.log('Here is result: ', result);
        if (result.matchedCount > 0) {
            // fetch order here in order to emit it with socket io
            var order = await Order.findById(orderId).select('-__v').populate('customer', '-password -cart -__v').populate('supplier', '-password -__v').populate('product', '-__v');
            if (!order) {
                const error = new Error("Could not find the order.");
                error.statusCode = 404;
                throw error;
            }
            io.getIO().emit('orders', {
                action: 'updateOrder',
                order: order
            });
            return res.status(200).json({ message: 'Delivery date is updated successfully.', success: true });
        } else {
            const error = new Error("Could not update the order.");
            error.statusCode = 404;
            throw error;
        }
    } catch (error) {
        //console.log('error is here: ',error);
        if (!error.statusCode) {
            return res.status(401).json({
                message: "Unauthorized access.",
                success: false
            });
        }
        return res.status(500).json({
            message: error.message,
            success: false
        });
    }
});


router.put('/orderreview/:orderId', isAuth, async (req, res, next) => {
    const orderId = req.params.orderId;
    const orderReview = req.body.orderReview;
    try {
        var order = await Order.findById(orderId);
        if (!order) {
            const error = new Error("Could not find the order.");
            error.statusCode = 404;
            throw error;
        }
        var result = await Order.updateOne({ _id: orderId }, { orderReview: orderReview });
        if (result.matchedCount > 0) {
            // fetch order here in order to emit it with socket io
            var order = await Order.findById(orderId).select('-__v').populate('customer', '-password -cart -__v').populate('supplier', '-password -__v').populate('product', '-__v');
            if (!order) {
                const error = new Error("Could not find the order.");
                error.statusCode = 404;
                throw error;
            }
            io.getIO().emit('orders', {
                action: 'updateOrder',
                order: order
            });
            return res.status(200).json({ message: 'orderReview udated successfully.', success: true });
        } else {
            const error = new Error("Could not update the order.");
            error.statusCode = 404;
            throw error;
        }
    } catch (error) {
        //console.log('error is here: ',error);
        if (!error.statusCode) {
            return res.status(401).json({
                message: "Unauthorized access.",
                success: false
            });
        }
        return res.status(500).json({
            message: error.message,
            success: false
        });
    }
});

module.exports = router;