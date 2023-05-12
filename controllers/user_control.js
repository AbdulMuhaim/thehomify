const bcrypt = require("bcrypt");
const user = require("../models/user_schema");
const product = require("../models/product_schema");
const category = require("../models/category_schema")
const { TrustProductsEntityAssignmentsContextImpl } = require("twilio/lib/rest/trusthub/v1/trustProducts/trustProductsEntityAssignments");
const order = require("../models/order_schema")
let session;
let walletDis = 0;
let couponDis = 0;
const { v4: uuidv4 } = require("uuid");
const coupon = require("../models/coupon_schema")
const razorpay = require('razorpay');
const banner = require('../models/banner_schema')
const walletData = require('../models/wallet_schema')
let dotenv=require("dotenv");
const { log } = require("console");
dotenv.config()
var instance = new razorpay({
  key_id: process.env.keyid,
  key_secret: process.env.secret
});
const client = require("twilio")(
  process.env.tid,
  process.env.token,
  {
    lazyLoading: true,
  }
);
const home = async (req, res) => {
  const userData = await user.findOne({ _id: req.session.user_id });
  const bannerData = await banner.find({status:true}).limit(5).lean();
  const productData = await product.find({}).limit(8).lean();
  try {    
    if (req.session.user_id == undefined) {
      res.render("home", { userData: 0 ,bannerData ,productData});
    } else {
      res.render("home", { userData: userData.name ,bannerData,productData });
    }
  } catch (error) {
    console.log(error.message);
  }
};
const login = async (req, res) => {
  try {
    res.render("userlogin", { message: undefined });
  } catch (error) {
    console.log(error.message);
  }
};
const logout = async (req, res) => {
    try {
      req.session.user_id = null;
      res.redirect("/");
    } catch (error) {
      console.log(error.message);
    }
  };
const register = async (req, res) => {
  try {
    res.render("register");
  } catch (error) {
    console.log(error.message);
  }
};
const terms = async (req, res) => {
  try {
    res.render("terms");
  } catch (error) {
    console.log(error.message);
  }
};
const addUser = async (req, res) => {
  try {
    const user_data = req.body;
    const mobileNo = user_data.mobile;
    const user_db = await user.findOne({ mobile: mobileNo });
    if (user_db) {
      res.render("register", { message: "Mobile number already exist" });
    } else {
      req.session.userdata = req.body;
      const otp_response = await client.verify.v2
        .services("VAb52c2b53161a792160fa123695d1b6d0")
        .verifications.create({
          to: `+91${mobileNo}`,
          channel: "sms",
        });
      res.render("otpverify", { mobileNo });
    }
  } catch (error) {
    console.log(error.message);
  }
};
const otpCompare = async (req, res) => {
  try {
    userdata = req.session.userdata;
    otp = req.body.otp;
    const verifiedresponse = await client.verify.v2
      .services("VAb52c2b53161a792160fa123695d1b6d0")
      .verificationChecks.create({
        to: `+91${userdata.mobile}`,
        code: otp,
      });
    if (verifiedresponse.status == "approved") {
      userdata.password = await bcrypt.hash(userdata.password, 10);
      const data = new user(userdata);
      data.save().then((data) => {
        session = req.session;
        session.userid = userdata;
        res.redirect("/");
      });
    } else {
      res.render("otpverify", {
        message: "The otp you have entered is incorrect",
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};
const resendOTP = async (req, res) => {
  const mobileNo = req.params.mobileNo;
  try {
    const otp_response = await client.verify.v2
      .services("VAb52c2b53161a792160fa123695d1b6d0")
      .verifications.create({
        to: `+91${mobileNo}`,
        channel: "sms",
      });
    res.render("otpverify", { mobileNo });
  } catch (error) {
    console.log(error.message);
  }
};
const forgotPassword = async (req, res) => {
    try {
      res.render("forgotPassword");
    } catch (error) {
      console.log(error.message);
    }
  };
  const forgotPasswordOTP = async (req, res) => {
    try {
      const mobile = req.body.mobile;  
      const userData = await user.findOne({ mobile: mobile }); 
      if (userData) {
        req.session.userdata = req.body;
        const otp_response = await client.verify.v2
          .services("VAb52c2b53161a792160fa123695d1b6d0")
          .verifications.create({
            to: `+91${userData.mobile}`,
            channel: "sms",
          });
          res.render("forgotPasswordOTPverify",{mobile});      
      } else {
        res.render("forgotPassword", { message: "Mobile Number doesn't exist" });
      }
    } catch (error) {
      console.log(error.message);
    }
  };
  const resendForgotOTP = async (req, res) => {
    const mobile = req.params.mobile;
    try {
      const otp_response = await client.verify.v2
        .services("VAb52c2b53161a792160fa123695d1b6d0")
        .verifications.create({
          to: `+91${mobile}`,
          channel: "sms",
        }); 
      res.render("forgotPasswordOTPverify", { mobile });
    } catch (error) {
      console.log(error.message);
    }
  };
    const forgotPasswordOTPcompare = async (req, res) => {
    try {
      userdata = req.session.userdata;
      otp = req.body.otp;
      const verifiedresponse = await client.verify.v2
        .services("VAb52c2b53161a792160fa123695d1b6d0")
        .verificationChecks.create({
          to: `+91${userdata.mobile}`,
          code: otp,
        });
      if (verifiedresponse.status == "approved") {
        res.redirect("/newPassword");
      } else {
        res.render("forgotPasswordOTPverify", {
          message: "The otp you have entered is incorrect",
        });
      }
    } catch (error) {
      console.log(error.message);
    }
  };
    const newPassword = async (req, res) => { 
    try {
      res.render("newPassword");
    } catch (error) {
      console.log(error.message);
    }
  };
    const updateNewpassword = async (req, res) => {
    const userData = req.session.userdata;
    const mobile = userData.mobile;
    const password = req.body.password; 
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const userdata = await user.updateOne(
        { mobile: mobile },
        { $set: { password: hashedPassword } }
      );
      res.redirect("/login");
    } catch (error) {
      console.log(error.message);
    }
  };
const verifyLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const userData = await user.findOne({ email: email });
    if (userData) {
      const passwordmatch = await bcrypt.compare(password, userData.password);
      if (passwordmatch) {
        if (userData.status == true) {
          req.session.user_id = userData._id;
          res.redirect("/");
        } else {
          res.render("userlogin", { message: "Sorry admin blocked you" });
        }
      } else {
        res.render("userlogin", { message: "password is incorrect" });
      }
    } else {
      res.render("userlogin", { message: "email is incorrect" });
    }
  } catch (error) {
    console.log(error.message);
  }
};
const contact = async (req, res) => {
  const userData = await user.findOne({ _id: req.session.user_id });
  try {
    if (req.session.user_id == undefined) {
      res.render("contact", { userData: 0 });
    } else {
      res.render("contact", { userData: userData.name });
    }
  } catch (error) {
    console.log(error.message);
  }
};
const wishlist = async (req, res) => {
  const userData = await user.findOne({ _id: req.session.user_id });
  const wishfind = await user
    .findOne({ _id: req.session.user_id })
    .populate("wishlist.productid");
  try {
    if (req.session.user_id == undefined) {
      res.render("wishlist", { userData: 0 });
    } else {
      res.render("wishlist", { userData: userData.name, wishfind });
    }
  } catch (error) {
    console.log(error.message);
  }
};
const addtoWishlist = async (req, res) => {
  try {
    if (req.session.user_id ) {
      const productData = await product.find({});
      const userData = await user.findOne({ _id: req.session.user_id });
      const productId = req.params._id;
      const wishlistdataFind = await user.findOne({
        _id:  req.session.user_id,
        "wishlist.productid": productId,
      });
      if (wishlistdataFind) {
        res.json({ message: "Product already in wishlist" });
        return;
      }
       await user.updateOne(
        { _id:  req.session.user_id },
        { $push: { wishlist: { productid: productId } } }
      );
      res.json({ message: "Product added to wishlist" });
     } else {
    res.json({ message: "hello" });
  }
 } catch (error) {
    console.log(error.message);
  }
};
const removefromWishlist = async (req, res) => {
  const userData = await user.findOne({ _id: req.session.user_id });
  const productId = req.params._id;
  try {
    await user.updateOne(
      { _id: req.session.user_id },
      { $pull: { wishlist: { productid: productId } } }
    );
    res.redirect("/wishlist");
  } catch (error) {}
};
const addtoCartfromWishlist = async (req, res) => {
  const productData = await product.find({});
  const userData = await user.findOne({ _id: req.session.user_id });
  const productId = req.params._id;
  try {
    if (req.session.user_id == undefined) {
      res.redirect("/login");
    } else {     
      const cartdataFind = await user.findOne({
        _id: req.session.user_id,
        "cart.productid": productId,
      });
      if (cartdataFind) {       
        res.redirect('/wishlist')
      } else {
        await user.updateOne(
          { _id: req.session.user_id },
          { $push: { cart: { productid: productId } } }
        );
        await user.updateOne(
          { _id: req.session.user_id },
          { $pull: { wishlist: { productid: productId } } }
        );

        res.redirect("/wishlist");
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};
const cart = async (req,res) => {
  const userData = await user.findOne({ _id: req.session.user_id });
  const User = await user
    .findOne({ _id: req.session.user_id })
    .populate("cart.productid");
    const totalbill = User.totalbill
    if(User.cart.length === 0){
      await user.updateOne({_id: req.session.user_id },{$set:{totalbill:0}});
    }
  try {
    if (req.session.user_id == undefined) {
      res.redirect('/login')
    } else {
      res.render("cart", {userData:userData.name,User,totalbill});
    }
  } catch (error) {
    console.log(error.message);
  }
};
const addtoCart = async (req, res) => {
  try {
    if (req.session.user_id ) {
      const userdata = req.session.user_id;
      if (userdata) {
        const id = req.params._id;       
        const productdata = await product.findOne({ _id: id });     
        const User = await user.findOne({
          _id: userdata,
          "cart.productid": id,
        });
        if (!productdata.stock) {     
          res.json({ message: "Product is out of stock" });
          return;
        }
        if (User) {
          res.json({ message: "Product already in cart" });
          return;
        }
        await user.updateOne(
          { _id: userdata },
          { $push: { cart: { productid: id } } }
        );
        const pPrice = productdata.price * 1;
        const Userdt = await user
        .findOne({ _id: req.session.user_id })
        .populate("cart.productid");
        const totalbill = Userdt.totalbill+pPrice
        await user.updateOne(
          { _id: userdata, "cart.productid": id },
          { $set: { "totalbill": totalbill } });

        await user.updateOne(
          { _id: userdata, "cart.productid": id },
          { $set: { "cart.$.total": pPrice } });

        res.json({ message: "Product added to cart" });
      } else {
        res.json({ message: "Unauthorized" });
      }
    } else {
      res.json({ message: "hello" }); 
    }
  } catch (error) {
    console.log(error.message);
  }
};
const removefromCart = async (req, res) => {
  const userdata = req.session.user_id;
  const productId = req.params._id;
  const productdata = await product.findOne({ _id: productId });
  const pPrice = productdata.price 
  const Userdt = await user
  .findOne({ _id: userdata })
  .populate("cart.productid");
  const totalbill = Userdt.totalbill-pPrice
  await user.updateOne(
    { _id: userdata, "cart.productid": productId },
    { $set: { "totalbill": totalbill } });
  try {
    await user.updateOne(
      { _id: req.session.user_id },
      { $pull: { cart: { productid: productId } } });
      res.json({ message: "removeTrue" });
  } catch (error) {
    console.log(error.message);
  }
};
const products = async (req, res) => {
  const pageNo = req.query.page;
  const perPage = 6;
  let docCount;
  let search = '';
  if(req.query.search){
    search = req.query.search;
  }
  let Pcategory = '';
  if(req.query.Pcategory){
    Pcategory = req.query.Pcategory
  }
  let sort = '';
  var value;
  if(req.query.sort){
    if(req.query.sort == "low"){
      value = 1;
    }else{
      value = -1;
    }
  }
  const userData = await user.findOne({ _id: req.session.user_id });
  const productData2 = await product.find({})
  const productData = await product.find({status:true}).countDocuments().then(documents => {
  docCount = documents;
  return product.find({status:true,$or:[{name:{$regex:'.*'+search+'.*',$options:'i'}}]}).
  sort({price:value}).skip((pageNo-1)*perPage).limit(perPage)
 })
    const categories = await category.find({}); 
 try {
    if (req.session.user_id == undefined) {
      res.render("products", { userData: 0,productData,productData2,categories,currentPage:pageNo,
        totalDocuments:docCount,pages:Math.ceil(docCount/perPage)});
    } else {
      res.render("products", { userData: userData.name,productData2,productData,
      categories,currentPage:pageNo,totalDocuments:docCount,pages:Math.ceil(docCount/perPage)});
    }
  } catch (error) {
    console.log(error.message);
  }
};
const singleProduct = async (req, res) => {
  const userData = await user.findOne({ _id: req.session.user_id });
  const id = req.params._id;
  const singleProduct = await product.find({ _id: id }).populate("categoryid");
  const prodId = singleProduct._id;
  try {
    if (req.session.user_id == undefined) {
      res.render("singleproduct", { userData: 0, singleProduct,id });
    } else {
      res.render("singleproduct", { userData: userData.name, singleProduct,id });
    }
  } catch (error) {
    console.log(error.message);
  }
};
const filterProduct = async (req, res) => {
  try {
    let producte;
    let products = [];
    let Categorys;
    let Data = [];
    let Datas = [];
    const { categorys, search, brands, filterprice,sortField ,sort} = req.body;
    const sortOption = sort === "priceHighToLow" ? { price: -1 } : { price: 1 };
    if (!search) {
      if (filterprice != 0) {
        if (filterprice.length == 2) {
          producte = await product.find({
            status: true,
            $and: [
              { price: { $lte: Number(filterprice[1]) } },
              { price: { $gte: Number(filterprice[0]) } },
            ],
          })
            .populate("categoryid")
            .sort(sortOption)
            
        } else {
          producte = await product.find({
            status: true,
            $and: [{ price: { $gte: Number(filterprice[0]) } }],
          })
            .populate("categoryid")
            .sort(sortOption)
        }
      } else {
        producte = await product.find({ status: true })
          .populate("categoryid")
          .sort(sortOption)
      }
    } else {
      if (filterprice != 0) {
        if (filterprice.length == 2) {
          producte = await product.find({
            status: true,
            $and: [
              { price: { $lte: Number(filterprice[1]) } },
              { price: { $gte: Number(filterprice[0]) } },
              {
                $or: [
                  {
                    name: {
                      $regex: ".*" + search + ".*",
                      $options: "i",
                    },
                  },
                ],
              },
            ],
          })
            .populate("categoryid")
            .sort(sortOption)
        } else {
          producte = await product.find({
            status: true,
            $and: [
              { price: { $gte: Number(filterprice[0]) } },
              {
                $or: [
                  {
                    name: {
                      $regex: ".*" + search + ".*",
                      $options: "i",
                    },
                  },
                ],
              },
            ],
          })
            .populate("categoryid")
            .sort(sortOption)
        }
      } else {
        producte = await product.find({
          status: true,
          $or: [
            { name: { $regex: ".*" + search + ".*", $options: "i" } },
          ],
        })
          .populate("categoryid")
          .sort(sortOption)
      }
    }
    Categorys = categorys.filter((value) => {
      return value !== null;
    });
    if (Categorys[0]) {
      Categorys.forEach((element, i) => {
        products[i] = producte.filter((value) => {
          console.log(value.categoryid.name,+"     ",+element);
          return value.categoryid.name == element;
         
        });
      });

      products.forEach((value, i) => {
        Data[i] = value.filter((v) => {
          return v;
        });
      });

      if (brands) {
        brands.forEach((value, i) => {
          Data.forEach((element) => {
            Datas[i] = element.filter((producte) => {
              return producte.brand.brandName == value;
            });
          });
        });
      }
      Datas.forEach((value, i) => {
        Data[i] = value;
      });
    } else {
      if (brands) {
        brands.forEach((value, i) => {
          Data[i] = producte.filter((element) => {
            return element.brand.brandName == value;
          });
        });
      } else {
        Data[0] = producte;
      }
    }   
    res.json({ Data });
  } catch (error) {
    console.log(error.message);
  }
};
const changeQty = async (req, res) => {
  try {   
    if (req.session.user_id) {
      const userdata = req.session.user_id;
      const count = req.body.count;
      const id = req.body.product;
      const price1 = req.body.price;
      const incr = await user.updateOne(
        { _id: userdata, "cart.productid": id },
        { $inc: { "cart.$.quantity": count } }
      ); 
      const cartfind = await user.findOne(
        { _id: userdata, "cart.productid": id },
        { "cart.$": 1 }
      );
      const proPrice = price1 * cartfind.cart[0].quantity;
      const realPrice = await user.updateOne(
        { _id: userdata, "cart.productid": id },
        { $set: { "cart.$.total": proPrice } }
      );    
      const cartFind = await user.findOne({ _id: userdata }, { cart: 1 }); 
      const cartTotal = cartFind.cart.reduce((total1, item) => {
        return total1 + item.total;
      }, 0);
      await user.updateOne({ _id: userdata }, { totalbill: cartTotal });
      res.json({ success: true, proPrice, cartTotal });
    }
  } catch (error) {
    console.log(error.message);
  }
};
const checkoutPage = async (req, res) => {
  try {
    const userDatas = await user.findOne({ _id: req.session.user_id }).lean();
    const address = userDatas.address;
    const userdata = req.session.user_id;
    const cartfind = await user.findOne({ _id: userdata })
      .populate("cart.productid")
      .lean();
    const result = await user.findOne({ _id: userdata }, { _id: 1 }).lean();
    const userId = result._id.toString();
    const userData = cartfind.name
    let totalbill = cartfind.totalbill
    let wallet = cartfind.wallet
    res.render("check", {
      userdata,
      address:address,
      cartfind:cartfind,
      totalbill,
      userId,
      userData,
      wallet
    });
  } catch (error) {
    console.log(error.message);
  }
};
const newAddress = async(req,res)=>{
  try {
const newAddress = {
  name:req.body.name,
  company:req.body.company,
  street:req.body.street,
  district:req.body.district,
  state:req.body.state,
  country:req.body.country,
  pincode:req.body.pincode
}
 await user.updateOne(
  { _id: req.session.user_id },
  { $push: {address:{...newAddress}} });
res.redirect('/checkoutPage')
  } catch (error) {
    console.log(error.message);
  }
}
const placeOrder = async (req, res) => {
  try {
    if (req.session.user_id) {
      const userdata = req.session.user_id;
      const userdt = await user.findOne({ _id: userdata });
      const orderDetails = req.body;
      const productdt = [];
      orderDetails.products = productdt;
      if (req.body.paymentType === "cash on delivery") {
        if (!Array.isArray(orderDetails.productid)) {
          orderDetails.productid = [orderDetails.productid];
        }
        if (!Array.isArray(orderDetails.quantity)) {
          orderDetails.quantity = [orderDetails.quantity];
        }
        if (!Array.isArray(orderDetails.price)) {
          orderDetails.price = [orderDetails.price];
        }
        for (let i = 0; i < orderDetails.productid.length; i++) {
          const product1 = orderDetails.productid[i];
          const quantity = orderDetails.quantity[i];
          const total = orderDetails.price[i];
          productdt.push({
            productId: product1,
            quantity: quantity,
            singleTotal: total,
          });
        }
        const order_id = "order_id_";
        orderDetails.couponCode = req.body.coupon;
        orderDetails.discount = req.body.discount;
        orderDetails.orderId = order_id + uuidv4(); 
        orderDetails.date = Date.now();
        const latestorder = orderDetails.orderId;
        const orderdt = new order(orderDetails);
        orderdt.save();
        res.json({ codStatus: true });
      } else if (req.body.paymentType === "online payment") {
        if (!Array.isArray(orderDetails.productid)) {
          orderDetails.productid = [orderDetails.productid];
        }
        if (!Array.isArray(orderDetails.quantity)) {
          orderDetails.quantity = [orderDetails.quantity];
        }
        if (!Array.isArray(orderDetails.price)) {
          orderDetails.price = [orderDetails.price];
        }
        for (let i = 0; i < orderDetails.productid.length; i++) {
          const product1 = orderDetails.productid[i];
          const quantity = orderDetails.quantity[i];
          const total = orderDetails.price[i];
          productdt.push({
            productId: product1,
            quantity: quantity,
            singleTotal: total,
          });
        }
        const order_id = "order_id_";
        orderDetails.status = "Failed";
        orderDetails.couponCode = req.body.coupon;
        orderDetails.discount = req.body.discount;
        orderDetails.date = Date.now();
        orderDetails.orderId = order_id + uuidv4();
        const latestorder = orderDetails.orderId;
        const orderdt = new order(orderDetails);
        orderdt.save();
        const finalTotal = orderDetails.total-(couponDis+walletDis)
        let options = {
          amount: finalTotal * 100, // amount in the smallest currency unit
          currency: "INR",
          receipt: "" + orderdt._id,
        };     
        instance.orders.create(options, function (err, order) {
          res.json(order);
        });
      }
    }
  } catch (error) {
    res.redirect("/checkoutPage");
  }
};
const verifyPayment = async (req, res) => {
  try {
    const latestOrder = await order
      .findOne({}, { _id: 1 })
      .sort({ date: -1 })
      .populate("products.productId")
      .lean();
    const latestOrderId = latestOrder._id.toString();
    const crypto = require("crypto");
    let hmac = crypto.createHmac("sha256", "tTIQJkJw52gKqzn1iE0GLgBC");
    hmac.update(
      req.body.response.razorpay_order_id +
      "|" +
      req.body.response.razorpay_payment_id
    );
    hmac = hmac.digest("hex");   
    if (hmac === req.body.response.razorpay_signature) {
      await order.updateOne(
        { _id: latestOrderId },
        { $set: { status: "Placed" } }
      );
      res.json({ status: true });
    } else {
      await order.updateOne(
        { _id: latestOrderId },
        { $set: { status: "Payment Failed" } }
      );
      res.json({ status: false });
    }
  } catch (error) {
    console.log(error.message);
  }
};
const orderConfirmed = async (req, res) => {
  try {
    const id = req.session.user_id
    if(walletCheck==true){
    const Idd = await order.findOne({}).sort({date:-1})
    const orderId = Idd.orderId  
    const userData =await user.findOne({_id:id})
    const wall = userData.wallet
    const walletDt = {
      status:"debited",
      amount:wall,
      date:Date.now(),
      userId:id,
      orderId:orderId
    }
    const Data = new walletData(walletDt)
    Data.save();
  }
    console.log("confo3");
    const orderData = await order.findOne({})
    const userdata = req.session.user_id;
    const userData = await user.findOne({_id:userdata})
    const totalbill = userData.totalbill
    const totaaal = totalbill-(couponDis+walletDis);
    const billAmount = userData.totalbill
    const wallet = userData.wallet
    userData.wallet = 0
    await userData.save();
    const userfind = await user.updateOne(
      { _id: userdata },
      { $pull: { cart: {} } }
    );
    const Total = await user.updateOne({_id:userdata},{$set:{totalbill:0}})
    const latestOrder = await order
      .findOne({})
      .sort({date:-1})
      .populate("products.productId")
      .lean();
    const productDt =await latestOrder.products
    res.render("orderConformation", { userdata, latestOrder,productDt:productDt,userData:userData.name,billAmount,wallet,totaaal });
  } catch (error) {
    console.log(error.message);
  }
};
const applyCoupon = async (req, res) => {
  try {
    let code = req.params.id;
    req.session.coupon=code
    if (req.session.user_id) {
      let userdata = req.session.user_id;
      const userId = await user.findOne({ _id: userdata }, {});
      let coupons = await coupon.findOne({
        couponId: code,
        status: true,
      }).lean();
      if (coupons != null) {
        let today = new Date();
        if (coupons.expDate > today) {
          let userfind = await coupon.findOne(
            { couponId: code, user: userId._id },
            {}
          ).lean();
          let userID = userId._id;
          if (userfind == null) {
            let discount = coupons.discount;
            const total = userId.totalbill
            let discountPrice = Math.min(
              coupons.maxLimit,
              (userId.totalbill * discount) / 100
            );
            const userrr = await user.findOne({ _id: userdata });
            userrr.totalbill =userrr.totalbill-couponDis
            await userrr.save();
            const tot = userrr.totalbill
            await coupon.findOneAndUpdate(
              { couponId: code },
              { $push: { user: userId._id } }
            );
            res.json({ status: true, discountPrice, });       
          } else {
            res.json({ used: true });
          }
        } else {
          res.json({ expired: true });
        }
      } else {
        res.json({ noMatch: true });
      }
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.log(error.message);
  }
}
const profile = async(req,res)=>{
  const userId = req.session.user_id
  const userDt = await user.findOne({_id:userId})
  const userData = userDt.name
  try {
    res.render('profile',{userDt,userData})
  } catch (error) {
    console.log(error.message);
  }
}
const editProfile = async (req, res) => {
  try {
    const userdata = req.session.user_id;
    const userdt = await user.findOne({ _id: userdata }).lean();
    const userData = userdt.name
    res.render("editProfile", { userdata, userdt ,userData });
  } catch (error) {
    console.log(error.message);
  }
};
const updateProfile = async (req, res) => {
  try {
    userdata = req.session.user_id;
    id = req.body.id;
    await user.updateOne(
      { _id: req.params._id },
      {
        $set: {
          name: req.body.name,
          email: req.body.email,
        },
      }
    );
    res.redirect("/profile");
  } catch (error) {
    console.log(error.message);
  }
};
const addressList = async (req, res) => {
  try {
    const userdata = req.session.user_id;
    let userdt = await user.findOne({ _id: userdata }).lean();
    const userData = userdt.name
    const addressFind = await user.find({ _id: userdata },{address:1,_id:0}).lean();
    const Address = addressFind[0].address;
    res.render("addressList", { userdata, userdt, userData, Address });
  } catch (error) {
    console.log(error.message);
  }
};
const editAddress = async (req, res) => {
  try {
    const userdata = req.session.user_id;
    const id = req.params._id;
    let user1 = await user.findOne({ _id: userdata }).lean();
    const userData = user1.name
    let userdt = await user.findOne(
      { _id: userdata, "address._id": id },
      { "address.$": 1 }
    ).lean();
    res.render("editAddress", { userdata,userData, userdt, user1 });
  } catch (error) {
    console.log(error.message);
  }
};
const updateAddress = async (req, res) => {
  try {  
    const userdata = req.session.user_id;
    const id = req.params._id;
    await user.updateOne(
      { _id: userdata, "address._id": id },
      {
        $set: {
          "address.$": req.body,
        },
      }
    );
    res.redirect("/addressList");
  } catch (error) {
    console.log(error.message);
  }
};
const deleteAddress = async (req, res) => {
  try {
    const userdata = req.session.user_id;
    const id = req.params._id;
    await user.updateOne(
      { _id: userdata, "address._id": id },
      { $pull: { address: { _id: id } } }
    );
    res.json({success:true});
  } catch (error) {
    console.log(error.message);
  }
};
const myOrders = async (req, res) => {
  try {
    const userdata = req.session.user_id;
    let id = await user.findOne({ _id: userdata });
    const userData = id.name
    let orders = await order
      .findOne({ userId: id })
      .populate("products.productId")
      .lean();
    let orderData = await order
      .find({ userId: id })
      .populate("products.productId")
      .lean();
    if (!Array.isArray(orderData)) {
      orderData = [orderData];
    }
    const status = orderData.status
    const productData = orderData[0].products[0]
    res.render("myOrders", { userData,orderData,orders,status,productData });
  } catch (error) { }
};
const orderDetails = async (req, res) => {
  try {
    const userdata = req.session.user_id;
    const id = req.params._id;
    const userFind = await user.findOne({ _id: userdata });
    const userData = userFind.name;
    const orderData = await order
      .findOne({ _id: id }, {})
      .populate("products.productId")
      .lean();
    const orderdt = orderData.products;
    const status = orderData.status;
    const limitDate = new Date(orderData.date);
    limitDate.setDate(limitDate.getDate() + 2);
    const currentDate = new Date(); // Current date and time
    const returnDateLimit = new Date(limitDate); // Make a copy of the limitDate
    returnDateLimit.setDate(returnDateLimit.getDate() + 14); // Add 14 days to the limitDate
    const isReturnEligible = currentDate < returnDateLimit;
    res.render("orderDetails", {
      orderdt,
      orderData,
      userData,
      status,
      id,
      limitDate,
      currentDate,
      isReturnEligible,
    });
  } catch (error) {
    console.log(error.message);
  }
};
const returnOrder = async (req, res) => {
  try {
    const userdata = req.session.user_id;
    const id = req.params._id;
    const orderdt = await order.findOne({ _id: id });
    if (orderdt.status == "Delivered" ) {
      const orderdt = await order.findOne({ _id: id });
      await order.updateOne({ _id: id }, { $set: { status: "Returned" } });
      const orderId = orderdt.orderId
      const User = await user.findOne({ _id: userdata }); 
      const a = orderdt.total
      const b = User.wallet
      const walletBalance = a + b;
      await user.updateOne(
        { _id: userdata },
        { $set: { wallet: walletBalance } }
      );
      const walletDt = {
        status:"credited",
        amount:a,
        date:Date.now(),
        userId:userdata,
      }
      const Data = new walletData(walletDt)
      Data.save();
    } else {
      res.json({success:true});;
    }
    res.redirect("/myOrders");
  } catch (error) {
    console.log(error.message);
  }
};
const cancelOrder = async (req, res) => {
  try {
    const userdata = req.session.user_id;
    const _id = req.params._id;
    const orderdt = await order.findOne({ _id: _id });
    const a = orderdt.total 
    const orderId = orderdt.orderId
    if (orderdt.status == "Placed") {
      await order.updateOne({ _id: _id }, { $set: { status: "cancelled" } });
    if (
        orderdt.paymentType == "online payment"
      ) {
        const User = await user.findOne({ _id: userdata });
        const walletBalance = User.wallet + orderdt.total;
        await user.updateOne(
          { _id: userdata },
          { $set: { wallet: walletBalance } }
        );
        const walletDt = {
          status:"credited",
          amount:a,
          date:Date.now(),
          userId:userdata,
        }
        const Data = new walletData(walletDt)
        Data.save();
      }
    } else {
      res.json({success:true});
    }
    res.redirect('/myOrders');
  } catch (error) {
    console.log(error.message);
  }
};
const cancelCoupon =async(req,res)=>{
  try {
    const discount = req.body.discount
    let Dis = parseInt(discount);
    const userdata=req.session.user_id
    const User= await user.findOne({_id:userdata})
    const Discount = User.totalbill + Dis;    
    const tot = await user.findOne({_id:userdata})
    tot.totalbill = tot.totalbill-couponDis
    await tot.save();
    const code= req.params._id
    const updatedCoupon = await coupon.findOneAndUpdate(
      { couponId: code },
      { $pull: { user: userdata } },
      { new: true }
    );
    res.json({success:true})
  } catch (error) {
    console.log(error.message);
  }
}
let walletCheck;
const walletAmount = async(req,res)=>{
  try {
    walletCheck = true;
    const id = req.session.user_id
    const userData =await user.findOne({_id:id})
    const wallet = userData.wallet
    walletDis = wallet
    userData.totalbill=userData.totalbill-wallet
    await userData.save();
    tot = userData.totalbill
    res.json({status:true,wallet})
  } catch (error) {
    console.log(error.message);

  }
}
const walletHistory = async(req,res)=>{
  try {
    const id = req.session.user_id
    const userFind = await user.findOne({_id:id})
    const userData = userFind.name
    const wallet = await walletData.find({userId: id})
    res.render('walletHistory',{wallet,userData})
  } catch (error) {
    console.log(error.message);
  }
}
module.exports = {
  home,
  login,
  logout,
  register,
  terms,
  addUser,
  otpCompare,
  resendOTP,
  verifyLogin,
  contact,
  wishlist,
  cart,
  products,
  singleProduct,
  forgotPassword,
  forgotPasswordOTP,
  forgotPasswordOTPcompare,
  newPassword,
  updateNewpassword,
  addtoWishlist,
  removefromWishlist,
  resendForgotOTP,
  addtoCart,
  filterProduct,
  removefromCart,
  addtoCartfromWishlist,
  changeQty,
  checkoutPage,
  newAddress,
  placeOrder,
  orderConfirmed,
  verifyPayment,
  applyCoupon,
  profile,
  editProfile,
  updateProfile,
  addressList,
  editAddress,
  updateAddress,
  deleteAddress,
  myOrders,
  orderDetails,
  returnOrder,
  cancelOrder,
  cancelCoupon,
  walletAmount,
  walletHistory

  
};





