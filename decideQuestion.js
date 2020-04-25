"use strict";

/* TO DO LIST:
- Ranking Feature (Algorithm 2)
  - make sure 2nd vote random and 3rd vote random don't repeat previous votes in parseVotes()
- Reset Voting w/ different algorithm
- Update ReadMe with description and directions
// Begin User Testing Here
- Basic CSS styling
- Handle ties for winner in Alg 2
- Algorithm 1 & 2 better mitigation for when all votes are rejected
  - Alg 1 currently removes rejects right before selecting among votes
  - Alg 2 currently rejects by adding -6 points to rejected place
  - list all votes and all no's
  - check ideas remaining after all rejects removed
    - if no ideas remaining, TBD
    - if some remain, assign one of the remaining to each random vote
  - output final array
- Show the Random Number (Algorithm 0 & 1)
- Add unit tests

BUG LIST:
- Duplicates remain for voting if cases are different (i.e. "A" and "a" do not
  get sorted into the same vote option)
- Checking/Unchecking not consistent on decideMain

WISH LIST:
- Easier to Use/Navigate/Understand
- Aesthetic UI
*/

// Global Variables
let groupQuestion = "";
let decisionAlgorithm = "";
let showVotes = 0;
let allowRejects = 0;
let numberOfOptions = 0; // initializing for decisionAlgorithm
let numberOfVotes = 0;
let ideaArray = [];
let voteArray = [];
let scores = {};
let minimumOptionQuantity = 2; // 1 for testing, 2 for operations
let minimumVoteQuantity = 1; // not currently used

function processURL() {
  setEnterFunction("ideaFormIdea","ideaButton0");
  setEnterFunction("voteFormName", 0);
  // defining indices
  let groupQuestionIndex = document.URL.indexOf("groupQuestion=")
    + ("groupQuestion=").length;
  let groupQuestionIndexEnd = document.URL.indexOf("&", groupQuestionIndex);
  let decisionAlgorithmIndex = document.URL.indexOf("decisionAlgorithm=")
    + ("decisionAlgorithm=").length;
  let decisionAlgorithmIndexEnd = document.URL.indexOf("&", decisionAlgorithmIndex);
  let showVotesIndex = document.URL.indexOf("showVotes=") + ("showVotes=").length;
  let allowRejectIndex = document.URL.indexOf("allowRejects=") + ("allowRejects=").length;
  if (groupQuestionIndex == document.URL.length) {
    // debugging in case required field is lost for groupQuestion & decisionAlgorithm
    console.log("There's an error in that the main page information isn't being put in the URL")
  }

  // translating information from URL
  groupQuestion = document.URL.substring(groupQuestionIndex,
    groupQuestionIndexEnd).replace(/[+]/g, " ");
  if (decisionAlgorithmIndexEnd == -1) {
    decisionAlgorithm = document.URL.substring(decisionAlgorithmIndex);
  } else {
    decisionAlgorithm = document.URL.substring(decisionAlgorithmIndex,
      decisionAlgorithmIndexEnd);
  };

  // updating values if Vote Showing box is checked
  if (showVotesIndex > (("showVotes=").length -1)) {
    showVotes = 1;
  };
  if (allowRejectIndex > (("allowRejects=").length -1)) {
    allowRejects = 1;
  };
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
  console.log("The Question Input is: " + groupQuestion);
  console.log("decisionAlgorithm = " + decisionAlgorithm);
  console.log("showVotes = " + showVotes);
  console.log("allowRejects = " + allowRejects);
  document.getElementById("questionHeading").innerHTML = groupQuestion
}

function addIdea(){
  let currentList = document.getElementById("currentIdeas").innerHTML;
  let newItem = "<li>" + document.getElementById("ideaFormIdea").value + "</li>";
  let newItemValue = document.getElementById("ideaFormIdea").value;
  if (newItem !== "<li></li>" && ideaArray.indexOf(newItemValue) == -1){
    // TO DO: Message Saying that this idea is empty or already present
    numberOfOptions += 1;
    ideaArray.push(newItemValue);
    document.getElementById("currentIdeas").innerHTML= currentList + newItem;
    document.getElementById("ideaFormIdea").value = "";
    document.getElementById("listHeader").removeAttribute("hidden");
    document.getElementById("ideaButton1").removeAttribute("hidden");
    document.getElementById("resetButton").removeAttribute("hidden");
    document.getElementById("currentIdeas").removeAttribute("hidden");
  };
}

function resetIdeas(){
  window.location.reload();
}

function finishIdeation(){
  // TO DO: Message delcaring minimum # of options
  if (numberOfOptions >= minimumOptionQuantity) {
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
        hideLineBreaks(algorithmTwoBreaks);
      }
      if (allowRejects != 1) {
        voteNoSpace[0].setAttribute("hidden", "");
        voteNoSpace[1].setAttribute("hidden", "");
        document.getElementById("voteNoLabel").setAttribute("hidden", "");
        document.getElementById("voteNo").setAttribute("hidden", "");
      }
      prepareVoting();
    };
  };
}

function hideLineBreaks(brID){
  for (let brInd = 0; brInd < brID.length; brInd++){
    brID[brInd].setAttribute("hidden","");
  }
}

function prepareVoting(){
  if (decisionAlgorithm == 0) {
    console.log("This decision Algorithm should not have called this function.")
  } else {
      // decisionAlgorithm == 1 or 2
      ideaArray = removeDuplicates(ideaArray);
      addDropDownOptions(document.getElementById("voteFirstSelection"));
      addDropDownOptions(document.getElementById("voteSecondSelection"));
      addDropDownOptions(document.getElementById("voteThirdSelection"));
      addDropDownOptions(document.getElementById("voteNo"));
      document.getElementById("voteFirstSelection").addEventListener("change", updateOptions);
  };
}

function updateOptions(event) {
  // NOT CURRENTLY FUNCTIONAL
  // if (document.getElementById("voteFirstSelection").value != "random") {
  //   let valueToRemove = document.getElementById("voteFirstSelection").value
  //   document.getElementById("voteSecondSelection").removeChild(document.getElementById(valueToRemove))
  //   document.getElementById("voteThirdSelection").removeChild(document.getElementById(valueToRemove))
  // }  else if (document.getElementById("voteSecondSelection").value != "random") {
  //   let valueToRemove = document.getElementById("voteSecondSelection").value
  //   document.getElementById("voteFirstSelection").removeChild(document.getElementById(valueToRemove))
  //   document.getElementById("voteThirdSelection").removeChild(document.getElementById(valueToRemove))
  // }  else if (document.getElementById("voteThirdSelection").value != "random") {
  //   let valueToRemove = document.getElementById("voteThirdSelection").value
  //   document.getElementById("voteFirstSelection").removeChild(document.getElementById(valueToRemove))
  //   document.getElementById("voteSecondSelection").removeChild(document.getElementById(valueToRemove))
  // }
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

function enterVote(){
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
    voteArray.push(newVote);
    document.getElementById("voterListHeader").removeAttribute("hidden");
    let currentVoterList = document.getElementById("currentVoters").innerHTML;
    let newVoter = "<li>" + newVote.name + "</li>";
    document.getElementById("currentVoters").innerHTML= currentVoterList + newVoter;
    numberOfVotes++;
  }
}

function endVoting() {
  if (numberOfVotes > 0) {
    document.getElementById("endVoteButton").setAttribute("hidden", "");
    document.getElementById("voteForm").setAttribute("hidden", "");
    document.getElementById("decisionButton").removeAttribute("hidden");
    document.getElementById("restartVotingButton").setAttribute("hidden","");
    if (showVotes == 1) {
      revealVotes();
    }
  };
}

function calculateDecision(){
  let decision ="";
  if (decisionAlgorithm == 2) {
    // TO DO: IN PROGRESS
    let parsedVotes = parseVotes(voteArray);
    console.log(parsedVotes);
    scoreVotes(parsedVotes, ideaArray);
    console.log(scores);
    showScores(scores);
  } else {
    // decisionAlgorithm == 0 || decisionAlgorithm == 1
    let options = [];
    let allVotes = [];
    if (decisionAlgorithm == 1) {
      /* currently does random votes not including the noVotes
        then removes all votes for rejects and decides between the rest.
        TO DO: - Re-Work algorithm to make random choices among
        non-rejected options */
      [options, allVotes] = parseTopVotes(allVotes, voteArray);
      console.log(options);
      if (options[0] == undefined) {
        /*allVotes[0] will not be undefined as long as
          one or more votes weren't rejected.
        TO DO: - display message saying all options were vetoed
         so vetoes were disregarded. */
         console.log("All options were rejected, so allVotes was used.")
         options = allVotes;
      }
    } else { // Algorithm 0
      options = ideaArray;
    }
    decision = options[Math.floor(Math.random() * options.length)];
    document.getElementById("answerHeading").innerHTML = "The decision is: " + decision;
    document.getElementById("answerHeading").removeAttribute("hidden");
  }
  document.getElementById("decisionButton").setAttribute("hidden", "");
  hideLineBreaks(headerToOptionsBR);
}

function parseVotes(voteArray) {
  // TO DO: make sure random 2nd and random 3rd don't repeat previous vote
  let noArray = [];
  let firstVotes = [];
  let secondVotes = [];
  let thirdVotes = [];
  // for loop populating the arrays above
  for (let voteInd = 0; voteInd < voteArray.length; voteInd++) {
    if (voteArray[voteInd].noVote != "No") {
      noArray.push(voteArray[voteInd].noVote);
    }
    if (voteArray[voteInd].firstVote == "random") {
      firstVotes.push(assignRandomChoice(ideaArray, voteArray[voteInd].noVote));
    } else {
      firstVotes.push(voteArray[voteInd].firstVote);
    }
    if (voteArray[voteInd].secondVote == "random") {
      secondVotes.push(assignRandomChoice(ideaArray, voteArray[voteInd].noVote));
    } else {
      secondVotes.push(voteArray[voteInd].secondVote);
    }
    if (voteArray[voteInd].thirdVote == "random") {
      thirdVotes.push(assignRandomChoice(ideaArray, voteArray[voteInd].noVote));
    } else {
      thirdVotes.push(voteArray[voteInd].thirdVote);
    }
  }
  return [firstVotes, secondVotes, thirdVotes, noArray];
}

function scoreVotes(fullVotesArray, allIdeas) {
  // populates scores with all the possible options
  for (let ideaInd = 0; ideaInd < allIdeas.length; ideaInd++) {
    scores[allIdeas[ideaInd]] = 0;
  }
  // Sum the scores from the first, second and third votes in scores
  for (let scoreInd = 0; scoreInd < fullVotesArray[0].length; scoreInd++) {
    scores[fullVotesArray[0][scoreInd]] += 4;
    scores[fullVotesArray[1][scoreInd]] += 2;
    scores[fullVotesArray[2][scoreInd]] += 1;
    scores[fullVotesArray[3][scoreInd]] -= 6;
  }
  return scores;
}

function showScores(voteScores) {
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
  clearListItems("currentIdeas");
  for (let showRankingIndex = 0; showRankingIndex < orderedVoteArray.length; showRankingIndex++) {
    let newLine = orderedVoteArray[showRankingIndex] + ": " + scores[orderedVoteArray[showRankingIndex]].toString() + " points";
    addListItem("currentIdeas", newLine)
  }
}

function clearListItems(listID) {
    document.getElementById(listID).innerHTML=""; //clears list
}

function addListItem(listID, newItemText){
  let currentListItems = document.getElementById(listID).innerHTML;
  let newListItem = "<li>" + newItemText + "</li>";
  document.getElementById(listID).innerHTML= currentListItems + newListItem;
}

function parseTopVotes(allVotes, voteArray){
  let noArray = [];
  let newOptions  =[];
  let initialOptions = [];
  for (let voteInd = 0; voteInd < voteArray.length; voteInd++) {
    if (voteArray[voteInd].noVote != "No") {
      noArray.push(voteArray[voteInd].noVote);
    }
    if (voteArray[voteInd].firstVote == "random") {
      initialOptions.push(assignRandomChoice(ideaArray, voteArray[voteInd].noVote));
    } else {
      initialOptions.push(voteArray[voteInd].firstVote);
    }
  }
  // allVotes is an array of all the top votes
  allVotes = allVotes.concat(initialOptions);
  //loop removing all rejected choices
  for (let noInd = 0; noInd < initialOptions.length; noInd++) {
    if (noArray.indexOf(initialOptions[noInd]) == -1) {
      newOptions = newOptions.concat(initialOptions[noInd]);
    }
  }
  return [newOptions, allVotes];
}

function assignRandomChoice(ideas, noVote) {
  let remainingIdeas = [];
  if (noVote != "No") {
    let noIndex = ideas.indexOf(noVote);
    if (noIndex != 0) {
      remainingIdeas = remainingIdeas.concat(ideas.slice(0,noIndex));
    }
    remainingIdeas = remainingIdeas.concat(ideas.slice(noIndex+1))
  } else {
    remainingIdeas = remainingIdeas.concat(ideas);
  }
  return remainingIdeas[Math.floor(Math.random() * remainingIdeas.length)];
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
  voteArray = [];
  document.getElementById("voterListHeader").setAttribute("hidden","");
  document.getElementById("currentVoters").innerHTML="";
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
