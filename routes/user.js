const express = require ("express"); 
const router = express.Router();
const User = require("../models/user");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware");

const UserController = require("../controllers/users");

router.get("/signup", UserController.renderSignUpForm)

router.post("/signup", wrapAsync(UserController.Signup))

router.get("/login", UserController.renderLoginForm) 

router.post("/login", saveRedirectUrl,
    passport.authenticate("local",{
        failureRedirect:"/login",
        failureFlash:true,
    }),
    UserController.Login)

router.get("/logout", UserController.logOut)


module.exports = router;