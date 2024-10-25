// // copy pasting the routes in this
const express = require("express");
const router = express.Router({mergeParams: true});
const wrapAsync = require("../utils/wrapAsync.js"); // Ensure this path is correct
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const reviewController =  require("../controllers/reviews.js");
const { reviewSchema } = require("../schema.js");
const { isLoggedIn, isReviewAuthor } = require("../middlewere.js");


//validate review server side
const validateReview =  (req, res, next) =>{
    let { error }= reviewSchema.validate(req.body);
    if(error) {
        let errMsg = error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400, errMsg);
    }

    else{
        next();
    }
};

//reviews
//review post route
router.post("/",isLoggedIn, validateReview , wrapAsync (reviewController.createReview));

//delete review route
router.delete("/:reviewId",isLoggedIn, isReviewAuthor, wrapAsync( reviewController.destroyReview ));

module.exports = router;



