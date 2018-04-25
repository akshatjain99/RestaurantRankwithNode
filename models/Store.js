const mongoose=require('mongoose');
mongoose.Promise=global.Promise;
const slug=require('slugs');

const storeSchema=new mongoose.Schema({
  name:{
    type: String,
    trim: true,
    required:'Please enter a store name'
  },
  slug: String,
  description:{
    type: String,
    required: true
  },
  tags:[String],
  created:{
    type:Date,
    default:Date.now
  },
  photo: String,
  author:{
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: 'You must supply an author'
  },
  location:{
    type:{
      type:String,
      default:'Point'
    },
    coordinates:[{
      type:Number,
      required:'You must supply coordiantes'
    }],
    address:{
      type:String,
      required:'You must enter an address'
    }
  }
}, {
    toJSON: {virtuals: 'true'},
    toObject:{virtuals:'true'}
  }
);


//Define our indexes
storeSchema.index({
  name: 'text', //Index name as text
  description: 'text'
});


storeSchema.index({location:'2dsphere'});


storeSchema.pre('save', async function(next){
  if(!this.isModified('name')){ //Only run the function when the name of the store has been modified and not after every save
    next();
    return;
  };

  this.slug=slug(this.name);
  //Find other stores of same slug
  const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');
  const storesWithSlug = await this.constructor.find({ slug: slugRegEx });
  if(storesWithSlug.length) {
    this.slug = `${this.slug}-${storesWithSlug.length + 1}`;
  }
  next();
});

storeSchema.statics.getTagsList = function(){
  return this.aggregate([
    {$unwind:'$tags'},
    {$group: {_id:'$tags', count:{ $sum:1 }}}, 
    {$sort:{count:-1}}


  ]);
}

storeSchema.statics.getTopStores= function(){
  return this.aggregate([
    //Lookup stores and populate their reviews
    {$lookup:{ from: 'reviews', localField:'_id', foreignField: 'store', as:'reviews'}},

    //Filter for items that have two or more reviews
    {$match:{'reviews.1': {$exists:true}}},

    //Add the average reviews field
    {$project: {
      photo:'$$ROOT.photo',
      name: '$$ROOT.name',
      reviews:'$$ROOT.reviews',
      slug:'$$ROOT.slug',
      averageRating: {$avg: '$reviews.rating'}
    }},

    //Sort it by our new field, highest reviews first
    {$sort: {averageRating:-1}},

    //limit it at most 10
    {$limit: 10}
    ]);
};


//find reviews where the stores._id property === reviews.store property
storeSchema.virtual('reviews', {
  ref: 'Review', //name of the model
  localField:'_id', //which field on the store
  foreignField: 'store' //which field on the review

});


function autoPopulate(next){
  this.populate('reviews');
  next();
};

storeSchema.pre('find', autoPopulate);
storeSchema.pre('findOne', autoPopulate);

module.exports=mongoose.model('Store',storeSchema); //creating and exporting the model to be used in controller
