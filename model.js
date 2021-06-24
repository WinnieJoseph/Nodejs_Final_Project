var mongoose = require("mongoose");

var imageSchema = new mongoose.Schema({
  property_type: String,
  address: String,
  rent: String,
  beds: String,
  baths: String,
  furnishing: String,
  lease: String,
  availability: String,
  util: String,
  email: String,
  phone: String,

  img: {
    data: Buffer,
    contentType: String,
  },
});

//Image is a model which has a schema imageSchema

module.exports = new mongoose.model("Image", imageSchema);
