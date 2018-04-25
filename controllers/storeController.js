const mongoose=require('mongoose');
const Store=mongoose.model('Store');
const User=mongoose.model('User'); //importing the mdoel from store.js
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
  req.body.author= req.user._id;

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
//Check if store has been created by user or not
const confirmOwner= (store,user)=>{
  if(!(store.author.equals(user._id))){
    throw Error('You must own a store in order to edit it');
  };
}


exports.editStore=async (req,res)=>{
  const store=await Store.findOne({_id:req.params.id});
  confirmOwner(store,req.user);
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
  const store = await Store.findOne({slug:req.params.slug}).populate('author reviews');
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


exports.searchStores= async (req,res)=>{
  //res.json(req.query);

  const store= await Store
//first find stores that match the query then sort them according to the textScore in meta
  .find({
    $text:{
      $search: req.query.q
    }
  }, {
    score: {$meta: 'textScore'}
  }
)
  .sort({
    score: {$meta: 'textScore'}
  })
  .limit(5);

  res.json(store);



}



exports.mapStores= async (req,res)=>{
  const coordinates= [req.query.lng, req.query.lat].map(parseFloat);
  
  const q={
    location:{
      $near: {
        $geometry:{
          type: 'Point',
          coordinates: coordinates
        },
        $maxDistance: 10000
      }
    }
  };


  const stores= await Store.find(q).select('slug name location description').limit(10);
  res.json(stores);
}

exports.mapPage= (req,res)=>{
  res.render('map', {title:'Map'});
}


exports.heartStore= async (req,res)=>{
  const hearts= req.user.hearts.map(obj =>obj.toString());
  const operator= hearts.includes(req.params.id) ? '$pull' : '$addToSet' ;
  const user= await User
    .findByIdAndUpdate(req.user._id,
      {[operator]: {hearts: req.params.id}}, 
      {new: true}
    );
  res.json(user);
}


exports.getHearts =async (req,res)=>{
  const stores = await Store.find({
    _id: {$in: req.user.hearts}
  });
  res.render('stores', {title:'Hearted Stores', stores: stores});
}


exports.getTopStores= async (req,res)=>{
  const stores = await Store.getTopStores();
  //res.json(stores);
  res.render('topStores', {stores:stores, title:'Top Stores!'});
}