const mongoose=require('mongoose');
const Store=mongoose.model('Store'); //importing the mdoel from store.js


exports.homePage=(req,res)=>{
  res.render('index');
  console.log(req.name);
};


exports.addStore=(req,res)=>{
  res.render('editStore',{ title:'Add Store'});
};

exports.createStore=async (req,res)=>{
  //res.json(req.body); //req.body contains all the form information from the body
  const store=new Store(req.body);
  await store.save();
  res.redirect('/');

};