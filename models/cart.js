const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const cartSchema = new mongoose.Schema(
    {
        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Customer",
            unique: true
        },
        cartItems: [
            {
                quantity: {
                    type: Number,
                    default: 0
                },
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Product',
                }
            }
        ]
    },
    { timestamps: true }
);

cartSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Cart', cartSchema);
