"use strict";

/* TO DO LIST:
- Add reject ability for algorithm 0
- Show what people voted for after decision
- Reset Voting w/ same algorithm
- Ranking Feature (Algorithm 2)
- Figure out how to make it acessible online 
// Begin User Testng Here
- Basic CSS styling
- Reset Voting w/ different algorithm
- Remove ability to rank same option in Alg 2
- Show the Random Number (Algorithm 0 & 1)

BUG LIST:
- Cannot hit enter to finish an input. Leads to an error.
- Duplicates remain for voting if cases are different (i.e. "A" and "a" do not
  get sorted into the same vote option)
-

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
let minimumOptionQuantity = 2; // 1 for testing, 2 for operations
let minimumVoteQuantity = 1; // not currently used

function processURL() {
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
    } else if (decisionAlgorithm == 1){
      document.getElementById("voteForm").removeAttribute("hidden");
      document.getElementById("voteButton").removeAttribute("hidden");
      document.getElementById("endVoteButton").removeAttribute("hidden");
      document.getElementById("voterListHeader").removeAttribute("hidden");
      document.getElementById("currentVoters").removeAttribute("hidden");
      document.getElementById("voteSecondSelection").setAttribute("hidden", "");
      document.getElementById("secondVoteLabel").setAttribute("hidden", "");
      document.getElementById("voteThirdSelection").setAttribute("hidden", "");
      document.getElementById("thirdVoteLabel").setAttribute("hidden", "");
      if (allowRejects != 1) {
        voteNoSpace[0].setAttribute("hidden", "");
        voteNoSpace[1].setAttribute("hidden", "");
        document.getElementById("voteNoLabel").setAttribute("hidden", "");
        document.getElementById("voteNo").setAttribute("hidden", "");
      }
      for (let brInd = 0; brInd < algorithmTwoBreaks.length; brInd++){
        algorithmTwoBreaks[brInd].setAttribute("hidden","");
      }
      prepareVoting();
    } else { // decisionAlgorithm == 2
      document.getElementById("voteForm").removeAttribute("hidden");
      document.getElementById("endVoteButton").removeAttribute("hidden");
      prepareVoting();
    };
  };
}

function prepareVoting(){
  if (decisionAlgorithm == 0) {
    console.log("This decision Algorithm should not have called this function.")
  } else if (decisionAlgorithm == 1) {
      ideaArray = removeDuplicates(ideaArray);
      addDropDownOptions(document.getElementById("voteFirstSelection"));
      addDropDownOptions(document.getElementById("voteSecondSelection"));
      addDropDownOptions(document.getElementById("voteThirdSelection"));
      addDropDownOptions(document.getElementById("voteNo"));
  } else {
      console.log("This decision Algorithm has not been implemented yet")
  };
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
  };
}

function calculateDecision(){
  /* TO DO:
  - case 2 where it calculates the highest ranking option
  */
  if (decisionAlgorithm == 2) {
    // TO DO
  } else {
    // decisionAlgorithm == 0 || decisionAlgorithm == 1
    let options = [];
    let allVotes = [];
    if (decisionAlgorithm == 1) {
      /* currently does random votes not including the noVotes
        then removes all votes for rejects and decides between the rest.
        TO DO: - Re-Work algorithm to make random choices among
        non-rejected options */
      [options, allVotes] = parseVotes(options, allVotes);
      if (options[0] == undefined) {
        //allVotes[0] will not be undefined as long as more than one option is available
        // all votes were rejected by someone else
        /* TO DO: display message saying all options were vetoed
         so vetoes were disregarded.*/
         options = ideaArray;
      }
    } else { // Algorithm 2
      options = ideaArray;
    }
    let decision = options[Math.floor(Math.random() * numberOfOptions)];
    document.getElementById("answerHeading").innerHTML = "The decision is: " + decision;
    document.getElementById("answerHeading").removeAttribute("hidden");
    document.getElementById("decisionButton").setAttribute("hidden", "");
  }
}

function parseVotes(options, allVotes){
  let noArray = [];
  for (let voteInd = 0; voteInd < voteArray.length; voteInd++) {
    if (voteArray[voteInd].noVote != "No") {
      noArray.push(voteArray[voteInd].noVote);
    }
    if (voteArray[voteInd].firstVote == "random") {
      options.push(assignRandomChoice(ideaArray, voteArray[voteInd].noVote));
    } else {
      options.push(voteArray[voteInd].firstVote);
    }
  }
  allVotes = allVotes.concat(options); //in case all values are vetoed once

  //loop removing all rejected choices
  for (let noInd = 0; noInd < options.length; noInd++) {
    if (noArray.indexOf(options[noInd]) != -1) {
      options.splice(noInd,1);
    }
  }
  return [options, allVotes];
}

function assignRandomChoice(ideas, noVote) {
  let remainingIdeas = [];
  if (noVote != "No") {
    let noIndex = ideas.indexOf("noVote");
    remainingIdeas += ideas.slice(0,noIndex);
    remainingIdeas = remainingIdeas.concat(ideas.slice(noIndex,))
  }
  return remainingIdeas[Math.floor(Math.random() * ideas.length)];
}

// function showVotes() {
//
// }
