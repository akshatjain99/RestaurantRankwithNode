const mongoose=require('mongoose');
const Store=mongoose.model('Store'); //importing the mdoel from store.js


exports.homePage=(req,res)=>{
  res.render('index');
};


exports.addStore=(req,res)=>{
  res.render('editStore',{ title:'Add Store'});
};

exports.createStore=async (req,res)=>{
  //res.json(req.body); //req.body contains all the form information from the body
  const store=new Store(req.body);
  await store.save(); //mongoose returns a promise so we need to await that promise to come back
  req.flash('success', `Successfully created ${store.name}. Care to leave a review?`);
  res.redirect('/');

};

exports.getStores=async (req,res)=>{
  const stores=await Store.find(); //Query all the stores
  res.render('stores',{title:'Stores', stores:stores});
};

exports.editStore=async (req,res)=>{
  const store=await Store.findOne({_id:req.params.id});
  res.render('editStore', {title:`Edit ${store.name}`, store:store});
}

exports.updateStore=async (req,res)=>{
  const store=await Store.findOneAndUpdate({_id:req.params.id}, req.body, {
    new:true, //return the new store instead of the old one
    runValidators:true
  }).exec();
  req.flash('success', `Successfully updated ${store.name}! <a href="/store/${store.name}"> View Store</a>`);
  res.redirect(`/stores/${store.id}/edit`);
}