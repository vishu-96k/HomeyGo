const Listing = require("../models/listing");
const Review =  require("../models/review");
const User = require("../models/user.js");



module.exports.renderSignupFrom = (req, res)=>{
    res.render("./users/signup.ejs");
    // res.render("./listings/index.ejs", { allListings });
}


module.exports.signup= async(req, res)=>{
    try{
        let {username, email, password} = req.body;
        const newUser = new User({email, username});
        let registerdUser = await User.register(newUser,password);
        console.log(registerdUser);
        req.login(registerdUser, (err)=>{
            if(err){
                return nex();
            }
            req.flash("success", "Welcome to HomeyGo!");
            res.redirect("/listings");
        });
      
    }
    catch(e){
        req.flash("error", e.message);
        res.redirect("/signup");
    }
   
}

module.exports.renderLoginFrom = (req, res)=>{
    res.render("users/login.ejs");
}

module.exports.login = async(req, res)=>{
    req.flash("success","Welcome to homeyGo! you are logged in!")
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
}

module.exports.logout = (req, res)=>{
    req.logout((err)=>{
        if(err){
           return next(err);
        }
        req.flash("success", "You are logged out!");
        res.redirect("/listings");
    })
}