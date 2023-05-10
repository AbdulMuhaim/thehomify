//database connection
const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/Ecommerce');


const dotenv=require('dotenv').config()


//express assigning to app
const express = require('express');

const app = express();

//path module
const path = require('path');


//nocache setup globally
const nocache = require('nocache');
app.use(nocache());


//public folder is made static
app.use(express.static(path.join(__dirname,'public')));

//session setup globally
const session = require('express-session');
app.use(session({secret:'muhaim',saveUninitialized:true,resave:false,cookie:({maxAge:100000000})}))

//bodyparser setup globally
const body_parser = require('body-parser');
app.use(body_parser.json());
app.use(body_parser.urlencoded({extended:true}))


//for user routes
const user_route = require('./routes/user_route');
app.use('/',user_route);




//for admin routes
const admin_route = require('./routes/admin_route');
app.use('/admin',admin_route);

//port setup(local url)
app.listen(3001,()=>{
    console.log('server started');
})









