const express = require('express');

const router = express.Router();

const Category = require('../models/category');
const Subcategory = require('../models/subcategory');

router.post('/', async (req, res, next) => {
    const subcategory = await Subcategory.create(req.body.subcategories.map(m => {
        return {
            enSubName: m.enSubName,
            arSubName: m.arSubName,
            imageUrl: m.imageUrl
        };
    }));
    // console.log(subcategory);
    const category = new Category({
        enName: req.body.enName,
        arName: req.body.arName,
        subcategories: subcategory
    });
    category.save().then(addedCategory => {
        //subcategory.save();
        res.status(200).json({
            category: addedCategory,
            success: true
        });
    }).catch(error => {
        //subcategory.delete();
        Subcategory.remove({});
        res.status(500).json({
          message: 'Could not add the category.',
          success: false
        });
      });
});


router.get('/', (req, res, next) => {
    Category.find().populate('subcategories').then((categories) => {
        if (!categories) {
            const error = new Error("Could not fetch the categories.");
            error.statusCode = 500;
            throw error;
        }
        res.status(200).json({
            categories: categories,
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

module.exports = router;
