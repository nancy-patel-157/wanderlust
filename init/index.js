// MongoDB के साथ कनेक्ट और क्वेरी चलाने के लिए Mongoose लाइब्रेरी इंपोर्ट की
const mongoose = require("mongoose");

// Dummy / Sample डेटा की ऐरे (Array) को data.js फ़ाइल से इंपोर्ट किया
const initData = require("./data.js");

// Listing कलेक्शन का Mongoose Model इंपोर्ट किया (ताकि DB में CRUD ऑपरेशन्स कर सकें)
// Note: '..' का मतलब है एक फ़ोल्डर पीछे (parent directory) जाकर models फ़ोल्डर में देखना
const Listing = require("../models/listing.js");


// ==========================================
// 2. DATABASE CONNECTION (डेटाबेस कनेक्शन)
// ==========================================

// Local MongoDB सर्वर और 'wanderlust' डेटाबेस का URL
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

// Connection शुरू करने वाला फ़ंक्शन कॉल किया (Promise handling)
main()
  .then(() => {
    console.log("connected to DB"); // कनेक्शन सफल होने पर टर्मिनल में दिखेगा
  })
  .catch((err) => {
    console.log(err); // अगर MongoDB सर्विस बंद है या एरर आए तो टर्मिनल में एरर प्रिंट होगा
  });

// Asynchronous फ़ंक्शन जो Mongoose के ज़रिए डेटाबेस को कनेक्ट करता है
async function main() {
  await mongoose.connect(MONGO_URL);
}


// ==========================================
// 3. DATABASE SEEDING (सैम्पल डेटा डालना)
// ==========================================

const initDB = async () => {
  // Step A: पुराने डेटा को साफ़ करना
  // deleteMany({}) के अंदर खाली ऑब्जेक्ट {} देने से 'listings' कलेक्शन का सारा पुराना डेटा डिलीट हो जाता है
  // ताकि डुप्लीकेट डेटा या पुराने फ़ॉर्मेट का डेटा क्लैश न करे
  await Listing.deleteMany({});

  // Step B: नया सैम्पल डेटा एक साथ डालना
  // data.js में जो ऑब्जेक्ट था { data: [...] }, उसमें से initData.data (एरे) को एक ही बार में DB में इंसर्ट कर दिया
  await Listing.insertMany(initData.data);

  // सफलतापूर्वक डेटा स्टोर होने पर मैसेज प्रिंट किया
  console.log("data was initialized");
};

// Seeding फ़ंक्शन को एक्ज़ीक्यूट किया
initDB();