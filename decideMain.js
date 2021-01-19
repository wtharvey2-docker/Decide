/* Decide Page */
// Made so that everyone has a voice and have an equal say in making a decision
// Everyone put the same effort of coming up with ideas and ranking
// No one has to be the bad guy when it comes to ruling things out

  /* Decision options are:
  0 = Random decision of user generated ideas
  1 = Random decision of user generated picks
  2 = User-ranked decision of user generated picks
    // For Further Work:
  3 = Random decision of choices from an external source
  4 = User-ranked decision of choices from an external source
  5 = Program-ranked decision on external choices based on external ratings
  */

function makeNewURL(){
    // get new id number
    let id_val = 0
    var request = new XMLHttpRequest();
    let requestURL = "/dataComm/newID"
    request.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
           // Gets the ID value to add to the URL
           id_val = request.responseText;
        }
    };
    /* Currently using a synchronous HTTP request because a response is needed
    before submitting form and moving to next page.
    TO DO: re-factor the page to perform this asynchronously
    */
    request.open("GET", requestURL, false);
    request.send();

    // make form data into an entry in the data

    // Add ID Value to the form
    idValueEntry = document.getElementById('questionIDNumber');
    idValueEntry.setAttribute("value", id_val);

    // Makes a dictionary for the question request
    let algorithm = 1; // defaults to 'randomVote'
    if (document.getElementById('randomIdea').value == 1) {
      algorithm = 0;
    } else if (document.getElementById('rankedVote').value == 1) {
      algorithm = 2;
    }
    let rejectState = 0;
    if (document.getElementById('allowRejects').checked == true) {
      rejectState = 1;
    }

    newQuestionSession = {
      Question: document.getElementById('groupQuestion').value,
      Algorithm: String(algorithm),
      Rejects: rejectState,
      QuestionID: String(id_val),
      State: "ideation",
      Ideas: [],
      Votes: [],
      Scores: {},
      Winner: ""
    }

    // Post data to server for a session
    postQuestionToServer(newQuestionSession)

    // TODO: Delete information from form to prevent extra data
    clearFormData();

    // set the action to be going to the question page
    var form = document.getElementById('groupForm');
    form.action = "question";
}

function postQuestionToServer(newQuestionDict) {
  var request = new XMLHttpRequest();
  let requestURL = "/dataComm"
  /* Currently using a synchronous HTTP request because a response is needed
  before submitting form and moving to next page.
  TO DO: re-factor the page to perform this asynchronously
  */
  request.open("POST", requestURL);
  request.setRequestHeader("Content-Type", "application/json");
  requestString = JSON.stringify(newQuestionDict);
  request.send(requestString);
}

function clearFormData() {
  questionEntry = document.getElementById('groupQuestion');
  questionEntry.setAttribute("value", '');
  /* Other settings are not deemed sensitive data
    and are thus not cleared */
}
