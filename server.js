var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = process.env.PORT || 3000;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: false }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;

if (process.env.MONGODB_URI) {

  mongoose.connect(process.env.MONGODB_URI);

} else {

  mongoose.connect("mongodb://localhost/articleman", {
    useMongoClient: true
  });
}

// Routes

// A GET route for scraping the pitchfork website
app.get("/scrape_albums", function(req, res) {
  // First, we grab the body of the html with request
  axios.get("https://pitchfork.com/reviews/albums/").then(function(response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);

    // Now, we grab every h2 within an article tag, and do the following:
    $("div.review").each(function(i, element) {
      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.albumName = $(this)
        .find("h2")
        .text();
      result.reviewLink = $(this)
        .children()
        .attr("href");
      result.albumImg = $(this)
        .find("img")
        .attr("src")  

      // Create a new Article using the `result` object built from scraping
      db.Album
        .create(result)
        .then(function(dbAlbum) {
          // If we were able to successfully scrape and save an Article, send a message to the client
          res.send("Scrape Complete");
        })
        .catch(function(err) {
          // If an error occurred, send it to the client
          res.json(err);
        });
    });
  });
});

// Route for getting all Articles from the db
app.get("/albums", function(req, res) {
  // Grab every document in the Articles collection
  db.Album
    .find({})
    .then(function(dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

app.get("/albums/:id", function(req, res) {
  cache: false;
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Album
    .findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("review")
    .then(function(dbAlbum) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbAlbum);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

app.post("/albums/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  db.Review
    .create(req.body)
    .then(function(dbReview) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Album.findOneAndUpdate({ _id: req.params.id }, { review: dbReview._id }, { new: true });
    })
    .then(function(dbAlbum) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbAlbum);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

app.delete("/albums/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  db.Review
    .remove(req.body)
    .then(function(dbReview) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      db.Album.findOneAndRemove({ _id: req.params.id }, { review: dbReview._id });
    })
    .then(function(dbAlbum) {
      // If we were able to successfully update an Article, send it back to the client
      res.end();
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
