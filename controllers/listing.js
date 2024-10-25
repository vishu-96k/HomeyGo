const { fileLoader } = require("ejs");
const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding')

const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken});


module.exports.index =  async (req, res) =>{
    const allListings =  await Listing.find({});
    res.render("listings/index.ejs" , { allListings});
}


module.exports.renderNewForm = async(req, res)=> { 
    res.render("./listings/new.ejs")
}

module.exports.showListing  =  async (req, res ,next)=> {
    let {id} = req.params;
    const listing = await Listing.findById(id)
    .populate({
            path: "reviews",
            populate: {
        path : "author",
    },
})
    .populate("owner");
    if(!listing){
        req.flash("error", "listing does not exits!");
        res.redirect("/listings");     
        
    }
    res.render("./listings/show.ejs", { listing });
}


module.exports.createListing = async (req, res ,next)=> {
    let response = await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1,
      })
    .send();
       
    
   let url = req.file.path;
   let filename = req.file.filename;
    console.log(url, " ... ", filename);
    if(!req.body.listing){
        throw new ExpressError(404, "send valid data for listing");
    }
    const newListing = new Listing(req.body.listing); 
    newListing.owner = req.user._id;
    newListing.image = {url, filename};

    newListing.geometry = response.body.features[0].geometry;

    let savedListing = await newListing.save();
    console.log(savedListing);
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");     
    // res.send(req.file);

}


module.exports.renderEditForm =  async (req, res ,next)=> {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error", "listing does not exits!");
        res.redirect("/listings");     
        
    }
    res.render("./listings/edit.ejs", { listing });
}

// module.exports.updateListing =  async (req, res ,next)=> {
//     let {id } = req.params;
    
//     let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing});

//     if(typeof req.file!== "undefined"){
//     let url = req.file.path;
//     let filename = req.file.filename;
//     listing.image = {url, filename};

//     await listing.save();
//     }
//     console.log("the is edidted listing");
//     req.flash("success", "listing Updated!");
//     res.redirect(`/listings/${id}`);
// }

module.exports.updateListing = async (req, res, next) => {
    const { id } = req.params;

    // Find the listing and update it with the new form data
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    // If a new image is uploaded, update the image details
    if (typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
    }

    // Update the location (coordinates) if the location field was edited
    if (req.body.listing.location) {
        // Use Mapbox Geocoding to get the new coordinates for the updated location
        const geocodingClient = mbxGeocoding({ accessToken: process.env.MAP_TOKEN });
        let response = await geocodingClient.forwardGeocode({
            query: req.body.listing.location,
            limit: 1
        }).send();

        // Update the listing's geometry with the new coordinates
        listing.geometry = response.body.features[0].geometry;
    }

    // Save the updated listing to the database
    await listing.save();

    console.log("Listing has been updated.");
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
};


module.exports.destroyListing = async (req, res ,next)=> {
    let {id} = req.params;
    let deleteListing = await Listing.findByIdAndDelete(id);
    console.log(deleteListing);
    req.flash("success", "Deleted!");
    res.redirect("/listings");
}