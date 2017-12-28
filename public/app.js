// Grab the articles as a json
$.getJSON("/albums", function(data) {
  // For each one
  for (var i = 0; i < data.length; i++) {
    // Display the apropos information on the page
    $("#albums").append("<p id='album' data-id='" + data[i]._id + "'>" + data[i].albumName + "<br />" + "<a href='https://pitchfork.com" + data[i].reviewLink + "'>" + data[i].reviewLink + 
       "<br/>" + "<img src='" + data[i].albumImg + "'></p>"
      );
  }
});


// Whenever someone clicks a p tag
$(document).on("click", "p", function() {
  // Empty the notes from the note section
  $("#review").empty();
  // Save the id from the p tag
  var thisId = $(this).attr("data-id");

  // Now make an ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/albums/" + thisId
  })
    // With that done, add the note information to the page
    .done(function(data) {
      console.log(data);
      // The title of the article
      $("#review").append("<h4>" + data.albumName + "</h4>");
      // An input to enter a new title
      $("#review").append("<input id='titleinput' name='title' >");
      // A textarea to add a new note body
      $("#review").append("<textarea id='bodyinput' name='body'></textarea>");
      // A button to submit a new note, with the id of the article saved to it
      $("#review").append("<button data-id='" + data._id + "' id='savereview'>Save Review</button>");
      $("#review").append("<button data-id='" + data._id + "' id='deletereview'>Remove Review</button>");


      // If there's a note in the article
      if (data.review) {
        // Place the title of the note in the title input
        console.log("hi");
        $("#titleinput").val(data.review.title);
        // // Place the body of the note in the body textarea
        $("#bodyinput").val(data.review.body);
      }
    });
});

// When you click the savenote button
$(document).on("click", "#savereview", function() {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/albums/" + thisId,
    data: {
      // Value taken from title input
      title: $("#titleinput").val(),
      // Value taken from note textarea
      body: $("#bodyinput").val(),

    }
  })
    // With that done
    .done(function(data) {
      // Log the response
      console.log(data);
      console.log("POST should work...")
      // Empty the notes section
      $("#review").empty();
    });

  // Also, remove the values entered in the input and textarea for note entry
  $("#titleinput").val("");
  $("#bodyinput").val("");
});

$(document).on("click", "#deletereview", function() {
  // alert("I've been clicked!");
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "DELETE",
    url: "/albums/" + thisId,
    // data: {
    //   // Value taken from title input
    //   title: $("#titleinput").val(),
    //   // Value taken from note textarea
    //   body: $("#bodyinput").val(),

    // }
  })
    // With that done
    .done(function(data) {
      // Log the response
      console.log(data);
      console.log("delete this bad boy...")
      // Empty the notes section
      $("#review").empty();
    });

  // Also, remove the values entered in the input and textarea for note entry
  $("#titleinput").val("");
  $("#bodyinput").val("");
});