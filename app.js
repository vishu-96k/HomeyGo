if (process.env.NODE_ENV != "production"){
require('dotenv').config();
}
// console.log(process.env.SECRET);

const express = require("express");
const app = express();
const mongoose = require('mongoose');


const Listing = require("./models/listing.js");


// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

const dbUrl = process.env.ATLASDB_URL;

const path = require("path");
const methodOverride = require("method-override");
const wrapAsync = require("./utils/wrapAsync.js")
const ExpressError = require("./utils/ExpressError.js")
const ejsMate = require("ejs-mate");
const { listingSchema,reviewSchema } = require("./schema.js");
const Review = require("./models/review.js");
const listingsRouter =  require("./routes/listing.js");
const reviewRouter =  require("./routes/review.js");
const userRouter =  require("./routes/user.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');

const flash = require("connect-flash");
const passport =  require("passport"); // user for authentication and authorization automatically
const LocalStrategy =  require("passport-local");
const User = require("./models/user.js");
// const multer  = require('multer')
// const upload = multer({ dest: 'uploads/' })


// const Listing = require("../models/listing.js");


const { isLoggedIn, isOwner } = require("./middlewere.js");
const { authorize } = require("passport");
const multer  = require('multer')
const {storage} = require("./cloudConfig.js")
const upload = multer({ storage: storage })
const listingController =  require("./controllers/listing.js");




//connection to DB
main()
    .then(() => {
        console.log("connected to Db ");
    })
    .catch((err) => {
        console.log(err);
    })

async function main() {
    await mongoose.connect(dbUrl);
}


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended : true}));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join (__dirname, "/public")))



const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET,
      },
      touchAfter: 24*3600,
});

store.on("error",()=>{
    console.log("session store error",err);
});

const sessionOptions = {
    store,
    secret : process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie : {
        expires : Date.now() + 7 * 24 *60*60 *1000,   //one hafta ka time
        maxAge: 7 * 24 *60*60 *1000,
        httpOnly: true,
    }
}



app.use(session(sessionOptions));
app.use(flash());


//for hashing the password for storing it
//passport : after using passport, we will get the authentication and authorization methds 
//session means whenthe page is open in any of the tab of the browser
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


// middlewere
app.use((req, res, next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});



app.get('/',wrapAsync( listingController.index ));


//listing routes
app.use("/listings", listingsRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);


// page not found 
app.all("*", (req, res, next)=>{
    next(new ExpressError(404, "page not found!"));
})


app.use((err, req, res, next)=>{
    let {statusCode=500, message="something wnet wroung"} = err;
    res.render("./error.ejs" ,{ err });
    // res.status(statusCode).send(message);
})


app.listen(8080, () => {
    console.log("helo sever at 8080");
})

