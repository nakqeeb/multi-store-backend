const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const Subcategory = require('./subcategory').schema;
const categorySchema = mongoose.Schema(
    {
        enName: {
            type: String,
            required: true,
            unique: true
        },
        arName: {
            type: String,
            required: true,
            unique: true
        },
        subcategories: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Subcategory',
            required: true
        }],
    },
    { timestamps: true }
);

categorySchema.plugin(uniqueValidator);

module.exports = mongoose.model('Category', categorySchema);