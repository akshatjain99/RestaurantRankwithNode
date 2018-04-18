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

storeSchema.pre('save', function(next){
  if(!this.isModified('name')){ //Only run the function when the name of the store has been modified and not after every save
    next();
    return;
  };

  this.slug=slug(this.name);
  next();
});

module.exports=mongoose.model('Store',storeSchema); //creating and exporting the model to be used in controller
