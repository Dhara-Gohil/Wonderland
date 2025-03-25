const { object } = require("joi");
const mongoose = require("mongoose");
const Schema = mongoose.Schema; // class ; creating schema


const listingschema = new Schema({ // object ; creating model
  title: {
    type: String,
    // required: true,
    default : "Title is not Entered",
  },
  description: String,
  image: {
    url:String,
    filename:String,
  },
price: {
    type: Number,
    default:0,
  },
  location: String,
  country: String,
  reviews : [
    {
      type : Schema.Types.ObjectId,
      ref : "Review",
    }
  ],
  owner:{
    type:Schema.Types.ObjectId,
    ref:"User",
  }
});

const Review = require("./review");

listingschema.post("findOneAndDelete", async (listing)=>{
  if(listing){
    await Review.deleteMany({_id:{$in:listing.reviews}});
  }
})


const Listing = mongoose.model("Listing", listingschema); // using this model
module.exports = Listing; // return this model...!
