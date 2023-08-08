const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const morgan = require('morgan');
require('dotenv').config();

// Custom Imports
const userRoute = require('./routes/usersRoutes')
const postRoute = require('./routes/postsRoutes')
const HttpError = require('./models/httpError');

const app = express();
const port = process.env.PORT || 3000;

// MongoDB Connection
mongoose.connect(`mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.iu28p.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log("Connected to Database :)");
});

// // Middlewares
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

app.use(bodyParser.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE')
    next();
})

// Logging incoming api resquests to the terminal and to the file
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });
app.use(morgan(':method :url :status :res[content-length] :response-time ms :res[header]'));
app.use(morgan(':method :url :status :res[content-length] :response-time ms :res[header]', { stream: accessLogStream }));


// Routes
app.use('/users', userRoute);
app.use('/posts', postRoute);


// Unsupported/Unknown Routes
app.use((req, res, next) => {
    throw new HttpError('This route is not supported by me', 404);
});

// Handling Unhandled/Unknown Errors
app.use((error, req, res, next) => {
    console.log(error);
    if (res.headerSent) {
        return next(error);
    } else {
        res.status(error.code || 500);
        res.json({ message: error.message || 'An unknown error occured!' })
    }
});


app.listen(port, () => {
    console.log(`Connected to port ${port} :)`)
})