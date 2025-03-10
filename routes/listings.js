const express = require ("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing");
const {isLoggedIn,isOwner,validatelisting} = require("../middleware.js");






// Index route: List all listings
router.get("/",wrapAsync ( async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index", { allListings });
}));



// New listing form route
router.get("/new", isLoggedIn, (req, res) => {
    res.render("listings/new");
});



// Show route: View a specific listing
router.get("/:id", wrapAsync( async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id)
    .populate({
        path:"reviews",
        populate:{
            path:"author",
        },
    })
    .populate("owner");
    if(!listing){
        req.flash("error","Listing you requested for does not exist !");
        res.redirect("/listings");
    }
    console.log(listing);
    res.render("listings/show", { listing });
}));



// Create listing route
router.post("/", isLoggedIn,validatelisting , wrapAsync ( async (req, res) => { // Check the incoming data and log it
    console.log("Received listing data:", req.body.listing);// Destructure the incoming data
    const { title, description, image, price, location, country } = req.body.listing; 
    const owner = req.user._id;
    const finalImage = (image && typeof image === 'string' && image.trim() !== '') ? image : undefined; // If image is an empty string, use the default image URL
        // Create a new listing with the processed image field
        const newListing = new Listing({
            title,
            description,
            image: finalImage,  // Use image string or fallback to default
            price,
            location,
            country,
            owner
        });
        await newListing.save();
        req.flash("success","New Listing created!")
        res.redirect("/listings");
     
}));


// Edit form route
// router.get("/:id/edit", async (req, res) => {
//     const { id } = req.params;
//     const listing = await Listing.findById(id);
//     res.render("listings/edit", { listing });
// });

router.get("/:id/edit", isLoggedIn, isOwner,wrapAsync ( async (req, res) => {
    const { id } = req.params;
        const listing = await Listing.findById(id);
        if (!listing) {
            req.flash("error","Listing you requested for does not exist !");
            res.redirect("/listings");

        }
        res.render("listings/edit", { listing });
}));


// Update route
// router.put("/:id", async (req, res) => {
//     const { id } = req.params;
//     try {
//         const updatedListing = await Listing.findByIdAndUpdate(id, req.body.listing, { new: true });
//         res.redirect(`/listings/${updatedListing._id}`);
//     } catch (err) {
//         console.error("Error updating listing:", err);
//         res.send("Error while updating the listing.");
//     }
// });

router.put("/:id", isLoggedIn ,isOwner,validatelisting, wrapAsync ( async (req, res) => {
    const { id } = req.params;
        const updatedListing = await Listing.findByIdAndUpdate(id, req.body.listing, { new: true });
        if (!updatedListing) {
            req.flash("error","Listing you requested for does not exist !");
            res.redirect("/listings");
        }
        req.flash("success","Listing Updated!")
        res.redirect(`/listings/${updatedListing._id}`);
}));



// Delete route
router.delete("/:id" , isLoggedIn , isOwner, wrapAsync ( async(req,res)=>{
    let {id}= req.params;
    let deletedlisting = await Listing.findByIdAndDelete(id);
    console.log(deletedlisting);
    req.flash("success","Listing Deleted!")
    res.redirect("/listings");
}));

module.exports = router; 