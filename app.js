const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const Listing = require("./models/listing");

const app = express();
const mongo_url = "mongodb://127.0.0.1:27017/wonderland";

// Database connection
async function main() {
    await mongoose.connect(mongo_url);
    console.log("Connected to MongoDB!");
}

main().catch((err) => console.error(err));

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

// Index route: List all listings
app.get("/listings", async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index", { allListings });
});

// New listing form route
app.get("/listings/new", (req, res) => {
    res.render("listings/new");
});

// Create listing route
app.post("/listings", async (req, res) => {
    // Check the incoming data and log it
    console.log("Received listing data:", req.body.listing);

    // Destructure the incoming data
    const { title, description, image, price, location, country } = req.body.listing;

    // If image is an empty string, use the default image URL
    const finalImage = (image && typeof image === 'string' && image.trim() !== '') ? image : undefined;

    try {
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
    } catch (err) {
        console.error("Error creating listing:", err);
        res.send("Error while creating the listing.");
    }
});


// Show route: View a specific listing
app.get("/listings/:id", async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show", { listing });
});

// Edit form route
// app.get("/listings/:id/edit", async (req, res) => {
//     const { id } = req.params;
//     const listing = await Listing.findById(id);
//     res.render("listings/edit", { listing });
// });

app.get("/listings/:id/edit", async (req, res) => {
    const { id } = req.params;
    try {
        const listing = await Listing.findById(id);
        if (!listing) {
            return res.status(404).send("Listing not found");
        }
        res.render("listings/edit", { listing });
    } catch (err) {
        console.error("Error fetching listing for edit:", err);
        res.status(500).send("Server Error");
    }
});


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

app.put("/listings/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const updatedListing = await Listing.findByIdAndUpdate(id, req.body.listing, { new: true });
        if (!updatedListing) {
            return res.status(404).send("Listing not found for update");
        }
        res.redirect(`/listings/${updatedListing._id}`);
    } catch (err) {
        console.error("Error updating listing:", err);
        res.status(500).send("Error while updating the listing.");
    }
});


// Delete route
app.delete("/listings/:id",async(req,res)=>{
    let {id}= req.params;
    let deletedlisting = await Listing.findByIdAndDelete(id);
    console.log(deletedlisting);
    res.redirect("/listings");
});

// Start the server
app.listen(8080, () => {
    console.log("Server is running on http://localhost:8080");
});
