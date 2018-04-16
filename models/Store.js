const mongoose=require('mongoose');
mongoose.Promise=global.Promise;
const slugs=require('slugs');

const storeSchema=new mongoose.Schema({
  name:{
    type: String,
    trim: true,
    required:'Pkease enter a store name'
  },
  slug: String,
  description:{
    type: String,
    required: true
  },
  tags:[String]
});

storeSchema.pre('save', function(next){
  if(!this.isModified('name')){ //Only run the function when the name of the store has been modified and not after every save
    next();
    return;
  };

  this.slug=slug(this.name);
  next();
});

module.exports=mongoose.model('Store',storeSchema);
