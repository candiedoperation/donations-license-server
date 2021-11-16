var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');

var mongoDB = 'mongodb://localhost:27017/donations-server';
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true}, () => { console.log ("Connected to MongoDB") });

var indexRouter = require('./routes/index');
var db = mongoose.connection;
var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//Database Connection Error
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
app.use('/', indexRouter);

module.exports = app;
