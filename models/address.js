const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const addressSchema = mongoose.Schema(
    {
        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Customer",
            required: true,
        },
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
        isDefault: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

addressSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Address', addressSchema);