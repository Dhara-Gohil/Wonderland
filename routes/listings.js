const express = require ("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing");
const {isLoggedIn,isOwner,validatelisting} = require("../middleware.js");

const listingController = require("../controllers/listings.js");


// Index route: List all listings
router.get("/",wrapAsync(listingController.index));

// New listing form route
router.get("/new", isLoggedIn, listingController.renderNewForm);

// Show route: View a specific listing
router.get("/:id", wrapAsync(listingController.showListings));

// Create listing route
router.post("/", isLoggedIn,validatelisting , wrapAsync (listingController.createNewListing));

// Edit form route
router.get("/:id/edit", isLoggedIn, isOwner,wrapAsync (listingController.editListing));

// router.get("/:id/edit", async (req, res) => {
//     const { id } = req.params;
//     const listing = await Listing.findById(id);
//     res.render("listings/edit", { listing });
// });

// Update route
router.put("/:id", isLoggedIn ,isOwner,validatelisting, wrapAsync (listingController.UpdateListing));

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

// Delete route
router.delete("/:id" , isLoggedIn , isOwner, wrapAsync ( listingController.deleteListing));

module.exports = router; 