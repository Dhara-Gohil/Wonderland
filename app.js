
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const Listing = require("./models/listing");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema,reviewSchema} = require("./schema.js");
const Review = require("./models/review");


const app = express();
const mongo_url = "mongodb://127.0.0.1:27017/wonderland";

// Database connection
async function main() {
    await mongoose.connect(mongo_url);
    console.log("Connected to MongoDB!");
}

main().catch((err) => console.error(err));

// Start the server
app.listen(8080, () => {
    console.log("Server is running on http://localhost:8080");
});


// Middleware
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true })); // Parse form data
app.use(methodOverride("_method")); // Override method for PUT/PATCH/DELETE
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));// for public


// Routes
app.get("/", (req, res) => {
    res.send("Welcome to Wonderland!");
});

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

const validateReview = (req,res,next)=>{
    let {error} = reviewSchema.validate(req.body);
    // console.log(result);
    if(error){
        let errMsg = error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errMsg);
    }else {
        next();
    }
}

// Index route: List all listings
app.get("/listings",wrapAsync ( async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index", { allListings });
}));

// New listing form route
app.get("/listings/new", (req, res) => {
    res.render("listings/new");
});

// Create listing route
app.post("/listings", validatelisting , wrapAsync ( async (req, res) => { // Check the incoming data and log it
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



// Show route: View a specific listing
app.get("/listings/:id", wrapAsync( async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    res.render("listings/show", { listing });
}));

// Edit form route
// app.get("/listings/:id/edit", async (req, res) => {
//     const { id } = req.params;
//     const listing = await Listing.findById(id);
//     res.render("listings/edit", { listing });
// });

app.get("/listings/:id/edit", wrapAsync ( async (req, res) => {
    const { id } = req.params;
        const listing = await Listing.findById(id);
        if (!listing) {
            return res.status(404).send("Listing not found");
        }
        res.render("listings/edit", { listing });
}));
// Update route
// app.put("/listings/:id", async (req, res) => {
//     const { id } = req.params;
//     try {
//         const updatedListing = await Listing.findByIdAndUpdate(id, req.body.listing, { new: true });
//         res.redirect(`/listings/${updatedListing._id}`);
//     } catch (err) {
//         console.error("Error updating listing:", err);
//         res.send("Error while updating the listing.");
//     }
// });

app.put("/listings/:id", validatelisting, wrapAsync ( async (req, res) => {
    const { id } = req.params;
        const updatedListing = await Listing.findByIdAndUpdate(id, req.body.listing, { new: true });
        if (!updatedListing) {
            return res.status(404).send("Listing not found for update");
        }
        res.redirect(`/listings/${updatedListing._id}`);
}));

// Delete route
app.delete("/listings/:id" , wrapAsync ( async(req,res)=>{
    let {id}= req.params;
    let deletedlisting = await Listing.findByIdAndDelete(id);
    console.log(deletedlisting);
    res.redirect("/listings");
}));

// for Reviews
//post review route
app.post("/listings/:id/review", validateReview ,wrapAsync( async(req,res)=>{
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);

    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    res.redirect(`/listings/${listing._id}`)
}))

//delete review route
app.delete("/listings/:id/reviews/:reviewId",
    wrapAsync( async ( req, res)=>{
        let {id ,reviewId} = req.params;

        await Listing.findByIdAndUpdate(id , {$pull : {reviews:reviewId}});
        await Review.findByIdAndDelete(reviewId);

        res.redirect(`/listings/${id}`);
    }))
 

// for error handling 

app.all("*",(read,res,next)=>{
    next(new ExpressError(404,"page not found!"));
});

app.use((err,req,res,next)=>{
   let {statusCode=500 , message="Something went wrong" } = err;
   res.status(statusCode).render("error.ejs",{message});
    // res.status(statusCode),res.send(message);
});
