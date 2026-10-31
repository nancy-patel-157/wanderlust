// ==========================================
// 1. MODULE IMPORTS (Zaroori Libraries Lana)
// ==========================================

// Web server aur REST APIs banane ke liye Express framework
const express = require("express");
const app = express();

// MongoDB database ke sath connect aur interact karne ke liye ODM (Object Data Modeling) library
const mongoose = require("mongoose");

// Database me collection ke sath kaam karne ke liye Listing model (Schema)
const Listing = require("./models/listing.js");

// Folders aur files ke absolute path banane ke liye Node.js ka built-in path module
const path = require("path");

// HTML form natively sirf GET aur POST support karta hai; PUT aur DELETE bhejne ke liye method-override use hota hai
const methodOverride = require("method-override");

// EJS templates me header, footer aur common boilerplate (layout) share karne ke liye ejs-mate
const ejsMate = require("ejs-mate");


// ==========================================
// 2. DATABASE CONNECTION (MongoDB Setup)
// ==========================================

// Localhost par chal rahe MongoDB database ka URL
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

// DB connection initiate kiya (Promise handling)
main()
  .then(() => {
    console.log("connected to DB"); // Connection successful hone par chalega
  })
  .catch((err) => {
    console.log(err); // Connection fail hone par error dikhayega
  });

// Async function jo actual connection establish karta hai
async function main() {
  await mongoose.connect(MONGO_URL);
}


// ==========================================
// 3. CONFIGURATION & MIDDLEWARES (Express Setup)
// ==========================================

// Template engine EJS set kiya taaki HTML me dynamic JS data render kar sakein
app.set("view engine", "ejs");

// Express ko bataya ki sare .ejs files 'views' folder ke andar dhoondhe
app.set("views", path.join(__dirname, "views"));

// Form submission ke data ko parse karke req.body me JavaScript object banane ke liye
app.use(express.urlencoded({ extended: true }));

// Query string (jaise ?_method=PUT ya ?_method=DELETE) padhkar request ka method badalne ke liye
app.use(methodOverride("_method"));

// CSS, images aur frontend JavaScript jaisi static files serve karne ke liye 'public' folder link kiya
app.use(express.static(path.join(__dirname, "/public")));

// Express ko bataya ki standard EJS ke bajaye ejs-mate layout engine use kare
app.engine('ejs', ejsMate);


// ==========================================
// 4. RESTFUL ROUTES (CRUD Operations)
// ==========================================

// Root Route: Basic health-check / testing endpoint
app.get("/", (req, res) => {
  res.send("Hi, I am root");
});

/**
 * 1. INDEX ROUTE (READ - ALL)
 * Method: GET, URL: /listings
 * Kaam: DB se saari listings nikal kar card grid me render karta hai
 */
app.get("/listings", async (req, res) => {
  const allListings = await Listing.find({}); // Sara data fetch kiya
  res.render("listings/index.ejs", { allListings }); // Data ko index.ejs template me bhej diya
});

/**
 * 2. NEW ROUTE (CREATE - FORM)
 * Method: GET, URL: /listings/new
 * Note: Is route ko /listings/:id se upar rakhna zaroori hai,
 * warna Express 'new' ko ek listing ki ID samajh lega aur error dega!
 */
app.get("/listings/new", (req, res) => {
  res.render("listings/new.ejs"); // Khali form render karta hai
});

/**
 * 3. SHOW ROUTE (READ - ONE)
 * Method: GET, URL: /listings/:id
 * Kaam: Kisi ek particular listing ki details uski unique MongoDB _id se show karta hai
 */
app.get("/listings/:id", async (req, res) => {
  let { id } = req.params; // URL se :id extract ki
  const listing = await Listing.findById(id); // ID ke basis par database me document dhoonda
  res.render("listings/show.ejs", { listing }); // listing ko show.ejs me pass kar diya
});

/**
 * 4. CREATE ROUTE (CREATE - DB INSERT)
 * Method: POST, URL: /listings
 * Kaam: /listings/new wale form se aane wale data ko DB me naye document ki tarah save karta hai
 */
app.post("/listings", async (req, res) => {
  // req.body.listing me form ke sare fields { title, price, ... } ek object me aate hain
  const newListing = new Listing(req.body.listing);
  await newListing.save(); // Document database me persist ho gaya
  res.redirect("/listings"); // Save hone ke baad wapas all listings wale page par bhej diya
});

/**
 * 5. EDIT ROUTE (UPDATE - FORM)
 * Method: GET, URL: /listings/:id/edit
 * Kaam: Listing ko update karne ke liye purane data ke sath pre-filled form open karta hai
 */
app.get("/listings/:id/edit", async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id); // Purani details dhoondi taaki form me pehle se show kar sakein
  res.render("listings/edit.ejs", { listing });
});

/**
 * 6. UPDATE ROUTE (UPDATE - DB UPDATE)
 * Method: PUT, URL: /listings/:id
 * Kaam: Edit form se aayi updated values ko database me replace/update karta hai
 */
app.put("/listings/:id", async (req, res) => {
  let { id } = req.params;
  // findByIdAndUpdate: pehle parameter me ID di, dusre me spread operator {...req.body.listing} se updated fields pass kiye
  await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  res.redirect(`/listings/${id}`); // Update ke baad usi listing ke show page par bhej diya
});

/**
 * 7. DELETE ROUTE (DELETE)
 * Method: DELETE, URL: /listings/:id
 * Kaam: Us ID ke document ko database se permanently remove karta hai
 */
app.delete("/listings/:id", async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id); // DB se delete kiya
  console.log(deletedListing); // Deleted record terminal par verify karne ke liye print kiya
  res.redirect("/listings"); // Wapas index page par redirect kar diya
});


// ==========================================
// 5. SERVER INITIALIZATION
// ==========================================

// Server ko port 8080 par incoming network requests listen karne ke liye start kiya
app.listen(8080, () => {
  console.log("server is listening to port 8080");
});