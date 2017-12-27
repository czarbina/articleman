var mongoose = require("mongoose");

// Save a reference to the Schema constructor
var Schema = mongoose.Schema;

// Using the Schema constructor, create a new UserSchema object
// This is similar to a Sequelize model
var AlbumSchema = new Schema({
  // `title` is required and of type String
  albumName: {
    type: String,
    required: true
  },
  // `link` is required and of type String
  reviewLink: {
    type: String,
    required: true
  },

  albumImg: {
    type: String,
    required: true
  },
  // `note` is an object that stores a Note id
  // The ref property links the ObjectId to the Note model
  // This allows us to populate the Article with an associated Note
  review: {
    type: Schema.Types.ObjectId,
    ref: "Review"
  }
});

// This creates our model from the above schema, using mongoose's model method
var Album = mongoose.model("Album", AlbumSchema);

// Export the Article model
module.exports = Album;