const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const subcategorySchema = mongoose.Schema(
    {
        enSubName: {
            type: String,
            required: true,
        },
        arSubName: {
            type: String,
            required: true,
        },
        imageUrl: {
            type: String,
            required: true
        },
    },
    { timestamps: true }
);

subcategorySchema.plugin(uniqueValidator);

module.exports = mongoose.model('Subcategory', subcategorySchema);