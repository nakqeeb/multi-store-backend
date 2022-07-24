const express = require('express');

const router = express.Router();
const isAuth = require('../middleware/is-auth');

const Cart = require('../models/cart');
const Customer = require('../models/customer');
const Product = require('../models/product');

/* router.post('/', isAuth, async (req, res, next) => {
    const cart = new Cart({
        customerId: req.userId,
        cartItems: req.body.cartItems.map(m => {
            return {
                quantity: m.quantity,
                product: m.product
            };
        })
    });
    cart.save().then(addedcart => {
        //subcart.save();
        res.status(200).json({
            cart: addedcart,
            success: true
        });
    }).catch(error => {
        // console.log(error.errors.customerId.value);
        if (error.errors.customerId.value == req.userId) {
            res.status(403).json({
                message: 'The cart for current user is already exist.',
                success: false
            });
            return; // return is must to avoid 'ERR_HTTP_HEADERS_SENT' error
        }
        res.status(500).json({
            message: 'Could not add to cart.',
            success: false
        });
    });
});
*/



/*router.put('/:prodId', isAuth, async (req, res, next) => {
    var customerId = req.userId;
    var prodId = req.params.prodId;
    let cartItemsIndex;

    try {
        var cart = await Cart.findOne({ 'customerId': customerId, 'cartItems.product': prodId });

        if (!cart) {
            const error = new Error("Could not fetch the cart.");
            error.statusCode = 404;
            throw error;
        }
        // else if cart is exist
        cartItemsIndex = cart.cartItems.findIndex(cp => {
            return cp.product == prodId;
        });
        //console.log('index here: ' + cartItemsIndex);
        var quantity = req.body.quantity;
        //console.log('qty here: ' + +quantity);

        var result = await Cart.updateOne(
            { 'customerId': customerId, 'cartItems.product': prodId },
            { $inc: { 'cartItems.$.quantity': quantity } } //note dollar sign
        );
        console.log(result);
        if (result.matchedCount > 0) {
            if (quantity > 0) {
                return res.status(200).json({ message: 'The Product quantity is increased by ' + quantity + '.', success: true });
            } else if (quantity == 0) {
                return res.status(200).json({ message: 'The Product quantity is not changed.', success: true });
            } else if (quantity < 0) {
                return res.status(200).json({ message: 'The Product quantity is decreased by ' + quantity + '.', success: true });
            } else {
                return res.status(200).json({ message: 'Updated successfully!', success: true });
            }
        } else {
            const error = new Error("Not Authorized.");
            error.statusCode = 401;
            throw error;
        }
    } catch (error) {
        if (!error.statusCode) {
            return res.status(401).json({
                message: "Unauthorized access.",
                success: false
            });
        }
        return res.status(500).json({
            message: error.message,
            success: false
        });
    }
}); */

// fetch the cart
router.get('/', isAuth, (req, res, next) => {
    //Customer.findById(req.userId).select('-password -__v').populate('cart.items.productId', 'productName price supplier')
    Customer.findById(req.userId).select('-password -__v').populate('cart.items.productId').then((customer) => {
        if (!customer) {
            const error = new Error("No user exist with this credentials.");
            error.statusCode = 401;
            throw error;
        }
        res.status(200).json({
            customer: customer,
            success: true
        });
    }).catch(err => {
        // console.log(err);
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

// add to cart by one
router.post('/increase-quantity-by-one', isAuth, async (req, res, next) => {
    const prodId = req.body.productId;
    const customer = await Customer.findById(req.userId);
    // console.log(customer);
    if (!customer) {
        const error = new Error("No user exist with this credentials.");
        error.statusCode = 401;
        throw error;
    }
    Product.findById(prodId)
        .then((product) => {
            if (!product) {
                const error = new Error("No product found.");
                error.statusCode = 401;
                throw error;
            }
            return customer.addToCart(product);
        })
        .then((result) => {
            // console.log(result);
            if (!result) {
                const error = new Error("Item can not be added to cart");
                error.statusCode = 401;
                throw error;
            }
            res.status(200).json({ message: 'Item added to cart successfully.', cart: result.cart, customerId: result._id, success: true });
        })
        .catch((error) => {
            if (!error.statusCode) {
                return res.status(401).json({
                    message: "Unauthorized access.",
                    success: false
                });
            }
            return res.status(500).json({
                message: error.message,
                success: false
            });
        });
});

// reduce quantity by one
router.post('/reduce-quantity-by-one', isAuth, async (req, res, next) => {
    const prodId = req.body.productId;
    const customer = await Customer.findById(req.userId);
    // console.log(customer);
    if (!customer) {
        const error = new Error("No user exist with this credentials.");
        error.statusCode = 401;
        throw error;
    }
    Product.findById(prodId)
        .then((product) => {
            if (!product) {
                const error = new Error("No product found.");
                error.statusCode = 401;
                throw error;
            }
            return customer.reduceQuantityByOne(product);
        })
        .then((result) => {
            // console.log(result);
            if (!result) {
                const error = new Error("Quantity can not be reduced");
                error.statusCode = 401;
                throw error;
            }
            res.status(200).json({ message: 'Quantity reduced successfully.', cart: result.cart, customerId: result._id, success: true });
        })
        .catch((error) => {
            if (!error.statusCode) {
                return res.status(401).json({
                    message: "Unauthorized access.",
                    success: false
                });
            }
            return res.status(500).json({
                message: error.message,
                success: false
            });
        });
});


// remove one item
router.post('/:productId', isAuth, async (req, res, next) => {
    const prodId = req.params.productId;
    const customer = await Customer.findById(req.userId);
    if (!customer) {
        const error = new Error("No user exist with this credentials.");
        error.statusCode = 401;
        throw error;
    }
    Product.findById(prodId)
        .then((product) => {
            if (!product) {
                const error = new Error("No product found.");
                error.statusCode = 401;
                throw error;
            }
            return customer.removeFromCart(product._id);
        })
        .then((result) => {
            // console.log(result);
            if (!result) {
                const error = new Error("Item can not be deleted from cart");
                error.statusCode = 401;
                throw error;
            }
            res.status(200).json({ message: 'Item deleted from cart successfully.', cart: result.cart, customerId: result._id, success: true });
        })
        .catch((error) => {
            if (!error.statusCode) {
                return res.status(401).json({
                    message: "Unauthorized access.",
                    success: false
                });
            }
            return res.status(500).json({
                message: error.message,
                success: false
            });
        });
});

// clear the cart (remove all items)
router.delete('/', isAuth, async (req, res, next) => {
    try {
        const customer = await Customer.findById(req.userId);
        if (!customer) {
            const error = new Error("No user exist with this credentials.");
            error.statusCode = 401;
            throw error;
        }
        const result = await customer.clearCart();
        if (!result) {
            const error = new Error("Cart can not be cleared");
            error.statusCode = 401;
            throw error;
        }
        res.status(200).json({ message: 'Cart cleared successfully.', cart: result.cart, customerId: result._id, success: true });
    }
    catch (error) {
        if (!error.statusCode) {
            return res.status(401).json({
                message: "Unauthorized access.",
                success: false
            });
        }
        return res.status(500).json({
            message: error.message,
            success: false
        });
    }
});


module.exports = router;
