const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");

const router = express.Router();

const Customer = require('../models/customer');

router.post('/signup', (req, res, next) => {
    Customer.findOne({ email: req.body.email }).then(fetchedCustomer => {
        if (fetchedCustomer) {
            return res.status(403).json({
                message: "The account already exists for that email.",
                success: false
            });
        }
        bcrypt.hash(req.body.password, 10).then(hash => {
            const customer = new Customer({
                name: req.body.name,
                email: req.body.email,
                password: hash,
                profileImageUrl: req.body.profileImageUrl,
                address: req.body.address,
                phone: req.body.phone,
                cart: { items: [] }
            });
            customer.save().then(addedCustomer => {
                if (!addedCustomer) {
                    return res.status(403).json({
                        message: "Could not create the user.",
                        success: false
                    });
                }
                res.status(200).json({
                    customer: addedCustomer,
                    success: true
                });
            }).catch(error => {
                res.status(500).json({
                    message: 'Invalid authentication credentials.',
                    success: false
                });
            });
        });
    });

});

router.post('/login', (req, res, next) => {
    let fetchedUser;
    Customer.findOne({ email: req.body.email }).populate('cart.items.productId')
        .then((user) => {
            if (!user) {
                const error = new Error("No user found for that email.");
                error.statusCode = 401;
                throw error;
            }
            fetchedUser = user;
            return bcrypt.compare(req.body.password, user.password);
        })
        .then((isMatched) => {
            if (!isMatched) {
                const error = new Error("Wrong password provided for that user.");
                error.statusCode = 401;
                throw error;
                
            }
            const token = jwt.sign(
                { email: fetchedUser.email, userId: fetchedUser._id },
                process.env.JWT_KEY,
                /* { expiresIn: "730h" } */
            );
            fetchedUser = fetchedUser.toObject(); // this to delete password field from fetchedUser before we send the response to the client
            delete fetchedUser.password;
            res.status(200).json({
                token: token,
                // expiresIn: 43800,
                customer: fetchedUser,
                success: true
            });
        })
        .catch((err) => {
            if(!err.statusCode) {
                return res.status(401).json({
                    message: "Invalid authentication credentials.",
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