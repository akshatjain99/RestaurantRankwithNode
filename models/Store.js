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
});

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

module.exports=mongoose.model('Store',storeSchema); //creating and exporting the model to be used in controller
