const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const app = express();
const session = require("express-session");
const flash = require("connect-flash");

const listings = require("./routes/listings.js");
const reviews = require("./routes/review.js");
const { cookie } = require("express/lib/response.js");


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

const sessionOptions  = {
    secret:"mysupersecretcode",
    resave: false,
    saveUninitialized:true,  
    cookie:{
        expires: Date.now() + 7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
        httpOnly:true,
    }
};

// Routes
app.get("/", (req, res) => {
    res.send("Welcome to Wonderland!");
});

app.use(session(sessionOptions));
app.use(flash());

app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
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
