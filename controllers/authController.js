const passport= require('passport');
const crypto= require('crypto');
const mongoose= require('mongoose');
const User=mongoose.model('User');
const promisify= require('es6-promisify');
const mail= require('../handlers/mail.js');

exports.login= passport.authenticate('local', {
  failureRedirect: '/login', 
  failureFlash: 'Failed Login!', 
  successRedirect: '/', 
  successFlash:'You are logged in!'
});

exports.logout= (req,res)=>{
  req.logout();
  req.flash('success', 'You are now logged out!');
  res.redirect('/');
};

exports.isLoggedIn= (req,res,next)=>{
 
  //check if logged in
  if(req.isAuthenticated()){
    next();
    return;
  }
  else{
    req.flash('error', 'You must be logged in');
    res.redirect('/login');
    return;
  }
};

exports.forgot= async (req,res)=>{
  const user= await User.findOne({email:req.body.email});
  if(!user){
    req.flash('error', 'No account with the email exists');
    return res.redirect('/login');
  };

  user.resetPasswordToken= crypto.randomBytes(20).toString('hex');
  user.resetPasswordExpires= Date.now() + 3600000; //1 hour from now
  await user.save();

  const resetURL= `http://${req.headers.host}/account/reset/${user.resetPasswordToken}`;

  await mail.send({
    user:user,
    subject: 'Reset Password Link',
    filename: 'password-reset',
    resetURL:resetURL
  });


  req.flash('success', `You have been emailed a password reset link`);

  res.redirect('/login');
};

exports.reset= async (req,res)=>{
  const user=await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires:{$gt: Date.now()} //checking to see if token is not expired
  });

  if(!user){
    req.flash('error', 'Invalid reset URL');
    return res.redirect('/login');
  };

  res.render('reset', {title:'Reset your password'});

}

exports.confirmedPasswords=(req,res,next)=>{
  req.checkBody('password-confirm', 'Passwords do not match').equals(req.body.password);
  const errors= req.validationErrors();

  if(errors){
    req.flash('error', errors.map(err => err.msg));
    res.redirect('back');
    return; //stop
  };
  next(); //continue
};

exports.update= async (req,res)=>{
  const user=await User.findOne({
  resetPasswordToken: req.params.token,
  resetPasswordExpires:{$gt: Date.now()} //checking to see if token is not expired
  });

  if(!user){
    req.flash('error', 'Invalid reset URL');
    return res.redirect('back');
  };

  const setPassword = promisify(user.setPassword, user);
  await setPassword(req.body.password);

  user.resetPasswordToken=undefined;
  user.resetPasswordExpires=undefined;

  const updatedUser= await user.save();
  await req.login(updatedUser); //From passport.js, it automatically logs a user in
  req.flash('success', 'Password successfully reset');
  res.redirect('/');
};

