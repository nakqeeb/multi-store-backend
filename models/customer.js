const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const Address = require('./address').schema;

const customerSchema = new mongoose.Schema(
  {
    // _id: { type: String, required: true }, // use it if you want to add your own custom _id
    name: {
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
    profileImageUrl: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      default: ''
    },
    cart: {
      items: [
        {
          productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
          },
          quantity: { type: Number, required: true }
        }
      ]
    },
    wishlist: [
        
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
          },
        
      ]
  },
  { timestamps: true }
);

customerSchema.plugin(uniqueValidator);

customerSchema.methods.addToCart = function (product) {
  const cartProductIndex = this.cart.items.findIndex(cp => {
    return cp.productId.toString() === product._id.toString();
  });
  let newQuantity = 1;
  const updatedCartItems = [...this.cart.items];

  if (cartProductIndex >= 0) {
    newQuantity = this.cart.items[cartProductIndex].quantity + 1;
    updatedCartItems[cartProductIndex].quantity = newQuantity;
  } else {
    updatedCartItems.push({
      productId: product._id,
      quantity: newQuantity
    });
  }
  const updatedCart = {
    items: updatedCartItems
  };
  this.cart = updatedCart;
  return this.save();
};

customerSchema.methods.reduceQuantityByOne = function (product) {
  const cartProductIndex = this.cart.items.findIndex(cp => {
    return cp.productId.toString() === product._id.toString();
  });
  let newQuantity = 0;
  const updatedCartItems = [...this.cart.items];

  if (cartProductIndex >= 0) {
    newQuantity = this.cart.items[cartProductIndex].quantity - 1;
    updatedCartItems[cartProductIndex].quantity = newQuantity;
    if (newQuantity <= 0) {
      updatedCartItems.splice(cartProductIndex, 1); // 2nd parameter means remove one item only
    }
  } else {
    updatedCartItems.push({
      productId: product._id,
      quantity: newQuantity
    });
  }

  const updatedCart = {
    items: updatedCartItems
  };
  this.cart = updatedCart;
  return this.save();
};

customerSchema.methods.removeFromCart = function (productId) {
  const updatedCartItems = this.cart.items.filter(item => {
    return item.productId.toString() !== productId.toString();
  });
  this.cart.items = updatedCartItems;
  return this.save();
};

customerSchema.methods.clearCart = function () {
  this.cart = { items: [] };
  return this.save();
};


// use it if you want to add id feild that has same value as _id
/* customerSchema.virtual('id').get(function () {
    return this._id.toHexString();
});
customerSchema.set('toJSON', {
    virtuals: true,
}); */

module.exports = mongoose.model('Customer', customerSchema);
