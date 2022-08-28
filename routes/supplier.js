const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");

const router = express.Router();

const Supplier = require('../models/supplier');
const isAuth = require('../middleware/is-auth');


router.post('/signup', (req, res, next) => {
    Supplier.findOne({ email: req.body.email }).then(fetchedSupplier => {
        if (fetchedSupplier) {
            return res.status(403).json({
                message: "The account already exists for that email.",
                success: false
            });
        }
        bcrypt.hash(req.body.password, 10).then(hash => {
            const supplier = new Supplier({
                storeName: req.body.storeName,
                email: req.body.email,
                password: hash,
                storeLogoUrl: req.body.storeLogoUrl,
                phone: req.body.phone,
                coverImageUrl: req.body.coverImageUrl
                // isActivated: req.body.isActivated // by default the value will set to false
            });
            supplier.save().then(addedsupplier => {
                if (!addedsupplier) {
                    return res.status(403).json({
                        message: "Could not create the user.",
                        success: false
                    });
                }
                res.status(200).json({
                    supplier: addedsupplier,
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
    Supplier.findOne({ email: req.body.email })
        .then((user) => {
            if (!user) {
                const error = new Error("No user found for that email.");
                error.statusCode = 401;
                throw error;
            }
            fetchedUser = user;
            return bcrypt.compare(req.body.password, user.password);
        })
        .then(async (isMatched) => {
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
            // update supplier FCM token device 
            const result = await Supplier.updateOne({ _id: fetchedUser._id }, { fcmToken: req.body.fcmToken });
            if (result.matchedCount > 0) {
                return res.status(200).json({
                    token: token,
                    // expiresIn: 43800,
                    supplier: fetchedUser,
                    success: true
                });
            } else {
                const error = new Error("Could not get the FCM token.");
                error.statusCode = 401;
                throw error;
            }
        })
        .catch((err) => {
            if (!err.statusCode) {
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

router.get('/', (req, res, next) => {
    Supplier.find().select('-password -__v').then((suppliers) => {
        if (!suppliers) {
            const error = new Error("Could not fetch the suppliers.");
            error.statusCode = 500;
            throw error;
        }
        res.status(200).json({
            suppliers: suppliers,
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


router.get('/:supplierId', (req, res, next) => {
    const supplierId = req.params.supplierId;
    Supplier.findById(supplierId).select('-password -__v').then((supplier) => {
        if (!supplier) {
            const error = new Error("Could not fetch the supplier.");
            error.statusCode = 500;
            throw error;
        }
        res.status(200).json({
            supplier: supplier,
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


router.put('/', isAuth, async (req, res, next) => {
    const storeName = req.body.storeName;
    const phone = req.body.phone;
    const storeLogoUrl = req.body.storeLogoUrl;
    const coverImageUrl = req.body.coverImageUrl;
    try {
        const result = await Supplier.updateOne({ _id: req.userId }, { storeName: storeName, phone: phone, storeLogoUrl: storeLogoUrl, coverImageUrl: coverImageUrl });
        if (result.matchedCount > 0) {
            return res.status(200).json({ message: 'Supplier updated successfully.', success: true });
        } else {
            const error = new Error("Could not update the supplier.");
            error.statusCode = 404;
            throw error;
        }
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