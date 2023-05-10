const express = require('express');
const user_route = express();
const path = require('path');
const multer = require('multer');
const user_control = require('../controllers/user_control')
const auth = require('../middlewares/userauth')
const nocache =require('nocache')
user_route.use(nocache())




//view engine
user_route.set('view engine','ejs');
user_route.set('views','./view/user');

user_route.get('/',user_control.home)
user_route.get('/login',auth.isLogout,user_control.login)
user_route.post('/login',auth.isLogout,user_control.verifyLogin)
user_route.get('/logout',auth.isLogin,user_control.logout)
user_route.get('/register',auth.isLogout,user_control.register)
user_route.post('/register',auth.isLogout,user_control.addUser)
user_route.get('/terms',user_control.terms)
user_route.post('/otpVerify',auth.isLogout,user_control.otpCompare)
user_route.get('/resendOTP/:mobileNo',auth.isLogout,user_control.resendOTP)

user_route.get('/forgotPassword',auth.isLogout,user_control.forgotPassword)
user_route.post('/forgotPassword',auth.isLogout,user_control.forgotPasswordOTP)
user_route.post('/forgotPasswordOTPverify',auth.isLogout,user_control.forgotPasswordOTPcompare)
user_route.get('/resendForgotOTP/:mobile',auth.isLogout,user_control.resendForgotOTP)
user_route.get('/newPassword',auth.isLogout,user_control.newPassword)
user_route.post('/newPassword',auth.isLogout,user_control.updateNewpassword)

user_route.get('/contact',user_control.contact)
user_route.get('/wishlist',auth.isLogin,user_control.wishlist)
user_route.get('/addtoWishlist/:_id',user_control.addtoWishlist)
user_route.get('/removefromWishlist/:_id',auth.isLogin,user_control.removefromWishlist)
user_route.get('/addtoCartfromWishlist/:_id',auth.isLogin,user_control.addtoCartfromWishlist)
user_route.get('/cart',auth.isLogin,user_control.cart)
user_route.get('/addtoCart/:_id',user_control.addtoCart)
user_route.get('/removefromCart/:_id',auth.isLogin,user_control.removefromCart)
user_route.post('/changeQty',auth.isLogin,user_control.changeQty)
user_route.get('/products',user_control.products)
user_route.get('/singleProduct/:_id',user_control.singleProduct)
user_route.post('/shopFilter',user_control.filterProduct)
user_route.get('/checkoutPage',auth.isLogin,user_control.checkoutPage)
user_route.post('/newAddress',auth.isLogin,user_control.newAddress)
user_route.post('/checkCoupon/:id',auth.isLogin,user_control.applyCoupon)
user_route.post('/placeOrder',auth.isLogin,user_control.placeOrder)
user_route.post('/verifyPayment',auth.isLogin,user_control.verifyPayment)
user_route.get('/orderConfirmed',auth.isLogin,user_control.orderConfirmed)
user_route.get('/profile',auth.isLogin,user_control.profile)
user_route.get('/editProfile',auth.isLogin,user_control.editProfile)
user_route.post("/updateProfile/:_id",user_control.updateProfile)
user_route.get('/addressList',auth.isLogin,user_control.addressList)
user_route.get('/editAddress/:_id',auth.isLogin,user_control.editAddress)
user_route.post('/updateAddress/:_id',auth.isLogin,user_control.updateAddress)
user_route.get('/deleteAddress/:_id',auth.isLogin,user_control.deleteAddress)
user_route.get('/myOrders',auth.isLogin,user_control.myOrders)
user_route.get('/orderDetails/:_id',auth.isLogin,user_control.orderDetails)
user_route.get('/returnOrder/:_id',auth.isLogin,user_control.returnOrder)
user_route.get('/cancelOrder/:_id',auth.isLogin,user_control.cancelOrder)
user_route.post('/cancelCoupon/:_id',auth.isLogin,user_control.cancelCoupon)
user_route.get('/walletAmount',auth.isLogin,user_control.walletAmount)
user_route.get('/walletHistory',auth.isLogin,user_control.walletHistory)
module.exports = user_route;