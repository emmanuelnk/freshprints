const express = require("express");
const path = require("path");
const logger = require("morgan");
const axios = require("axios");
const _ = require("underscore");
const extend = require('extend');
const compression = require("compression");
const methodOverride = require("method-override");
const session = require("express-session");
const flash = require("express-flash");
const bodyParser = require("body-parser");
const expressValidator = require("express-validator");
const dotenv = require("dotenv");
const exphbs = require("express-handlebars");
const mongoose = require("mongoose");
const format = require("util").format;
const Multer = require("multer");
const multer = Multer({
    storage: Multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // no larger than 5mb, you can change as needed.
    }
});
// Load environment variables from .env file
dotenv.load();

// -------------    Google Cloud APIs  ---------------------
//API_key
const API_key = require("./sensitive/API_key");
const Storage = require("@google-cloud/storage");
const Vision = require('@google-cloud/vision');
// Instantiate a storage client
const storage = Storage();
const vision = Vision();
// A bucket is a container for objects (files).
const bucket = storage.bucket(process.env.GCLOUD_STORAGE_BUCKET);
// ----------------------  END ----------------------------

// Controllers
const HomeController = require("./controllers/home");
const contactController = require("./controllers/contact");
const aboutController = require("./controllers/about");

const app = express();


// mongoose.connect("localhost" || process.env.MONGODB);
// mongoose.connection.on('error', function() {
//   console.log('MongoDB Connection Error. Please make sure that MongoDB is running.');
//   process.exit(1);
// });

const hbs = exphbs.create({
    defaultLayout: "main",
    helpers: {
        ifeq: function (a, b, options) {
            if (a === b) {
                return options.fn(this);
            }
            return options.inverse(this);
        },
        toJSON: function (object) {
            return JSON.stringify(object);
        }
    }
});

app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");
app.set("port", process.env.PORT || 3000);
app.use(compression());
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(expressValidator());
app.use(methodOverride("_method"));
app.use(session({secret: process.env.SESSION_SECRET, resave: true, saveUninitialized: true}));
app.use(flash());
app.use(express.static(path.join(__dirname, "public")));

// view controllers
app.get("/", HomeController.index);
app.get("/contact", contactController.contactGet);
app.get("/about", aboutController.contactGet);
app.post("/contact", contactController.contactPost);

// app requests

app.post("/local-upload", multer.single("file"), function (req, res, next) {
    // console.log(req.file);
    if (!req.file.mimetype.startsWith("image/")) {
        return res.status(422).json({
            error: "The uploaded file must be an image"
        });
    }
    return res.status(200).send(req.file);
});

// Process the file upload and upload to Google Cloud Storage.
app.post("/file-upload", multer.single("file"), (req, res, next) => {
    if (!req.file) {
        res.status(400).send("No file uploaded.");
        return;
    }

    // Create a new blob in the bucket and upload the file data.
    const blob = bucket.file(req.file.originalname);
    const blobStream = blob.createWriteStream();

    blobStream.on("error", (err) => {
        next(err);
    });

    blobStream.on("finish", () => {
        // The public URL can be used to directly access the file via HTTP.
        const publicUrl = format(`https://storage.googleapis.com/${bucket.name}/${blob.name}`);
        // gs link
        const gsLink = `gs://${bucket.name}/${blob.name}`;
        // res.status(200).send(publicUrl);

        // Build the vision object
        let visionObj = {};
        const visionImageFeatures =[{
            type:"FACE_DETECTION"
        },{
            type:"LANDMARK_DETECTION"
        },{
            type:"LOGO_DETECTION"
        },{
            type:"LABEL_DETECTION"
        },{
            type:"TEXT_DETECTION"
        },{
            type:"IMAGE_PROPERTIES"
        },{
            type:"CROP_HINTS"
        }
        ,{
            type:"WEB_DETECTION"
        }
        ];
        const request = {
            image: {source: {imageUri: gsLink}},
            features: visionImageFeatures,
        };
        vision.annotate(request).then(response => {
            // doThingsWith(response);
            visionObj.cloudFileName = blob.name;
            visionObj.responses = response[1].responses;
            res.status(200).send(visionObj);
            // then delete the file from the bucket because we no longer need it
                storage
                    .bucket(bucket.name)
                    .file(blob.name)
                    .delete()
                    .then(() => {
                        console.log(`gs://${bucket.name}/${blob.name} deleted.`);
                    })
                    .catch((err) => {
                        console.error('ERROR:', err);
                    });
        }).catch(err => {
            console.error(err);
        });
    });

    blobStream.end(req.file.buffer);
});

// Production error handler
if (app.get("env") === "production") {
    app.use(function (err, req, res, next) {
        console.error(err.stack);
        res.sendStatus(err.status || 500);
    });
}

app.listen(app.get("port"), function () {
    console.log("Express server listening on port " + app.get("port"));
});

module.exports = app;
