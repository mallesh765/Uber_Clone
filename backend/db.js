const mongoose = require("mongoose");
require("dotenv").config();
const connection = mongoose.connect(process.env.mongoURL);
module.exports = {
  connection,
};

// const mongoose = require("mongoose");
// require("dotenv").config();

// const url = process.env.mongoURL;

// mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => {
//     console.log("Connected to MongoDB");
//   })
//   .catch(err => {
//     console.error("Error connecting to MongoDB:", err.message);
//   });

// module.exports = mongoose;
