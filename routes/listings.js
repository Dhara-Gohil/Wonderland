const express = require ("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");  
const {listingSchema} = require("../schema.js");
const Listing = require("../models/listing");


// function for validatejoi
const validatelisting = (req,res,next)=>{
    let {error} = listingSchema.validate(req.body);
    // console.log(result);
    if(error){
        let errMsg = error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errMsg);
    }else {
        next();
    }
}



// Index route: List all listings
router.get("/",wrapAsync ( async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index", { allListings });
}));



// New listing form route
router.get("/new", (req, res) => {
    res.render("listings/new");
});



// Show route: View a specific listing
router.get("/:id", wrapAsync( async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    res.render("listings/show", { listing });
}));



// Create listing route
router.post("/", validatelisting , wrapAsync ( async (req, res) => { // Check the incoming data and log it
    console.log("Received listing data:", req.body.listing);// Destructure the incoming data
    const { title, description, image, price, location, country } = req.body.listing; 
    const finalImage = (image && typeof image === 'string' && image.trim() !== '') ? image : undefined; // If image is an empty string, use the default image URL
        // Create a new listing with the processed image field
        const newListing = new Listing({
            title,
            description,
            image: finalImage,  // Use image string or fallback to default
            price,
            location,
            country
        });
        await newListing.save();
        res.redirect("/listings");
     
}));


// Edit form route
// router.get("/:id/edit", async (req, res) => {
//     const { id } = req.params;
//     const listing = await Listing.findById(id);
//     res.render("listings/edit", { listing });
// });

router.get("/:id/edit", wrapAsync ( async (req, res) => {
    const { id } = req.params;
        const listing = await Listing.findById(id);
        if (!listing) {
            return res.status(404).send("Listing not found");
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

router.put("/:id", validatelisting, wrapAsync ( async (req, res) => {
    const { id } = req.params;
        const updatedListing = await Listing.findByIdAndUpdate(id, req.body.listing, { new: true });
        if (!updatedListing) {
            return res.status(404).send("Listing not found for update");
        }
        res.redirect(`/listings/${updatedListing._id}`);
}));



// Delete route
router.delete("/:id" , wrapAsync ( async(req,res)=>{
    let {id}= req.params;
    let deletedlisting = await Listing.findByIdAndDelete(id);
    console.log(deletedlisting);
    res.redirect("/listings");
}));

module.exports = router; 