const express = require ("express"); 
const router = express.Router();
const User = require("../models/user");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware");

const UserController = require("../controllers/users");

router
    .route("/signup")
    .get(UserController.renderSignUpForm)
    .post(wrapAsync(UserController.Signup))

router
    .route("/login")
    .get(UserController.renderLoginForm)
    .post(saveRedirectUrl,
        passport.authenticate("local",{
            failureRedirect:"/login",
            failureFlash:true,
        }),
        UserController.Login)

router.get("/logout", UserController.logOut)


module.exports = router;