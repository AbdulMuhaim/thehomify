const express = require("express");
const admin_route = express();
const admin_control = require('../controllers/admin_control')
const category_control = require('../controllers/category_control')
const product_control = require('../controllers/product_control')
const auth = require('../middlewares/adminauth')
const fs = require('fs');



//path module
const path = require('path');




//public folder is made static
admin_route.use(express.static(path.join(__dirname,'public')));




//view engine
admin_route.set('view engine','ejs');
admin_route.set('views','./view/admin');




//multer setup
const multer = require('multer')

const storage = multer.diskStorage({
    destination:function(req,file,callback){
        callback(null,path.join(__dirname,'../public/adminassets/images'));
    },
    filename:function(req,file,callback){
        const name = Date.now()+'-'+file.originalname;
        callback(null,name);
    }
});




//image validation
const fileFilter = function (req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
const upload = multer({storage:storage,fileFilter:fileFilter})



//admin routes
admin_route.get('/',auth.isLogout,admin_control.loadlogin)
admin_route.post('/login',admin_control.verifylogin)
admin_route.get('/dashboard',auth.isLogin,admin_control.dashboard)
admin_route.get('/userlist',auth.isLogin,admin_control.userlist)
admin_route.get('/blockuser/:_id',auth.isLogin,admin_control.blockuser)
admin_route.get('/unblockuser/:_id',auth.isLogin,admin_control.unblockuser)
admin_route.get('/logout',auth.isLogin,admin_control.logout)
admin_route.get('/addCoupon',auth.isLogin,admin_control.addCoupon)
admin_route.post('/addCoupon',auth.isLogin,admin_control.couponAdded)
admin_route.get('/couponList',auth.isLogin,admin_control.couponList)
admin_route.get('/blockCoupon/:_id',auth.isLogin,admin_control.blockCoupon)
admin_route.get('/unblockCoupon/:_id',auth.isLogin,admin_control.unblockCoupon)
admin_route.get('/editCoupon/:_id',auth.isLogin,admin_control.editCoupon)
admin_route.post('/updateCoupon/:_id',auth.isLogin,admin_control.updateCoupon)
admin_route.get('/orderList',auth.isLogin,admin_control.orderList)
admin_route.post('/orderStatus',auth.isLogin,admin_control.orderStatus)
admin_route.get('/vieworderDetails/:_id',auth.isLogin,admin_control.vieworderDetails)
admin_route.get('/bannerList', auth.isLogin,admin_control.bannerList)
admin_route.get('/addBanner',auth.isLogin,admin_control.addBanner)
admin_route.post('/addBanner',upload.single('image'),admin_control.addBannerPost)
admin_route.get('/blockBanner/:_id',auth.isLogin,admin_control.blockBanner)
admin_route.get('/unblockBanner/:_id',auth.isLogin,admin_control.unblockBanner)
admin_route.get('/editBanner/:_id',auth.isLogin,admin_control.editBanner)
admin_route.post('/updateBanner',upload.single('image'),admin_control.updateBanner)
admin_route.get('/salesReport',auth.isLogin,admin_control.salesReport)
admin_route.post('/generateReport',auth.isLogin,admin_control.generateReport)
admin_route.get('/downloadExcel',auth.isLogin,admin_control.downloadExcel)











//ptroduct routes
admin_route.get('/products',auth.isLogin,product_control.products)
admin_route.get('/addproducts',auth.isLogin,product_control.addproducts)
admin_route.post('/addproducts',auth.isLogin,upload.array('image',3),product_control.productadded)
admin_route.get('/blockproduct/:_id',auth.isLogin,product_control.blockproduct)
admin_route.get('/unblockproduct/:_id',auth.isLogin,product_control.unblockproduct)
admin_route.get('/editproduct/:_id',auth.isLogin,product_control.editproduct)
admin_route.post('/editproducts/:_id',auth.isLogin,upload.array('image',3),product_control.updateproduct)
admin_route.get('/deleteImage',auth.isLogin,product_control.deleteImage)




//category routes
admin_route.get('/addcategory',auth.isLogin,category_control.addcategory)
admin_route.get('/categories',auth.isLogin,category_control.categories)
admin_route.post('/addcategory',auth.isLogin,category_control.category_submit)
admin_route.get('/blockcategory',auth.isLogin,category_control.blockcategory)
admin_route.get('/unblockcategory',auth.isLogin,category_control.unblockcategory)
admin_route.get('/editcategory/:_id',auth.isLogin,category_control.editcategory)
admin_route.post('/editcategory/:_id',auth.isLogin,category_control.updatecategory)




module.exports = admin_route;




