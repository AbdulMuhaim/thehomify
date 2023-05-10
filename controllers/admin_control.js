const admin = require('../models/admin_schema');
const user = require('../models/user_schema');
const coupon = require("../models/coupon_schema");``
const order = require('../models/order_schema');
const banner = require('../models/banner_schema');
const exceljs = require('exceljs')
const product = require('../models/product_schema')
const category = require('../models/category_schema')

//admin login
const loadlogin = async(req,res)=>{
    try {
        res.render('adminlogin')
    } catch (error) {
        console.log(error.message);
    }
}


//verify admin login
const verifylogin = async(req,res)=>{
    try {

        const email = req.body.email;
        const password = req.body.password;
        const adminData = await admin.findOne({email:email});
      
        if(adminData){
            
            if(adminData.email == email && adminData.password == password){
                req.session.admin_id = adminData._id;
                res.redirect('/admin/dashboard')
            }else{
                res.render('adminlogin',{message:"Email or password is incorrect"});
            }
        }else{
            res.render('adminlogin',{message:"Email or password is incorrect"});
        }
        

    } catch (error) {
        error.message
    }
}



const dashboard = async (req, res) => {
  try {
    const totalOrders = await order.countDocuments({});

    const totalSales = await order.aggregate([
      {
        $group: {
          _id: 0,
          total: { $sum: "$total" }, // Sum the total field of all documents
        },
      },
    ]);

    const totalUsers = await user.countDocuments({});


   const latest= await 
   order.aggregate([
     {
       $unwind: "$products" // deconstruct the products array
     },
     {
       $group: {
         _id: "$products.productId",
         totalQuantity: { $sum: { $toInt: "$products.quantity" } } // sum the quantity of each product
       }
     },
     {
       $lookup: {
         from: "products", // name of the products collection
         localField: "_id",
         foreignField: "_id",
         as: "product"
       }
     },
     {
       $sort: { totalQuantity: -1 } // sort by the total quantity in descending order
     },
     {
       $limit: 5 // only return the top result
     },
     {
       $project: {
         _id: 0,
         productName: "$product.productName",
         totalQuantity: 1
       }
     }
   ])






const totalQuantities = latest.map(item => item.totalQuantity);
const productNames = latest.map(item => item.productName[0]);



 const result=await order.aggregate([
  { $group: { _id: "$paymentType", count: { $sum: 1 } } },
])
    const paymentTypes = result.map((r) => r._id);
    const count = result.map((r) => r.count);
   
    const total = count.reduce((acc, curr) => acc + curr, 0);



    const pTotal = await order.aggregate([
      {
        $group: {
          _id: "$paymentType",
          total: { $sum: "$total" },
        },
      },
    ]);


const onlinePayment= await order.aggregate([
  { $match: { paymentType: "onlinePayment" } },
  { $group: { _id:0, total: { $sum: "$total" } } }
])



const totalProducts = await product.countDocuments({});

const totalCategories = await category.countDocuments({});


const startOfToday = new Date().setHours(0,0,0,0); // get the start of today
const lastSevenDays = new Date(startOfToday - (7 * 24 * 60 * 60 * 1000)); // get the start of 7 days ago

const ordersPerDay = await order.aggregate([
  {
    $match: {
      date: { $gte: lastSevenDays }
    }
  },
  {
    $group: {
      _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
      count: { $sum: 1 }
    }
  },
  {
    $sort: {
      _id: 1
    }
  }
]);

const orderCounts = ordersPerDay.map(order => order.count);



 
 const ord=await order.find().populate({
  path: 'products.productId',
  populate: {
      path: 'categoryid',
      model: category
  }
})
const categoryCount = {};

ord.forEach(order => {
    order.products.forEach(product => {
        const category = product.productId.categoryid.name;
        if (category in categoryCount) {
            categoryCount[category] += 1;
        } else {
            categoryCount[category] = 1;
        }
    });
});
// const sortedCategoryCount = Object.entries(categoryCount).sort((a, b) => b[1] - a[1]);


const categoryCounts = Object.entries(categoryCount).map(([name, count]) => count);
const categoryNames = Object.entries(categoryCount).map(([name, count]) => name);








    res.render("dash", {
      
      totalOrders,
      totalSales,
      totalUsers,
      totalQuantities,
      
      productNames,
      count,total,pTotal,
      totalProducts,
      totalCategories,
      orderCounts,
      categoryCounts,
      categoryNames,paymentTypes
    
    });
  } catch (error) {
    console.log(error.message);
  }
};







//users list
const userlist = async(req,res)=>{
    try {
        const userdata = await user.find({})
        res.render('userlist',{userdata})
        
        
    } catch (error) {
        console.log(error.message);
    }
}


//Admin logout
const logout = async(req,res)=>{
    try {
        
        req.session.admin_id = null;
        res.redirect('/admin')

    } catch (error) {
        console.log(error.message);
    }
}


//block user
const blockuser = async(req,res)=>{
    
    try {
        const id = req.params._id
        req.session.user_id = null;
        const userData = await user.updateOne({_id : id},{$set:{status:false}}) 
        res.redirect('/admin/userlist')
        
        } catch (error) {
           console.log(error.message); 
        }

}


//Unblock user
const unblockuser = async(req,res)=>{
    try {
        const id = req.params._id
        const productData = await user.updateOne({_id : id},{$set:{status:true}}) 
        res.redirect('/admin/userlist')
        
        } catch (error) {
           console.log(error.message); 
        }
}



//add Coupon
const addCoupon = async(req,res)=>{
    try {
        res.render("addcoupon",{ couponStatus: 0});
    } catch (error) {
        console.log(error.message);
    }
}



//coupon Added
const couponAdded = async(req,res)=>{
    try {
        
        const couponData = req.body
        couponData.couponId = couponData.couponId.split("").join("").toUpperCase();

        let couponDb = await coupon.findOne({
           couponId:couponData.couponId
        });
        if(couponDb){
            res.render('addcoupon',{couponStatus:"coupon already exist"})
        }else{
            const coupons = new coupon(couponData)
            coupons.save();
            res.redirect('/admin/addCoupon')
        }
    } catch (error) {
        
    }
}


//coupon List
const couponList = async(req,res)=>{
    try {
        const coupons = await coupon.find({});
        res.render('couponList',{coupons})
    } catch (error) {
        console.log(error.message);
    }
};



//block Coupon
const blockCoupon = async(req,res)=>{
    try {
        const id = req.params._id;
        await coupon.updateOne({ _id: id }, { status: false });
        coupon.find({}).lean();
        res.redirect('/admin/couponList');
    } catch (error) {
        console.log(error.message);
    }
}


//unblock Coupon
const unblockCoupon = async (req, res) => {
    try {
       
      const id = req.params._id;
      await coupon.updateOne({ _id: id }, { status: true });
      coupon.find({}).lean();
      res.redirect("/admin/couponList");
    } catch (error) {
      console.log(error.message);
    }
  };



//edit Coupon
const editCoupon = async (req, res) => {
    try {
      const id = req.params._id;
      const data = await coupon.findById({ _id: id }).lean();
      if (data) {
        res.render("couponEdit", {data});
      }
    } catch (error) {
      console.log(error.message);
    }
  };



  //update Coupon
  const updateCoupon = async (req, res) => {
    try {
      const id = req.params._id;
      await coupon.updateOne(
        { _id: id },
        {
          $set: {
            couponId: req.body.couponId,
            discount: req.body.discount,
            maxLimit: req.body.maxLimit,
            minPurchase: req.body.minPurchase,
            expDate: req.body.expDate,
          },
        }
      );
  
      res.redirect("/admin/couponList");
    } catch (error) {
      console.log(error.message);
    }
  };
  



  const orderList = async (req, res) => {
    try {
      const orderfind = await order.find({})
        .populate("products.productId")
        .populate("userId")
        .lean();
        const userName = orderfind[0].userId.name
      console.log(orderfind[0].userId.name);
      res.render("orderList", { orderfind ,userName });
    } catch (error) {
      console.log(error.message);
    }
  };





  const orderStatus = async (req, res) => {
    try {
      const orderId = req.body.orderId;
      const status = req.body.status;
      const change = await order.updateOne(
        { _id: orderId },
        { $set: { status: status } }
      );
      if (change) {
        res.json({ success: true, status });
      }
    } catch (error) {
      console.log(error.messsage);
    }
  };



  const vieworderDetails = async (req, res) => {
    try {
      const orderdata = await order.findOne({ _id: req.params._id }, {})
        .populate("products.productId")
        .lean();
  const orderdt = orderdata.products
      res.render("vieworderDetails",{ orderdt,orderdata });
      
      console.log(orderdt);
    } catch (error) {
      console.log(error.message);
    }
  };



  const bannerList = async (req, res, next) => {
    banner.find({})
      .lean()
      .then((data) => {
        res.render("bannerList", { data });
      })
      .catch((error) => {
        res.status(400).json({ messageError: error });
        res.render("/admin");
      });
  };
  



  const addBanner=async(req,res)=>{
    try {
      res.render('addBanner')
    } catch (error) {
      console.log(error.message);
    }
  }



  const addBannerPost = async (req, res, next) => {
    const bannerDt = req.body;
    
  
    
    bannerDt.image = req.file.filename;
    console.log(bannerDt);
    const data = new banner(bannerDt);
      data.save();
      res.render("addBanner");
    
  };


  const blockBanner = async (req, res) => {
    try {
      const id = req.params._id;
      await banner.updateOne({ _id: id },{$set:{status: false}});
      banner.find({})
      .lean()
      .then((data) => {
        res.render("bannerList", { data });
      })
    } catch (error) {
      console.log(error.message);
    }
  };



  const unblockBanner = async (req, res) => {
    try {
      const id = req.params._id;
      await banner.updateOne({ _id: id },{$set:{status: true}});
      banner.find({})
      .lean()
      .then((data) => {
        res.render("bannerList", { data });
      })
    } catch (error) {
      console.log(error.message);
    }
  };


  const editBanner = async (req, res) => {
    try {
      const id = req.params._id;
      const data = await banner.findById({ _id: id }).lean();
      if (data) {
        res.render("editBanner", { data });
      }
    } catch (error) {
      console.log(error.message);
    }
  };
  
  


  const updateBanner = async (req, res) => {
    const Banner = req.body;
    console.log("hiii");
    console.log(Banner);

      try {
        if(req.file){
          await banner.updateOne({_id: req.body.id },
            {
              $set: {
                name: req.body.name,
                description: req.body.description,
                image: req.file.filename,
              },
            }
          );
        }else{
          await banner.updateOne(
          { _id: req.body._id },
          {
            $set: {
              name: req.body.name,
              description: req.body.description,
             
             
            },
          }
        );}
      
  res.redirect('/admin/bannerList')
  
      } catch (error) {
        console.log(error.message);
      
    }
  };
  
  
  
  


  const salesReport= async(req,res)=>{
    try {
      res.render('salesReport',{orders:0})
    } catch (error) {
      console.log(error.message);
    }
  }




  const generateReport=async(req,res)=>{
    try {
      const startDate=req.body.startDate;
      const endDate=req.body.endDate;
      console.log(startDate);
      console.log(endDate);


        const orders = await order.find({
          date: { $gte: startDate, $lte: endDate }
        }).sort({ date: 'desc' }).populate("userId").lean()
  
        const product = await order.find({
          date: { $gte: startDate, $lte: endDate }
        }).sort({ date: 'desc' }).populate("products.productId").lean()
  
      res.render('salesReport',{orders,startDate,endDate,})
    
  
  
     

    } catch (error) {
      console.log(error.message);
    }
  }






  const downloadExcel=async(req,res)=>{
    try {
      console.log("excellllllllllllllllllllllllllllllll");
      const startDate = req.query.startDate;
      const endDate = req.query.endDate;
     console.log(startDate);
     console.log(endDate);
     
     
     
     const orders = await order.aggregate([
      {
        $match: {
          date: {
            $gte: new Date(new Date(startDate).setHours(00,00,00)),
            $lte: new Date(new Date(endDate).setHours(00,00,00)),
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $addFields: {
          user: { $arrayElemAt: ["$user", 0] },
        },
      },
      {
        $project: {
          _id: 0,
          orderId: 1,
          total: 1,
          username: "$user.name",
          paymentType: 1,
          status: 1,
        },
      },
    ]);
  
     
    console.log(orders);
  
  
  
    const workbook = new exceljs.Workbook();
      
    // Add a new worksheet to the workbook
    const worksheet = workbook.addWorksheet('Sales Report');
  
    // Add headers to the worksheet
    worksheet.addRow(['Order ID', 'Total bill', 'Customer Name', 'Payment Type', 'Order Status']);
  
    // Add data to the worksheet
    for (const order of orders) {
      worksheet.addRow([order.orderId,order.total, order.username, order.paymentType, order.status]);
    }
  
  
   // Set the response headers and filename
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="sales-report.xlsx"`);
      
        // Write the workbook to the response stream
        await workbook.xlsx.write(res);
      
        // End the response stream
        res.end();
  
    } catch (error) {
      console.log(error.message);
    }
  }
  
  


module.exports = {
    loadlogin,
    verifylogin,
    dashboard,
    userlist,
    logout,
    blockuser,
    unblockuser,
    addCoupon,
    couponAdded,
    couponList,
    blockCoupon,
    unblockCoupon,
    editCoupon,
    updateCoupon,
    orderList,
    orderStatus,
    vieworderDetails,
    bannerList,
    addBanner,
    addBannerPost,
    blockBanner,
    unblockBanner,
    editBanner,
    updateBanner,
    salesReport,
    generateReport,
    downloadExcel
     
}