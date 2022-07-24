const mongoose = require('mongoose');
require('@mongoosejs/double'); //plugin to support Double in mongoose. To install it (npm i @mongoosejs/double)

const productSchema = new mongoose.Schema(
    {
        productName: {
            type: String,
            required: true,
        },
        productDescription: {
            type: String,
            required: true,
        },
        price: {
            type: mongoose.Schema.Types.Double, // Thanks to the '@mongoosejs/double' plugin
            required: true
        },
        inStock: {
            type: Number,
            required: true,
        },
        productImages: [{
            type: String
        }],
        discount: {
            type: Number,
        },
        mainCategory: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: true,
        },
        subCategory: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Subcategory',
            required: true,
        },
        supplier: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Supplier',
            required: true
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
