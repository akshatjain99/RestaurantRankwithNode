const express = require('express');
const router = express.Router();
const storeController=require('../controllers/storeController');
const userController=require('../controllers/userController');
const authController=require('../controllers/authController');
const {catchErrors}=require('../handlers/errorHandlers'); //destructuring using ES6


//StoreControllers
router.get('/', catchErrors(storeController.getStores));
router.get('/stores', catchErrors(storeController.getStores));
router.get('/add', authController.isLoggedIn,storeController.addStore);

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
router.post('/login', authController.login);

router.get('/register', userController.registerForm);

//First validate the from server side
//then register them ie save them to the database
//Log them in

router.post('/register', 
  userController.validateRegister, 
  userController.register,
  authController.login
  );

//Logout
router.get('/logout', authController.logout);

//Account page

router.get('/account', authController.isLoggedIn,userController.account);
router.post('/account', catchErrors(userController.updateAccount));

router.post('/account/forgot', catchErrors(authController.forgot));
router.get('/account/reset/:token', catchErrors(authController.reset));
router.post('/account/reset/:token', 
  authController.confirmedPasswords,
  catchErrors(authController.update) 
);

router.get('/map', storeController.mapPage);


//API


router.get('/api/search', catchErrors(storeController.searchStores));
router.get('/api/stores/near', catchErrors(storeController.mapStores));

router.post('/api/stores/:id/heart',catchErrors(storeController.heartStore));



module.exports = router;
