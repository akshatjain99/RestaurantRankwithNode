const express = require('express');
const router = express.Router();
const storeController=require('../controllers/storeController');
const {catchErrors}=require('../handlers/errorHandlers'); //destructuring using ES6

router.get('/', catchErrors(storeController.getStores));
router.get('/stores', catchErrors(storeController.getStores));
router.get('/add', storeController.addStore);
router.post('/add', catchErrors(storeController.createStore));//to route after the form has been submitted
router.post('/add/:id', catchErrors(storeController.updateStore)); 
router.get('/stores/:id/edit', catchErrors(storeController.editStore)) //id as a variable will be available to us

module.exports = router;
