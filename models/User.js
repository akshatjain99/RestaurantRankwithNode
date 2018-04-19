const mongoose=require('mongoose');
mongoose.Promise=global.Promise;
const Schema= mongoose.Schema();
const md5= require('md5');
const validator=require('validator');
const mongodbErrorHandler=require('mongoose-mongodb-errors');
const passportLocalMongoose=require('passport-local-mongoose');

const userSchema=new mongoose.Schema({
  email:{
    type:String,
    unique:true,
    lowercase:true,
    trim:true,
    validate:[validator.isEmail, 'Inavlid Email Address'], 
    required:'Please enter an Email Address'
  },
  name:{
    type: String, 
    trim:true, 
    required: 'Please enter a name'
  }
});

userSchema.plugin(passportLocalMongoose,{usernameField: 'email'});
userSchema.plugin(mongodbErrorHandler);

module.exports=mongoose.model('User', userSchema); 