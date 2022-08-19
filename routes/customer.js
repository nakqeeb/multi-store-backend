const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");

const router = express.Router();

const isAuth = require('../middleware/is-auth');

const Customer = require('../models/customer');
const Address = require('../models/address');


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
                phone: req.body.phone,
                address: [],
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

/* // update customer by adding addresses
router.put('/addresses', isAuth, async (req, res, next) => {
    try {
        const address = await Address.create(req.body.addresses.map(m => {
            return {
                customerId: req.userId,
                name: m.name,
                phone: m.phone,
                pincode: m.pincode,
                address: m.address,
                landmark: m.landmark,
                city: m.city,
                state: m.state,
            };
        }));
        console.log(address);
        const result = await Customer.updateOne({ _id: req.userId }, { "$push": { addresses: address } });
        if (result.matchedCount > 0) {
            return res.status(200).json({ message: 'Address added/updated successfully.', success: true });
        } else {
            const error = new Error("Could not add/update the address.");
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

// update a particular address
router.put('/addresses/:addressId', isAuth, async (req, res, next) => {
    const addressId = req.params.addressId;
    try {
        const customer = await Customer.findById(req.userId);
        if (!customer) {
            const error = new Error("Customer Not Found.");
            error.statusCode = 404;
            throw error;
        }
        const result = await Address.updateOne({ _id: addressId, customerId: req.userId }, {
            name: req.body.name,
            phone: req.body.phone,
            pincode: req.body.pincode,
            address: req.body.address,
            landmark: req.body.landmark,
            city: req.body.city,
            state: req.body.state,
            isDefault: req.body.isDefault
        });
        if (result.matchedCount > 0) {
            return res.status(200).json({ message: 'Address updated successfully.', success: true });
        } else {
            const error = new Error("Could not update the address.");
            error.statusCode = 500;
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

// get all addresses associated to a specific customer 
router.get('/addresses', isAuth, async (req, res, next) => {
    const customerId = req.userId;
    try {
        const customer = await Customer.findById(customerId);
        if (!customer) {
            const error = new Error("Customer Not Found.");
            error.statusCode = 404;
            throw error;
        }
        const addresses = await Address.find({customerId: req.userId});

        return res.status(200).json({ addresses: addresses, success: true });

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

// delete an address by id
router.delete('/addresses/:addressId', isAuth, async (req, res, next) => {
    const addressId = req.params.addressId;
    try {
        const customer = await Customer.findById(req.userId);
        if (!customer) {
            const error = new Error('Customer Not Found.');
            error.statusCode = 404;
            throw error;
        }
        const result = await Address.deleteOne({ _id: addressId, customerId: req.userId });
        if (result.deletedCount > 0) {
            return res.status(200).json({ message: 'Deletion successful!', success: true });
        } else {
            const error = new Error('Not Authorized.');
            error.statusCode = 401;
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
}); */

module.exports = router;