var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
const { check, validationResult } = require("express-validator");

var fs = require("fs");
var path = require("path");
require("dotenv/config");

mongoose.connect(
  process.env.MONGO_URL,
  { useNewUrlParser: true, useUnifiedTopology: true },
  (err) => {
    console.log("connected");
  }
);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static("public"));

// Set EJS as templating engine
app.set("view engine", "ejs");

var multer = require("multer");

var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "-" + Date.now());
    // console.log(file);
  },
});

var upload = multer({ storage: storage });

var imgModel = require("./model");
var imgModelApartment = require("./modelApartment");
var imgModelCondo = require("./modelCondo");
var imgModelContactUs = require("./contactUsModel");

const { name } = require("ejs");

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.get("/list_your_property", (req, res) => {
  res.render("list_your_property");
});

app.get("/apartment", (req, res) => {
  imgModelApartment.find({}, (err, items) => {
    if (err) {
      console.log(err);
      res.status(500).send("An error occurred", err);
    } else {
      res.render("apartment", { items: items });
    }
  });
});

app.get("/contact_us", (req, res) => {
  res.render("contact_us");
});

app.get("/house", (req, res) => {
  imgModel.find({}, (err, items) => {
    if (err) {
      console.log(err);
      res.status(500).send("An error occurred", err);
    } else {
      res.render("house", { items: items });
    }
  });
});

app.get("/privacy_policy", (req, res) => {
  res.render("privacy_policy");
});

// app.get("/condo", (req, res) => {
//   res.render("condo");
// });

app.get("/condo", (req, res) => {
  imgModelCondo.find({}, (err, items) => {
    if (err) {
      console.log(err);
      res.status(500).send("An error occurred", err);
    } else {
      res.render("condo", { items: items });
    }
  });
});

//validation for the input fields except image field
const propertyTypeValues = ["House", "Apartment", "Condo"];
const furnishingValues = ["Furnished", "Unfurnished"];
const leaseValues = ["Long Term", "Short Term"];
const validator = [
  check("property_type")
    .isIn(propertyTypeValues)
    .withMessage("Select your property type"),
  check("address", "Address should not be empty").notEmpty(),
  check("rent", "Please enter rent").notEmpty().exists(),
  check("beds", "Please mention the number of bedrooms").notEmpty().exists(),
  check("baths", "Please mention the number of baths").notEmpty().exists(),
  check("furnishing")
    .isIn(furnishingValues)
    .withMessage("Select your furnishing option"),
  check("lease").isIn(leaseValues).withMessage("Select your lease term"),
  check("availability", "Mention the availability of the property").notEmpty(),
  check("util", "Mention the utilities provided").notEmpty(),
  check("email", "Please enter a valid email address!")
    .isEmail()
    .normalizeEmail(),
  check("phone", "Please enter a valid phone number").notEmpty(),
];

const result = (req, res, next) => {
  const result = validationResult(req);
  const hasError = !result.isEmpty();

  if (hasError) {
    const error = result.array();
    // res.json({ success: false, message: error });
    res.render("list_your_property", {
      error,
    });
  }
  next();
};

//image file type validation
const validateFile = (req, res, next) => {
  const fileType = ["png", "jpg", "jpeg"];

  if (!req.file) {
    return res.json({ success: false, message: "Image is required!" });
  }

  // const fileExtension = req.file.mimetype.split("/").pop();
  const fileExtension = req.file.mimetype.split("/").pop();
  if (!fileType.includes(fileExtension)) {
    return res.json({ success: false, message: "Image is not valid!" });
  }
  next();
};

app.post(
  "/list_your_property",
  upload.single("image"),
  validator,
  result,
  validateFile,
  (a = (req, res, next) => {
    var obj = {
      property_type: req.body.property_type,
      address: req.body.address,
      rent: req.body.rent,
      beds: req.body.beds,
      baths: req.body.baths,
      furnishing: req.body.furnishing,
      lease: req.body.lease,
      availability: req.body.availability,
      util: req.body.util,
      email: req.body.email,
      phone: req.body.phone,

      img: {
        data: fs.readFileSync(
          path.join(__dirname + "/uploads/" + req.file.filename)
        ),

        contentType: "image/*",
      },
    };

    if (obj.property_type == "House") {
      imgModel.create(obj, (err, item) => {
        if (err) {
          console.log(err);
        } else {
          // item.save();
          res.redirect("/house");
        }
      });
    } else if (obj.property_type == "Apartment") {
      imgModelApartment.create(obj, (err, item) => {
        if (err) {
          console.log(err);
        } else {
          // item.save();
          res.redirect("/apartment");
        }
      });
    } else {
      imgModelCondo.create(obj, (err, item) => {
        if (err) {
          console.log(err);
        } else {
          // item.save();
          res.redirect("/condo");
        }
      });
    }
  })
);

app.post("/contact_us", upload.none(), (req, res, next) => {
  var objc = {
    name: req.body.name,
    email: req.body.email,
    comments: req.body.comments,
  };

  imgModelContactUs.create(objc, (err, item) => {
    if (err) {
      console.log(err);
    } else {
      // item.save();
      res.redirect("/contact_us");
    }
  });
});

var port = process.env.PORT || "3000";
app.listen(port, (err) => {
  if (err) throw err;
  console.log("Server listening on port", port);
});
