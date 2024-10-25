const express = require("express");
const router = express.Router({mergeParams: true});
const wrapAsync = require("../utils/wrapAsync.js"); // Ensure this path is correct
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const { reviewSchema } = require("../schema.js");
const User = require("../models/user.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middlewere.js");
const userController =  require("../controllers/users.js");

//signup route
router.get("/signup", userController.renderSignupFrom);
router.post("/signup", wrapAsync(userController.signup));


//login route
router.get("/login", userController.renderLoginFrom);
router.post("/login", saveRedirectUrl, passport.authenticate("local", { failureRedirect: "/login", failureFlash: true }),
userController.login)


//logout route
router.get("/logout", userController.logout);
module.exports = router;