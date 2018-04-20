const passport= require('passport');

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