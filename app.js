
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

const listings = require("./routes/listings.js");
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

app.use("/listings", listings);  

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
