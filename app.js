const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const app = express();

const listings = require("./routes/listings.js");
const reviews = require("./routes/review.js");


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


app.use("/listings", listings);  
app.use("/listings/:id/reviews", reviews);
 

// for error handling 
app.all("*",(read,res,next)=>{
    next(new ExpressError(404,"page not found!"));
});

app.use((err,req,res,next)=>{
   let {statusCode=500 , message="Something went wrong" } = err;
   res.status(statusCode).render("error.ejs",{message});
    // res.status(statusCode),res.send(message);
});
