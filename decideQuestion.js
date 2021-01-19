"use strict";

// Global Variables
let debug = 0;
let sessionState = "";
let questionID = "";
let groupQuestion = "";
let decisionAlgorithm = "";
let showVotes = 1;
let allowRejects = 0;
let numberOfOptions = 0; // initializing for decisionAlgorithm
let numberOfVotes = 0;
let ideaArray = [];
let voteArray = [];
let scores = {};
let winner = "";
let minimumOptionQuantity = 2; // 1 for testing, 2 for operations
let minimumVoteQuantity = 1; // not currently used
let oldFirst = "random";
let oldSecond = "random";
let oldThird = "random";
let ideaListHTMLWithoutVotes =""

function processURL() {
  setEnterFunction("ideaFormIdea","ideaButton0");
  setEnterFunction("voteFormName", 0);
  // defining indices
  let questionIDIndex = document.URL.indexOf("questionID=") + ("questionID=").length;

  // translating information from URL
  questionID = document.URL.substring(questionIDIndex)
  getSessionData(questionID)

  while (groupQuestion.indexOf("%") != -1 &&
  groupQuestion.indexOf("%") != groupQuestion.length - 1) {
    /* first case is checking to see if there may be any html codes for
    characters not allowed in a URL. Second case is to make sure that
    if input ends in a "%", the "%" is not deleted. */
    let initialQuestion = groupQuestion;
    let htmlCode = groupQuestion.substring(groupQuestion.indexOf("%")+1,
    groupQuestion.indexOf("%")+3);
    let stringCode = String.fromCharCode(parseInt(htmlCode, 16));
    groupQuestion = groupQuestion.replace("%" + htmlCode, stringCode);
    if (initialQuestion === groupQuestion) {
      /* edge case prevention when an issue arises
      that would cause complete page failure */
      console.log("The while loop is being entered, but the code isn't changing"
      + " anything. It would otherwise loop forever without this break.");
      break;
    };
  };

  // For debugging
  if (debug) {
    console.log("The Question Input is: " + groupQuestion);
    console.log("decisionAlgorithm = " + decisionAlgorithm);
    console.log("showVotes = " + showVotes);
    console.log("allowRejects = " + allowRejects);
  }
  document.getElementById("questionHeading").innerHTML = groupQuestion

  // handle sessions that aren't in ideation still
  if (sessionState == "voting"){
    loadVotingState()
  } else if (sessionState == "result") {
    loadResultState()
  } else { // sessionState == 'ideation'
    loadIdeationState()
  }
}

function loadIdeationState() {
  var ideaInd;
  for (ideaInd = 0; ideaInd < ideaArray.length; ideaInd++) {
    addIdea(ideaArray[ideaInd]);
  }
}

function loadVotingState() {
  loadIdeationState()
  afterIdeationActions(0)
  var voteInd;
  for (voteInd = 0; voteInd < voteArray.length; voteInd++) {
    addToVoterList(voteArray[voteInd])
  }
}

function loadResultState() {
  // load a session that has state="result"
  loadVotingState()
  endVoting()
  if (decisionAlgorithm == 2){
    showScores()
  } else {
    document.getElementById("answerHeading").innerHTML = "The decision is: " + winner;
    document.getElementById("answerHeading").removeAttribute("hidden");
  }
  document.getElementById("decisionButton").setAttribute("hidden", "");
  hideLineBreaks(headerToOptionsBR);
  showLineBreaks(tryAgainBr);
  showLineBreaks(tryNewMethodButton);
}

/* gets the dictionary entry on the server corresponding to this iteration of the program
inputs: idNumber(int): the session ID for finding the dictionary entry
*/
function getSessionData(idNumber){
  var request = new XMLHttpRequest();
  let requestURL = "/dataComm/findSession"
  request.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      // Typical action to be performed when the document is ready:
      let sessionData = JSON.parse(request.responseText);
      groupQuestion = sessionData['Question'];
      decisionAlgorithm = sessionData['Algorithm'];
      allowRejects = sessionData['Rejects'];
      sessionState = sessionData['State'];
      ideaArray = sessionData['Ideas'];
      voteArray = sessionData['Votes'];
      scores = sessionData['Scores'];
      winner = sessionData['Winner'];
      console.log('Session Data Received')
    } else { // The session doesn't exist
      // TODO Make an error landing page
      groupQuestion = "Try typing your link again. This one doesn't seem to be working!"
      decisionAlgorithm = 0;
    }
  };
  /* Currently using a synchronous HTTP request because a response is needed
  before submitting form and moving to next page.
  TO DO: re-factor the page to perform this asynchronously
  */
  request.open("POST", requestURL, false);
  request.send(idNumber);
}

/* post an idea to the server */
function postIdea(){
  let newItemValue = document.getElementById("ideaFormIdea").value;
  if (newItemValue != ""){
  // prep http request
  var request = new XMLHttpRequest();
  let requestURL = "/dataComm/newIdea"
  request.open("POST", requestURL);
  request.onreadystatechange = function () {
    // reload to get most recent state of the session
    window.location.reload();
  }
  request.onerror = function () {
    console.log('A post error is happening')
  }
  let requestString = JSON.stringify({id: questionID, idea: newItemValue});
  request.send(requestString);
}
}

/* changes the state of the program to indicate that ideation is complete */
function postEndIdeation(){
  var request = new XMLHttpRequest();
  let requestURL = "/dataComm/endIdeation"
  request.open("POST", requestURL);
  request.onreadystatechange = function () {
    // reload to get most recent state of the session
    window.location.reload();
  }
  request.onerror = function () {
    console.log('A post error is happening')
  }
  request.send(questionID);
}

/* tells the server to return to the ideation state and deletes all ideas */
function postResetIdeation(){
  var request = new XMLHttpRequest();
  let requestURL = "/dataComm/resetIdeas"
  request.open("POST", requestURL);
  request.onreadystatechange = function () {
    // reload to get most recent state of the session
    window.location.reload();
  }
  request.onerror = function () {
    console.log('A post error is happening')
  }
  request.send(questionID);
}

/* post a vote to the server */
function postNewVote(){
  if (document.getElementById("voteFormName").value.trim() !== "") {
    let newVote = {};
    newVote.name = document.getElementById("voteFormName").value.trim();
    document.getElementById("voteFormName").value = "";
    newVote.firstVote = document.getElementById("voteFirstSelection").value;
    document.getElementById("voteFirstSelection").value="random";
    newVote.secondVote = document.getElementById("voteSecondSelection").value;
    document.getElementById("voteSecondSelection").value="random";
    newVote.thirdVote = document.getElementById("voteThirdSelection").value;
    document.getElementById("voteThirdSelection").value="random";
    newVote.noVote = document.getElementById("voteNo").value;
    document.getElementById("voteNo").value="No";

    // set up request
    var request = new XMLHttpRequest();
    let requestURL = "/dataComm/newVote"
    request.open("POST", requestURL);
    request.onreadystatechange = function () {
      // reload to get most recent state of the session
      window.location.reload();
    }
    request.onerror = function () {
      console.log('A post error is happening')
    }
    let requestString = JSON.stringify({id: questionID, vote: newVote});
    request.send(requestString);
  }
}

/* resets the voting so that everyone can re-vote */
function postResetVoting() {
  var request = new XMLHttpRequest();
  let requestURL = "/dataComm/resetVotes"
  request.open("POST", requestURL);
  request.onreadystatechange = function () {
    // reload to get most recent state of the session
    window.location.reload();
  }
  request.onerror = function () {
    console.log('A post error is happening')
  }
  request.send(questionID);
}


/* changes the state of the program to indicate that voting is complete */
function postEndVoting(){
  var request = new XMLHttpRequest();
  let requestURL = "/dataComm/endVoting"
  request.open("POST", requestURL);
  request.onreadystatechange = function () {
    postVotingResults() //
    // reload to get most recent state of the session
    window.location.reload();
  }
  request.onerror = function () {
    console.log('A post error is happening')
  }
  request.send(questionID);
}

/* gets the final results for the vote */
function postVotingResults(){
  var request = new XMLHttpRequest();
  let requestURL = "/dataComm/declareWinner"
  request.open("POST", requestURL);
  request.onreadystatechange = function () {
    // reload to get most recent state of the session
    window.location.reload();
  }
  request.onerror = function () {
    console.log('A post error is happening')
  }
  request.send(questionID);
}

function addIdea(newValue = ""){
  let currentList = document.getElementById("currentIdeas").innerHTML;
  let newItem = "<li>" + newValue; // + "<li>";
  document.getElementById("currentIdeas").innerHTML= currentList + newItem;
  document.getElementById("ideaFormIdea").value = "";
  document.getElementById("listHeader").removeAttribute("hidden");
  document.getElementById("ideaButton1").removeAttribute("hidden");
  document.getElementById("resetButton").removeAttribute("hidden");
  document.getElementById("currentIdeas").removeAttribute("hidden");
}

function afterIdeationActions(previousState){
  // Updates the DOM to be ready for voting
  document.getElementById("ideaForm").setAttribute("hidden", 1);
  document.getElementById("ideaButton1").setAttribute("hidden", 1);
  document.getElementById("listHeader").innerHTML="Our Options Are:";
  document.getElementById("questionExplanation").setAttribute("hidden", 1);
  if (decisionAlgorithm == 0) {
    document.getElementById("decisionButton").removeAttribute("hidden");
  } else {
    document.getElementById("voteForm").removeAttribute("hidden");
    document.getElementById("voteButton").removeAttribute("hidden");
    document.getElementById("endVoteButton").removeAttribute("hidden");
    document.getElementById("restartVotingButton").removeAttribute("hidden");
    document.getElementById("currentVoters").removeAttribute("hidden");
    if (decisionAlgorithm == 1) {
      document.getElementById("voteSecondSelection").setAttribute("hidden", "");
      document.getElementById("secondVoteLabel").setAttribute("hidden", "");
      document.getElementById("voteThirdSelection").setAttribute("hidden", "");
      document.getElementById("thirdVoteLabel").setAttribute("hidden", "");
      hideLineBreaks(voteTwoSpace);
      hideLineBreaks(voteThreeSpace);
    } else { // for reseting votes with different Algorithm
      document.getElementById("voteSecondSelection").removeAttribute("hidden");
      document.getElementById("secondVoteLabel").removeAttribute("hidden");
      document.getElementById("voteThirdSelection").removeAttribute("hidden");
      document.getElementById("thirdVoteLabel").removeAttribute("hidden");
      showLineBreaks(voteTwoSpace);
      showLineBreaks(voteThreeSpace);
    }
    if (allowRejects != 1) {
      voteNoSpace[0].setAttribute("hidden", "");
      voteNoSpace[1].setAttribute("hidden", "");
      document.getElementById("voteNoLabel").setAttribute("hidden", "");
      document.getElementById("voteNo").setAttribute("hidden", "");
    }
  }
  if (previousState == 0) {
    prepareVoting();
  }
  if (ideaArray.length < 3) {
    document.getElementById("voteThirdSelection").setAttribute("hidden","");
    document.getElementById("thirdVoteLabel").setAttribute("hidden","");
    hideLineBreaks(voteThreeSpace);
  }
}

function prepareVoting(){
  // This is used by 'afterIdeationActions()'
  // not needed for Algorithm 1, but action performed in case re-vote
  // used in decisionAlgorithm == 1 or 2
  ideaArray = removeDuplicates(ideaArray);
  addDropDownOptions(document.getElementById("voteFirstSelection"));
  addDropDownOptions(document.getElementById("voteSecondSelection"));
  addDropDownOptions(document.getElementById("voteThirdSelection"));
  addDropDownOptions(document.getElementById("voteNo"));
  document.getElementById("voteFirstSelection").addEventListener("change", updateOptions);
  document.getElementById("voteSecondSelection").addEventListener("change", updateOptions);
  document.getElementById("voteThirdSelection").addEventListener("change", updateOptions);
}

function hideLineBreaks(brID){
  for (let brInd = 0; brInd < brID.length; brInd++){
    brID[brInd].setAttribute("hidden","");
  }
}

function showLineBreaks(brID){
  for (let brInd = 0; brInd < brID.length; brInd++){
    brID[brInd].removeAttribute("hidden");
  }
}

function updateOptions(event) {
  let currentFirst = document.getElementById("voteFirstSelection").value;
  let currentSecond = document.getElementById("voteSecondSelection").value;
  let currentThird = document.getElementById("voteThirdSelection").value;
  console.log(currentFirst,currentSecond,currentThird)
  if (currentFirst != oldFirst){
    if (currentSecond == currentFirst) {
      document.getElementById("voteSecondSelection").value = "random";
      currentSecond = "random";
    }
    if (currentThird == currentFirst){
      document.getElementById("voteThirdSelection").value = "random";
      currentThird = "random";
    }
    oldFirst = currentFirst;
  } else if (currentSecond != oldSecond) {
    if (currentFirst == currentSecond) {
      document.getElementById("voteFirstSelection").value = "random";
      currentFirst = "random";
    }
    if (currentThird == currentSecond){
      document.getElementById("voteThirdSelection").value = "random";
      currentThird = "random";
    }
  } else if (currentThird != oldThird) {
    if (currentFirst == currentThird) {
      document.getElementById("voteFirstSelection").value = "random";
      currentFirst = "random";
    }
    if (currentSecond == currentThird){
      document.getElementById("voteSecondSelection").value = "random";
      currentSecond = "random";
    }
  }
  oldFirst = currentFirst;
  oldSecond = currentSecond;
  oldThird = currentThird;
}

function addDropDownOptions(dropDownObject){
  for (let voteChoiceInd = 0; voteChoiceInd < ideaArray.length; voteChoiceInd++){
    let additionalIdea = document.createElement("option");
    additionalIdea.text = ideaArray[voteChoiceInd];
    additionalIdea.value = ideaArray[voteChoiceInd];
    additionalIdea.id = ideaArray[voteChoiceInd];
    dropDownObject.appendChild(additionalIdea);
  }
}

function removeDuplicates(arrayInitial){
  let arrayNoDuplicates =[];
  for (let arrayIndex = 0; arrayIndex < arrayInitial.length; arrayIndex++) {
    // check if current value is in new array. If not, add it.
    if (arrayNoDuplicates.indexOf(arrayInitial[arrayIndex]) == -1){
      arrayNoDuplicates.push(arrayInitial[arrayIndex])
    };
  };
  return arrayNoDuplicates;
}

function addToVoterList(newVote){
  // update the voter list in the DOM
  document.getElementById("voterListHeader").removeAttribute("hidden");
  let currentVoterList = document.getElementById("currentVoters").innerHTML;
  let newVoter = "<li>" + newVote.name + "</li>";
  document.getElementById("currentVoters").innerHTML= currentVoterList + newVoter;
}

function endVoting() {
  document.getElementById("endVoteButton").setAttribute("hidden", "");
  document.getElementById("voteForm").setAttribute("hidden", "");
  document.getElementById("decisionButton").removeAttribute("hidden");
  document.getElementById("restartVotingButton").setAttribute("hidden","");
  if (showVotes == 1) {
    revealVotes();
  }
}

function showScores() {
  let scoreSumsArray = [];
  // populates the score sums array for ordering in result publishing
  for (let key in scores) {
    scoreSumsArray.push(scores[key]);
  }
  // orders the score
  scoreSumsArray.sort(function(a, b) {
    return b-a;
  });
  console.log("The score ordering array is: ")
  console.log(scoreSumsArray)
  // gets the names of the associated keys (the things voted on)
  let voteScorePairArray = Object.entries(scores);
  let orderedVoteArray = [];
  /* loop to populate the orderedVoteArray with the names of the places
  corresponding to the scores calculated. */
  for (let scoreIndex = 0; scoreIndex < scoreSumsArray.length; scoreIndex++) {
    /* loop to check the current score against the value pairs to find the name
    of the vote corresponding to the current score. */
    for (let pairIndex = 0; pairIndex < voteScorePairArray.length; pairIndex++){
      // if statement checks if current score matches in the pair
      if (scoreSumsArray[scoreIndex] == voteScorePairArray[pairIndex][1]) {
        /* if statement checks if an idea has already been added to the array.
        This avoids duplicate ideas in the case where multiple have the
        same number of votes */
        if (orderedVoteArray.indexOf(voteScorePairArray[pairIndex][0]) == -1){
          orderedVoteArray.push(voteScorePairArray[pairIndex][0]);
        }
      } // else no match and for loop iterates to next value/name pair
    }
  }
  console.log(orderedVoteArray);
  // updates the html
  document.getElementById("answerHeading").innerHTML = "The highest ranked choice is: " + orderedVoteArray[0];
  document.getElementById("answerHeading").removeAttribute("hidden");
  ideaListHTMLWithoutVotes = storeListItems("currentIdeas");
  clearListItems("currentIdeas");
  for (let showRankingIndex = 0; showRankingIndex < orderedVoteArray.length; showRankingIndex++) {
    let newLine = orderedVoteArray[showRankingIndex] + ": " + scores[orderedVoteArray[showRankingIndex]].toString() + " points";
    addListItem("currentIdeas", newLine)
  }
}

function storeListItems(listID) {
  return document.getElementById(listID).innerHTML;
}

function inputAllListItemsAtOnce(listID, htmlText) {
  document.getElementById(listID).innerHTML = htmlText;
}

function clearListItems(listID) {
  document.getElementById(listID).innerHTML=""; //clears list
}

function addListItem(listID, newItemText){
  let currentListItems = document.getElementById(listID).innerHTML;
  let newListItem = "<li>" + newItemText + "</li>";
  document.getElementById(listID).innerHTML= currentListItems + newListItem;
}

function revealVotes() {
  document.getElementById("currentVoters").innerHTML=""; //clears list
  for (let voteInd = 0; voteInd < voteArray.length; voteInd++){
    let currentVoteDisplay = document.getElementById("currentVoters").innerHTML;
    let newVote = "<li>" + voteArray[voteInd].name + ": " + voteArray[voteInd].firstVote + "</li>";
    document.getElementById("currentVoters").innerHTML= currentVoteDisplay + newVote;
  }
  if (decisionAlgorithm == 2){
    document.getElementById("voterListHeader").innerHTML="Here's everyone's top pick:";
  }
}

function restartVoting(){
  postResetVoting()
  document.getElementById("voterListHeader").setAttribute("hidden","");
  document.getElementById("currentVoters").innerHTML="";
}

function tryDifferentAlgorithm(newAlgorithmVariable){
  // remove the old decision
  document.getElementById("answerHeading").innerHTML="";
  document.getElementById("answerHeading").setAttribute("hidden", 1);
  // remove the buttons
  hideLineBreaks(tryAgainBr)
  hideLineBreaks(tryNewMethodButton);
  restartVoting(); // clears any leftover votes
  inputAllListItemsAtOnce("currentIdeas", ideaListHTMLWithoutVotes);

  // post to the server the reset
  let newItemValue = document.getElementById("ideaFormIdea").value;
  var request = new XMLHttpRequest();
  let requestURL = "/dataComm/tryNewAlgorithm"
  request.open("POST", requestURL);
  request.onreadystatechange = function () {
    // reload to get most recent state of the session
    window.location.reload();
  }
  request.onerror = function () {
    console.log('A post error is happening')
  }
  let requestString = JSON.stringify({id: questionID, algorithm: newAlgorithmVariable});
  request.send(requestString);

  afterIdeationActions(1);
}

function setEnterFunction(inputID, buttonID){
  document.getElementById(inputID).addEventListener("keypress", function(event) {
    if (event.keyCode === 13) {
      event.preventDefault();
      if (buttonID !=0) {
        document.getElementById(buttonID).click();
      }
    }
  });
}
