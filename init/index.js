// const mongoose = require("mongoose");
// const initData = require("./data.js");
// const Listing = require("../models/listing.js");


// const mongo_url = "mongodb://127.0.0.1:27017/wonderland";

// async function main() { // connection of mongodb..
//     await mongoose.connect(mongo_url);
// }

// main().then(()=>{
//     console.log("connected to DB !")
// })
// .catch((err)=>{
//     console.log(err);
// });

// const initDB = async () => { // delete exixting data and insert data from data.js with key data in variable initData.
//     await Listing.deleteMany({});
//     initData.data = initData.data.map((obj)=>({...obj,owner:"67cd4bba431149c9fa0f43fc"}))
//     await Listing.insertMany(initData.data);
//     console.log("data inserted !");
// }

// initDB(); // above function call

const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

// MongoDB Atlas or Local Connection
const mongo_url = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/wonderland";

// MongoDB Connection
async function main() {
    try {
        await mongoose.connect(mongo_url);
        console.log("Connected to MongoDB!");
    } catch (err) {
        console.error("MongoDB Connection Error:", err);
    }
}

main();

const initDB = async () => {
    try {
        await Listing.deleteMany({}); // Delete existing listings
        initData.data = initData.data.map((obj) => ({ ...obj, owner: "67cd4bba431149c9fa0f43fc" }));
        await Listing.insertMany(initData.data);
        console.log("Data inserted successfully!");
    } catch (err) {
        console.error("Error inserting data:", err);
    } finally {
        mongoose.connection.close(); // Close connection after inserting data
    }
};

initDB();
