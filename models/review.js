const mongoose = require('mongoose');
require('@mongoosejs/double'); //plugin to support Double in mongoose. To install it (npm i @mongoosejs/double)


const reviewSchema = mongoose.Schema(
    {
        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Customer",
        },
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
        },
        rating: {
            type: mongoose.Schema.Types.Double, // Thanks to the '@mongoosejs/double' plugin
            required: true
        },
        comment: {
            type: String,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Review', reviewSchema);