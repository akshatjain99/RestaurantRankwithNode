const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  //const aj={name:'akshat', age:19, cool:true};
  //res.send(req.query.name);
  res.render('hello',{
    name:req.query.name,
    dog:'Cooper',
    title:'I love food'
  });
});

router.get('/reverse/:name', (req,res)=>{
	const reverse=[...req.params.name].reverse().join('');
	res.send(reverse);
});

module.exports = router;
