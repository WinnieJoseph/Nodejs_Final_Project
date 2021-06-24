var mongoose = require("mongoose");

var imageSchema = new mongoose.Schema({
  name: String,
  email: String,
  comments: String,
});

//Image is a model which has a schema imageSchema

module.exports = new mongoose.model("contactUsImage", imageSchema);
