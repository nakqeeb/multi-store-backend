const mongoose = require('mongoose');
require('@mongoosejs/double'); //plugin to support Double in mongoose. To install it (npm i @mongoosejs/double)


const orderSchema = new mongoose.Schema(
    {
        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Customer",
        },
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
        },
        supplierId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Supplier",
        },
        /* addressId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Address",
        }, */
        name: {
            type: String,
            required: true,
        },
        phone: {
            type: String,
            required: true,
        }, 
        pincode: {
            type: String,
            required: true,
        },
        address: {
            type: String,
            required: true,
        },
        landmark: {
            type: String,
        },
        city: {
            type: String,
            required: true,
        },
        state: {
            type: String,
            required: true,
        },
        productName: {
            type: String,
            required: true
        },
        productImage: {
            type: String,
            required: true
        },
        productPrice: {
            type: mongoose.Schema.Types.Double, // Thanks to the '@mongoosejs/double' plugin
            required: true
        },
        orderQuantity: {
            type: Number,
            required: true
        },
        orderPrice: {
            type: mongoose.Schema.Types.Double, // Thanks to the '@mongoosejs/double' plugin
            required: true
        },
        deliveryStatus: {
            type: String,
            default: 'preparing'
        },
        deliveryDate: {
            type: Date,
        },
        orderDate: {
            type: Date,
            required: true,
        },
        paymentStatus: {
            type: String,
            default: 'cash on delivery'
        },
        orderReview: {
            type: Boolean,
            default: false
        },
    },
    { timestamps: true }
);


module.exports = mongoose.model('Order', orderSchema);
