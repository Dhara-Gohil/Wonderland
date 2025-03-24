const express = require ("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing");
const {isLoggedIn,isOwner,validatelisting} = require("../middleware.js");

const listingController = require("../controllers/listings.js");

router
    .route("/")
    .get(wrapAsync(listingController.index))
    .post(isLoggedIn,validatelisting , wrapAsync (listingController.createNewListing))


// New listing form route
router.get("/new", isLoggedIn, listingController.renderNewForm);

router
    .route("/:id")
    .get(wrapAsync(listingController.showListings))
    .put(isLoggedIn ,isOwner,validatelisting, wrapAsync (listingController.UpdateListing))
    .delete(isLoggedIn , isOwner, wrapAsync ( listingController.deleteListing))

// Edit form route
router.get("/:id/edit", isLoggedIn, isOwner,wrapAsync (listingController.editListing));

module.exports = router; 