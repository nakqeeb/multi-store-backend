const express = require('express');
const mongoose = require('mongoose');
require("dotenv/config");

const app = express();

const customerRoutes = require('./routes/customer');
const supplierRoutes = require('./routes/supplier');
const productRoutes = require('./routes/product');
const categoryRoutes = require('./routes/category');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/order');
const reviewRoutes = require('./routes/review');
const addressRoutes = require('./routes/address');

app.use(express.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use('/customers', customerRoutes);
app.use('/suppliers', supplierRoutes);
app.use('/products', productRoutes);
app.use('/categories', categoryRoutes);
app.use('/carts', cartRoutes);
app.use('/orders', orderRoutes);
app.use('/reviews', reviewRoutes);
app.use('/addresses', addressRoutes);

mongoose.connect('mongodb+srv://nakqeeb:' + process.env.MONGO_ATLAS_PW + '@cluster0.rbc72.mongodb.net/multi-store-app').then(() => {
    console.log('Connected to database');
    const PORT = process.env.PORT || 3000;
    //Server
    const server = app.listen(PORT,'0.0.0.0', () => { // '0.0.0.0' is optional used to run server in all interface (eg. localhost, ip address)
        console.log('server is running http://localhost:3000');
    });
    const io = require('./socket').init(server);
    io.on("connection", (socket) => {
        console.log('Client connected');
    });
    
}).catch((err) => {
    console.log(err);
});;

