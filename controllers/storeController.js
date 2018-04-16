exports.homePage=(req,res)=>{
  res.render('index');
  console.log(req.name);
};