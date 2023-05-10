const categorySchema = require('../models/category_schema');
const { category } = require('./user_control');


//add category
const addcategory = async(req,res)=>{

    try {
        res.render('addcategory')
    } catch (error) {
        console.log(error.message);
    }
}

//categories
const categories = async(req,res)=>{
    try {

        const category = await categorySchema.find()

        res.render('categories',{category})

    } catch (error) {
        console.log(error.message);
    }
}





// UNIQUE CATEGORY FINDING
const category_submit = async (req, res) => {
    try {
      const categories = await categorySchema.find({});
      const name = req.body.name;
      // Create an object to store the counts of each category
      const categoryCounts = {};
  
      // Loop through the categories and count each one
      for (const category of categories) {
        const match = category.name.match(new RegExp(`^.*${name}.*$`, "i"));
        if (match) {
          const key = match[0];
          if (categoryCounts[key]) {
            categoryCounts[key]++;
          } else {
            categoryCounts[key] = 1;
          }
        }
      }
  
      console.log("Category counts:", categoryCounts);
  
      // Loop through the category counts object and log any categories with counts greater than 1
      for (const category in categoryCounts) {
        const match = category.match(new RegExp(`^.*${name}.*$`, "i"));
        if (match && categoryCounts[category] == 1) {
          return res.render("addcategory", {
            message: "This category has already been added",
          });
        }
      }
  
      // Create a new category if no duplicates were found
      const newCategory = await new categorySchema({
        name: name,
      });
      const categoryData = await newCategory.save();
      if (categoryData) {
        res.redirect("/admin/categories");
      }
    } catch (error) {
      console.log(error.message);
    }
  };
  
  
  



// block category
const blockcategory = async(req,res)=>{
    try {
        const id = req.query.id
        const category = await categorySchema.updateOne({_id : id},{$set:{status:false}}) 
        res.redirect('/admin/categories')
        
    } catch (error) {
        console.log(error.message);
    }
}


//unblock category
const unblockcategory = async(req,res)=>{
    try {
        const id = req.query.id
        const category = await categorySchema.updateOne({_id : id},{$set:{status:true}}) 
        res.redirect('/admin/categories')
        
    } catch (error) {
        console.log(error.message);
    }
}


//edit category
const editcategory = async(req,res)=>{
    try {
        const id = req.params._id
        const category = await categorySchema.findOne({_id : id}) 
       res.render('editcategory',{category})
        
        
    } catch (error) {
        console.log(error.message); 

    }
}


//update category
const updatecategory = async(req,res)=>{
    try {

        const id = req.params._id

        const name = req.body.name.toLowerCase();


        const category = await categorySchema.updateOne({_id : id},{$set:{
            name:name,
           
        }}) 
        res.redirect('/admin/categories')

    } catch (error) {
        console.log(error.message);
    }
}


module.exports = {
    addcategory,
    categories,
    category_submit,
    blockcategory,
    unblockcategory,
    editcategory,
    updatecategory
}