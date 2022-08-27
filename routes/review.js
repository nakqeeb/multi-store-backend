const express = require('express');

const router = express.Router();

const io = require("../socket");
const Review = require('../models/review');
const isAuth = require('../middleware/is-auth');

router.post('', isAuth, async (req, res, next) => {
    try {
        const review = new Review({
            customerId: req.userId,
            productId: req.body.productId,
            rating: +req.body.rating,
            comment: req.body.comment
        });
        const addedReview = await review.save();
        if (!addedReview) {
            const error = new Error("Could not add the review.");
            error.statusCode = 500;
            throw error;
        }
        res.status(200).json({
            review: addedReview,
            success: true
        });
    } catch (err) {
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

// fetch all reviews
router.get('/', async (req, res, next) => {
    try {
        const reviews = await Review.find().populate('customerId', '-password -cart -wishlist -__v');
        if (!reviews) {
            const error = new Error("Could not fetch the reviews.");
            error.statusCode = 500;
            throw error;
        }
        res.status(200).json({
            reviews: reviews,
            success: true
        });
    } catch (err) {
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

// fetch all reviews for a certain product
router.get('/:prodId', async (req, res, next) => {
    const productId = req.params.prodId;
    try {
        const reviews = await Review.find({productId: productId}).populate('customerId', '-password -cart -wishlist -__v');
        if (!reviews) {
            const error = new Error("Could not fetch the reviews for the current product.");
            error.statusCode = 500;
            throw error;
        }
        res.status(200).json({
            reviews: reviews,
            success: true
        });
    } catch (err) {
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


// fetch all reviews for a certain customer
router.get('/customer', isAuth ,async (req, res, next) => {
    const customerId = req.userId;
    try {
        const reviews = await Review.find({customerId: customerId}).populate('customerId', '-password -cart -wishlist -__v');
        if (!reviews) {
            const error = new Error("Could not fetch the reviews for the current customer.");
            error.statusCode = 500;
            throw error;
        }
        res.status(200).json({
            reviews: reviews,
            success: true
        });
    } catch (err) {
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


module.exports = router;