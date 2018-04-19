const mongoose=require('mongoose');
const Store=mongoose.model('Store'); //importing the mdoel from store.js
const multer=require('multer'); //Multer is a middleware for uploading files
const jimp=require('jimp'); //Resize photos with jimp
const uuid=require('uuid');

const multerOptions={
  storage:multer.memoryStorage(),
  fileFilter:function(req,file,next){
    const isPhoto=file.mimetype.startsWith('image/'); //checking to see if file is a photo
    if(isPhoto){
      next(null,true); //if 2 parameters are passed to null, then the secon is passed. If only one is passed then its an error
    }else{
      next({message:'That file type is not allowed'}, false);
    }
  }
};




exports.homePage=(req,res)=>{
  res.render('index');
};


exports.addStore=(req,res)=>{
  res.render('editStore',{ title:'Add Store'});
};

exports.upload=multer(multerOptions).single('photo');

exports.resize=async (req,res,next)=>{
  //check if there is file to upload
  if (!req.file){
    next(); //if no new file to upload then next
    return;
  }
  const extension=req.file.mimetype.split('/')[1];
  req.body.photo=`${uuid.v4()}.${extension}`;
  const photo=await jimp.read(req.file.buffer);
  await photo.resize(800,jimp.AUTO);
  await photo.write(`./public/uploads/${req.body.photo}`);
  //once we have written the photo, keep going
  next();
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
  //to set the location type as point to display on map
  req.body.location.type="Point";

  const store=await Store.findOneAndUpdate({_id:req.params.id}, req.body, {
    new:true, //return the new store instead of the old one
    runValidators:true
  }).exec();
  req.flash('success', `Successfully updated ${store.name}! <a href="/store/${store.name}"> View Store</a>`);
  res.redirect(`/stores/${store.id}/edit`);
}


exports.getStoreBySlug=async (req,res,next)=>{
  const store = await Store.findOne({slug:req.params.slug});
  if (!store){
    next();
    return;
  }
  res.render('store', {title:store.name, store:store});

}

exports.getStoresByTag=async (req,res)=>{
  const tag= req.params.tag;
  const tagQuery= tag || {$exists:true};

  const tagsPromise=Store.getTagsList(); //getTagsList is a custom static method defined in storeSchema
  const storesPromise= Store.find({tags:tagQuery});

  const [tags ,stores]= await Promise.all([tagsPromise, storesPromise]); //Fire off both promises simultaneously 
  //and also destructuring using ES6
  res.render('tag', {title:'Tags', tags:tags, tag:tag, stores:stores});
}