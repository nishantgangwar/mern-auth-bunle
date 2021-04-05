const express = require('express');
const router = express.Router()

// import controllers
const { signup ,accountActivation,signin} = require('../controllers/auth');
const { userSignupValidator, userSigninValidator } = require('../validators/auth');
const { runValidation } = require('../validators');


// define routers
router.post('/signup' ,userSignupValidator,runValidation,signup)
router.post('/account-activation',accountActivation)

router.post('/signin', userSigninValidator, runValidation, signin)
//exports router 
module.exports = router