const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const supplierSchema = new mongoose.Schema(
    {
        // _id: { type: String, required: true }, // use it if you want to add your own custom _id
        storeName: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: true
        },
        storeLogoUrl: {
            type: String,
            required: true,
        },
        coverImageUrl: {
            type: String,
        },
        phone: {
            type: String,
        },
        isActivated: {
            type: Boolean,
            default: false
        },
    },
    { timestamps: true }
);

supplierSchema.plugin(uniqueValidator);

// use it if you want to add id feild that has same value as _id
/* customerSchema.virtual('id').get(function () {
    return this._id.toHexString();
});
customerSchema.set('toJSON', {
    virtuals: true,
}); */

module.exports = mongoose.model('Supplier', supplierSchema);
