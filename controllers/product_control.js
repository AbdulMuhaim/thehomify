const productSchema = require('../models/product_schema')
const categorySchema = require('../models/category_schema')
const cloudinary = require('cloudinary').v2;
const fs = require('fs');


cloudinary.config({ 
    cloud_name: 'df625ktpb', 
    api_key: "741853551832144", 
    api_secret: "Rh3YBV9SsPBuAek_C-IhOpVd7kY",
    secure: true
});






//products list
const products = async(req,res)=>{
    const categories = categorySchema.find({}) 
    try {
        const product = await productSchema.find().populate('categoryid')

        res.render('products',{product,categories})

    } catch (error) {
        console.log(error.message);
    }
}


//add new product get
const addproducts = async(req,res)=>{
    try {

const categories = await categorySchema.find({})



        res.render('addproducts',{categories})
    } catch (error) {
        console.log(error.message);
    }
}


//add new product post
const productadded = async(req,res) => {
   
    const product = {
        name: req.body.name,
        description: req.body.description,
        categoryid: req.body.category,
        brand: req.body.brand,
        image: req.body.image, 
        price:req.body.price,
        quantity:req.body.quantity,
        stock:req.body.stock

    }
   const category = await categorySchema.findOne({name:product.categoryid})
   product.categoryid = category._id
    const image = [];
    
    try{
        for(file of req.files){
            const result = await cloudinary.uploader.upload(file.path);
            image.push(result.secure_url);
        }
        
        product.image = image
        const products = new productSchema(product)
        products.save()
    }catch(error){
        console.log(error);
    }

    res.redirect('/admin/products')
}


//block product
const blockproduct = async(req,res)=>{
    try {
    const id = req.params._id
    const product = await productSchema.updateOne({_id : id},{$set:{status:false}}) 
    res.redirect('/admin/products')
    
    } catch (error) {
       console.log(error.message); 
    }
}


//unblock product
const unblockproduct = async(req,res)=>{
    try {
        const id = req.params._id
        const product = await productSchema.updateOne({_id : id},{$set:{status:true}}) 
        res.redirect('/admin/products')
        
        } catch (error) {
           console.log(error.message); 
        }
}


//edit product
const editproduct = async(req,res)=>{
    try {
       
        const id = req.params._id
        const categories = await categorySchema.find()
        const product = await productSchema.findOne({_id : id}).populate('categoryid') 
       res.render('editproducts',{product,categories})
        
        
    } catch (error) {
        console.log(error.message); 

    }
}


//update product
const updateproduct = async(req,res)=>{
    try {

        const id = req.params._id
        const name = req.body.name
        const description = req.body.description
        const category = req.body.category
        const brand = req.body.brand
        const price = req.body.price
        const quantity = req.body.quantity
        const stock = req.body.stock
        const image = [];

        for(file of req.files){
            const result = await cloudinary.uploader.upload(file.path);
            image.push(result.secure_url)
        }

        let productUpdates = {
            name: name,
            description: description,
            category: category,
            brand: brand,
            price: price,
            quantity: quantity,
            stock: stock,
        };

        let imageUpdates = {};
        if (image.length > 0) {
            imageUpdates = {
                $push: { image: { $each: image } }
            }
        }

        await productSchema.updateOne({ _id: id }, { $set: productUpdates });
        if (Object.keys(imageUpdates).length > 0) {
            await productSchema.updateOne({ _id: id }, imageUpdates);
        }

        res.redirect('/admin/products')

    } catch (error) {
        console.log(error.message);
    }
}




// delete Image
const deleteImage = async(req,res)=>{

const imageId = req.query.imageId
const productId = req.query.productId


await productSchema.updateOne({_id: productId},{$pull:{image:imageId}});

const categories = await categorySchema.find()
const product = await productSchema.findOne({_id : productId}).populate('categoryid') 
   

const filePath = `C:/Users/User/Desktop/MiniProject/public/adminassets/images/${imageId}`


// unlink the file
fs.unlink(filePath, (err) => {
  if (err) {
    console.error(err);
    return;
  }
  res.render('editproducts',{product,categories})

  console.log(`File ${filePath} has been unlinked.`);

});

};





  







   
module.exports = {
    products,
    addproducts,
    productadded,
    blockproduct,
    unblockproduct,
    editproduct,
    updateproduct,
    deleteImage

}