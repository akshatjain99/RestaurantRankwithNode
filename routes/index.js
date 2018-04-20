const express = require('express');
const router = express.Router();
const storeController=require('../controllers/storeController');
const userController=require('../controllers/userController');
const authController=require('../controllers/authController');
const {catchErrors}=require('../handlers/errorHandlers'); //destructuring using ES6


//StoreControllers
router.get('/', catchErrors(storeController.getStores));
router.get('/stores', catchErrors(storeController.getStores));
router.get('/add', storeController.addStore);

router.post('/add', 
  storeController.upload,
  catchErrors(storeController.resize),
  catchErrors(storeController.createStore)
);//to route after the form has been submitted

router.post('/add/:id', 
  storeController.upload,
  catchErrors(storeController.resize),
  catchErrors(storeController.updateStore)); 


router.get('/stores/:id/edit', catchErrors(storeController.editStore)); //id as a variable will be available to us

router.get('/store/:slug', catchErrors(storeController.getStoreBySlug)); //to create single store information page

router.get('/tags', catchErrors(storeController.getStoresByTag)); //Routing to tags page
router.get('/tags/:tag', catchErrors(storeController.getStoresByTag));

//UserControllers

router.get('/login', userController.loginForm);
router.get('/register', userController.registerForm);

//First validate the from server side
//then register them ie save them to the database
//Log them in

router.post('/register', 
  userController.validateRegister, 
  userController.register,
  authController.login
  );

module.exports = router;
