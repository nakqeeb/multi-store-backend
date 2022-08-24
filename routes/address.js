const express = require('express');

const router = express.Router();

const isAuth = require('../middleware/is-auth');

const Customer = require('../models/customer');
const Address = require('../models/address');


// add address
router.post('/', isAuth, async (req, res, next) => {
    try {
        const address = new Address({
            customerId: req.userId,
            name: req.body.name,
            phone: req.body.phone,
            pincode: req.body.pincode,
            address: req.body.address,
            landmark: req.body.landmark,
            city: req.body.city,
            state: req.body.state,
        });
        const addedAddress = await address.save();
        if (!addedAddress) {
            const error = new Error("Could not add the address.");
            error.statusCode = 500;
            throw error;
        }
        res.status(200).json({
            address: addedAddress,
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

// update a particular address
router.put('/:addressId', isAuth, async (req, res, next) => {
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
router.get('/', isAuth, async (req, res, next) => {
    const customerId = req.userId;
    try {
        const customer = await Customer.findById(customerId);
        if (!customer) {
            const error = new Error("Customer Not Found.");
            error.statusCode = 404;
            throw error;
        }
        const addresses = await Address.find({ customerId: customerId });

        if (!addresses) {
            const error = new Error("Addresses Not Found.");
            error.statusCode = 404;
            throw error;
        }

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

// get a single address
router.get('/:addressId', isAuth, async (req, res, next) => {
    const addressId = req.params.addressId;
    const customerId = req.userId;
    try {
        const customer = await Customer.findById(customerId);
        if (!customer) {
            const error = new Error("Customer Not Found.");
            error.statusCode = 404;
            throw error;
        }
        const address = await Address.findOne({ _id: addressId, customerId: customerId });

        if (!address) {
            const error = new Error("Address Not Found.");
            error.statusCode = 404;
            throw error;
        }

        return res.status(200).json({ address: address, success: true });

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
router.delete('/:addressId', isAuth, async (req, res, next) => {
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
});

module.exports = router;