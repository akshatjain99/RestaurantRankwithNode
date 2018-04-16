const express = require('express');
const router = express.Router();
const storeController=require('../controllers/storeController');
const {catchErrors}=require('../handlers/errorHandlers'); //destructuring using ES6

router.get('/', storeController.homePage);
router.get('/add', storeController.addStore);
router.post('/add', catchErrors(storeController.createStore)); //to route after the form has been submitted

module.exports = router;
