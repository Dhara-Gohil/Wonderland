const Listing = require("../models/listing");

module.exports.index =  async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index", { allListings });
}

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new");
}

module.exports.showListings = async (req, res) => {
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
}

module.exports.createNewListing = async (req, res) => { // Check the incoming data and log it
    let url = req.file.path;
    let filename = req.file.filename;
    console.log(url,filename)
    console.log("Received listing data:", req.body.listing);// Destructure the incoming data
    const { title, description, price, location, country } = req.body.listing; 
    const owner = req.user._id;
    const finalImage = {filename,url} // If image is an empty string, use the default image URL
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
     
}

module.exports.editListing =  async (req, res) => {
    const { id } = req.params;
        const listing = await Listing.findById(id);
        if (!listing) {
            req.flash("error","Listing you requested for does not exist !");
            res.redirect("/listings");

        }

        let originalImage = listing.image.url;
        originalImage=originalImage.replace("/upload","/upload/w_250")
        res.render("listings/edit", { listing,originalImage });
}

module.exports.UpdateListing =  async (req, res) => {
    const { id } = req.params;
        const updatedListing = await Listing.findByIdAndUpdate(id, req.body.listing, { new: true });
        if ( typeof req.file !== "undefined"){
            let url = req.file.path;
            let filename = req.file.filename;
            updatedListing.image = {url,filename};
            await updatedListing.save();
        }
        if (!updatedListing) {
            req.flash("error","Listing you requested for does not exist !");
            res.redirect("/listings");
        }
        req.flash("success","Listing Updated!")
        res.redirect(`/listings/${updatedListing._id}`);
}

module.exports.deleteListing = async(req,res)=>{
    let {id}= req.params;
    let deletedlisting = await Listing.findByIdAndDelete(id);
    console.log(deletedlisting);
    req.flash("success","Listing Deleted!")
    res.redirect("/listings");
}

// (image && typeof image === 'string' && image.trim() !== '') ? image : undefined;}