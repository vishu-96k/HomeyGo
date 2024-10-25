// copy pasting the routes in this
const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js"); // Ensure this path is correct
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner } = require("../middlewere.js");
const { authorize } = require("passport");
const multer  = require('multer')
const {storage} = require("../cloudConfig.js")
const upload = multer({ storage: storage })
const listingController =  require("../controllers/listing.js");




//new route
router.get("/new",isLoggedIn ,listingController.renderNewForm);

//edit route
router.get("/:id/edit", isLoggedIn,isOwner , wrapAsync(listingController.renderEditForm));


router
.route("/")
    .get( wrapAsync( listingController.index )) //index route
    .post(isLoggedIn ,upload.single("listing[image][url]"),wrapAsync( listingController.createListing))//Create route 
   



router.route("/:id")
.get( wrapAsync(listingController.showListing)) //show route
.put( isLoggedIn,isOwner ,upload.single("listing[image][url]"),wrapAsync (listingController.updateListing)) //update route
.delete(isLoggedIn, isOwner ,wrapAsync (listingController.destroyListing)) // delete route


module.exports = router;