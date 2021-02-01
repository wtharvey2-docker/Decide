var express = require('express')
var router = express.Router()
const bodyParser = require('body-parser');
router.use(bodyParser.json());
router.use(bodyParser.text());
let debug = 0;
var maxIDNumber =  1000

AllSessionDictionary = {
  22: {Question: "What do you want to do?",
  Algorithm: '1',
  Rejects: '1',
  State: 'ideation',
  QuestionID: '333',
  Ideas: [],
  Votes: [],
  Scores: {},
  Winner: ""},
  21: {Question: "What do you want to do?",
  Algorithm: '0',
  Rejects: '1',
  State: 'ideation',
  QuestionID: '333',
  Ideas: [],
  Votes: [],
  Scores: {},
  Winner: ""},
  23: {Question: "What do you want to do?",
  Algorithm: '2',
  Rejects: '1',
  State: 'ideation',
  QuestionID: '333',
  Ideas: [],
  Votes: [],
  Scores: {},
  Winner: ""},
  111: {Question: "What should we have to eat?",
  Algorithm: '1',
  Rejects: '1',
  State: 'ideation',
  QuestionID: '111',
  Ideas: [],
  Votes: [],
  Scores: {},
  Winner: ""},
  222: {Question: "What game should we play?",
  Algorithm: '1',
  Rejects: '1',
  State: 'ideation',
  QuestionID: '222',
  Ideas: [],
  Votes: [],
  Scores: {},
  Winner: ""},
  333: {Question: "What should we watch?",
  Algorithm: '1',
  Rejects: '1',
  State: 'ideation',
  QuestionID: '333',
  Ideas: [],
  Votes: [],
  Scores: {},
  Winner: ""},
}

// get a unique ID number
router.get('/newID',(req, res) => {
  // get max id number and add 1
  maxIDNumber += 1;
  // return the id number
  newIDnumber = String(maxIDNumber);
  // res.send(newIDnumber);
  // res.json({ 'id_num': String(newIDnumber)});
  res.status(200).send(newIDnumber)
})

// get the data for a session
router.post('/findSession', function (req, res) {
  // get session ID number from req
  sessionID = req.body

  // get data corresponding to ID from DB
  jsonFromDB = AllSessionDictionary[sessionID];
  if (debug) {
    console.log("findSession request received. Current session data is: ")
    console.log(jsonFromDB)
  }

  // sending it
  if (typeof jsonFromDB !== 'undefined'){
    res.json(jsonFromDB)
  } else {// that data entry doesn't exist
    res.sendStatus(404)
  }
})

// post the db update
router.post('/', function (req, res) {
  // get information from req
  newSessionInfo = req.body

  // To Do: Implement database
  // add information to DB
  AllSessionDictionary[newSessionInfo['QuestionID']] = newSessionInfo;

  res.send('request posted')
})

// post a new idea
router.post('/newIdea', function (req,res) {
  let postJSON = JSON.parse(req.body)
  let questID = postJSON["id"];
  let newIdea = postJSON["idea"];
  // Check that the idea doesn't already exist
  var ideaInd;
  let ideaBool = 1;
  for (ideaInd = 0; ideaInd < AllSessionDictionary[questID]["Ideas"].length; ideaInd++){
    if (newIdea == AllSessionDictionary[questID]['Ideas'][ideaInd]){
      ideaBool = 0;
    }
  }

  // Add the idea to the ideaArray
  if (ideaBool) {
    AllSessionDictionary[questID]['Ideas'].push(newIdea)
  }
  res.sendStatus(202)
})

// a post to end idea input
router.post('/endIdeation', function (req,res) {
  let sessionID = req.body
  if (AllSessionDictionary[sessionID]['Ideas'].length > 1) {
    if (AllSessionDictionary[sessionID]['Algorithm'] == '0'){
      calculateDecision(sessionID); // calculates decision since it's just random
      AllSessionDictionary[sessionID]["State"] = "result";
    } else {
      AllSessionDictionary[sessionID]["State"] = "voting";
    }
  }
  res.sendStatus(202)
})

// post a new vote
router.post('/newVote', function (req,res) {
  let voteJSON = JSON.parse(req.body)
  let questID = voteJSON["id"];
  let newVote = voteJSON["vote"];
  AllSessionDictionary[questID]["Votes"].push(newVote)
  res.sendStatus(202)
})

// post a message to end idea input
router.post('/endVoting', function (req,res) {
  let sessionID = req.body
  if (AllSessionDictionary[sessionID]['Votes'].length > 0) {
    AllSessionDictionary[sessionID]["State"] = "result";
  }
  res.sendStatus(202)
  })

// post a message to reset ideation
router.post('/resetIdeas', function (req,res) {
  let sessionID = req.body
  AllSessionDictionary[sessionID]['Ideas'] = []
  AllSessionDictionary[sessionID]['Votes'] = []
  AllSessionDictionary[sessionID]['Scores'] = {}
  AllSessionDictionary[sessionID]['Winner'] = ""
  AllSessionDictionary[sessionID]['State'] = 'ideation'
  res.sendStatus(202)
})

// post a message to reset voting
router.post('/resetVotes', function (req,res) {
  let sessionID = req.body
  AllSessionDictionary[sessionID]['Votes'] = []
  AllSessionDictionary[sessionID]['Scores'] = {}
  AllSessionDictionary[sessionID]['Winner'] = ""
  AllSessionDictionary[sessionID]['State'] = 'voting'
  res.sendStatus(202)
})

// a post that gets the winner of a session
router.post('/declareWinner', function (req,res) {
  let sessionID = req.body
  if (AllSessionDictionary[sessionID]['Winner'] == ""){
    if (AllSessionDictionary[sessionID]['Algorithm'] > 0 && AllSessionDictionary[sessionID]['Votes'].length < 1){
      console.log("A declareWinner request was received when no votes were present. Nothing was done.")
    } else {
    // calculate which option won
    calculateDecision(sessionID)
    console.log("The end results of a session were: ")
    console.log(AllSessionDictionary[sessionID]);
    }
  }
  // Winner already known otherwise
  res.sendStatus(202)
})

router.post('/tryNewAlgorithm', function (req,res) {
  let voteJSON = JSON.parse(req.body)
  let questID = voteJSON["id"];

  //
  console.log(AllSessionDictionary[questID]);
  console.log("Session " + String(questID) + " requested a new algorithm. " +
    "They requested Algorithm " + String(voteJSON["algorithm"]) + ".");

  AllSessionDictionary[questID]["Algorithm"] = voteJSON["algorithm"];
  if (voteJSON["algorithm"] == "0") {
    calculateDecision(sessionID); // calculates decision since it's just random
    AllSessionDictionary[sessionID]["State"] = "result"
  } else {
    AllSessionDictionary[sessionID]["State"] = "voting";
  }
  res.sendStatus(202)
})

module.exports = router

function calculateDecision(sessionID){
  let decision ="";
  let decisionAlgorithm = AllSessionDictionary[sessionID]['Algorithm']
  let ideaArray = AllSessionDictionary[sessionID]['Ideas']
  if (decisionAlgorithm == 2) {
    let parsedVotes = parseVotes(AllSessionDictionary[sessionID]['Votes']);
    let scores = scoreVotes(parsedVotes, ideaArray);
    AllSessionDictionary[sessionID]['Scores'] = scores
  } else {
    // decisionAlgorithm == 0 || decisionAlgorithm == 1
    let options = [];
    let allVotes = [];
    if (decisionAlgorithm == 1) {
      /* currently does random votes not including the noVotes
      then removes all votes for rejects and decides between the rest.
      TO DO: - Re-Work algorithm to make random choices among
      non-rejected options */
      [options, allVotes] = parseTopVotes(AllSessionDictionary[sessionID]['Votes']);
      if (options[0] == undefined) {
        /*allVotes[0] will not be undefined as long as
        one or more votes weren't rejected.
        TO DO: - display message saying all options were vetoed
        so vetoes were disregarded. */
        options = allVotes;
      }
    } else { // Algorithm 0
      options = ideaArray;
    }
    AllSessionDictionary[sessionID]['Winner'] = options[Math.floor(Math.random() * options.length)];
    AllSessionDictionary[sessionID]['State'] = "result"; // a redundant state change
  }
}

function parseVotes(voteArray) {
  // Parses the votes into arrays within a list organized by vote ranking
  // TO DO: make sure random 2nd and random 3rd don't repeat previous vote
  let noArray = [];
  let firstVotes = [];
  let secondVotes = [];
  let thirdVotes = [];
  let ideaArray = AllSessionDictionary[sessionID]['Ideas']

  // Loop to populate the noArray
  for (let voteInd = 0; voteInd < voteArray.length; voteInd++) {
    if (voteArray[voteInd].noVote != "No") {
      noArray.push(voteArray[voteInd].noVote);
    }
  }
  // Loop to populate the votes
  let randomVotesPerRank = [0,0,0];
  for (let voteInd = 0; voteInd < voteArray.length; voteInd++) {
    if (voteArray[voteInd].firstVote == "random") {
      randomVotesPerRank[0]++;
    } else {
      firstVotes.push(voteArray[voteInd].firstVote);
    }
    if (voteArray[voteInd].secondVote == "random") {
      randomVotesPerRank[1]++;
    } else {
      secondVotes.push(voteArray[voteInd].secondVote);
    }
    if (voteArray[voteInd].thirdVote == "random") {
      randomVotesPerRank[2]++;
    } else {
      thirdVotes.push(voteArray[voteInd].thirdVote);
    }
  }

  // Determine which options are ok for remainingOptions
  let randomPossibilities = firstVotes.concat(secondVotes, thirdVotes);

  // remove remove duplicates
  let uniqueRandomChoices = [...new Set(randomPossibilities)];

  // Remove vetoed options
  let remainingOptions=removeNoVotesFromList(uniqueRandomChoices, noArray);

  /* if no options are available from votes (everything got vetoed or no one had a preference),
  use the full ideaArray*/
  if (remainingOptions.length == 0) {
     remainingOptions = removeNoVotesFromList(ideaArray, noArray)
     // if all ideas were rejected at least once, just select from the randoms
     if (remainingOptions.length == 0){
       remainingOptions = ideaArray;
     }
  }

  // for loop to populate the random votes
  maxRandomCount = Math.max(randomVotesPerRank);
  for (let fillInd = 0; fillInd < maxRandomCount; fillInd++){
    // handle an additional first vote if necessary
    if (fillInd < randomVotesPerRank[0]){
      firstVotes.push(selectRandomIdea(remainingOptions));
    }
    // handle an additional second vote if necessary
    if (fillInd < randomVotesPerRank[1]){
      secondVotes.push(selectRandomIdea(remainingOptions));
    }
    // handle an additional third vote if necessary
    if (fillInd < randomVotesPerRank[2]){
      thirdVotes.push(selectRandomIdea(remainingOptions));
    }
  }
  return [firstVotes, secondVotes, thirdVotes, noArray];
}

function parseTopVotes(voteArray){
  let noArray = [];
  let newOptions  =[];
  let allVotes = [];
  let randomVoteCount = 0;
  let ideaArray = AllSessionDictionary[sessionID]['Ideas']

  // populate options based on voting
  for (let voteInd = 0; voteInd < voteArray.length; voteInd++) {
    // store a no value if an idea is rejected
    if (voteArray[voteInd].noVote != "No") {
      noArray.push(voteArray[voteInd].noVote);
    }
    // make note that a random choice needs to be added
    if (voteArray[voteInd].firstVote == "random") {
      randomVoteCount++;
    } else { //add a vote to the options list
      allVotes.push(voteArray[voteInd].firstVote);
    }
  }

  // Handle case where all voters expressed no preference
  if (allVotes.length == 0) {
    allVotes = ideaArray;
  }

  //remove all rejected choices
  let finalOptions = removeNoVotesFromList(allVotes, noArray);

  // handle if all options were rejected
  if (finalOptions.length == 0) {
    if (removeNoVotesFromList(ideaArray, noArray).length == 0) {
      // the all votes array is used
      finalOptions = allVotes;
    } else{
      finalOptions = ideaArray;
    }
  }
  // account for random Votes
  for (let randomInd = 0; randomInd < randomVoteCount; randomInd++ ){
    finalOptions.push(selectRandomIdea(finalOptions));
  }
  return [finalOptions, allVotes];
}

/* A function to exclude rejected votes from a list
Inputs:
  - a list of ideas
  - a list of no votes.
Outputs:
  - a list of ideas excluding the no votes
*/
function removeNoVotesFromList(initialOptions, noArray){
  let updatedOptions = []
  for (let noInd = 0; noInd < initialOptions.length; noInd++) {
    if (noArray.indexOf(initialOptions[noInd]) == -1) {
      updatedOptions = updatedOptions.concat(initialOptions[noInd]);
    }
  }
  return updatedOptions;
}


function selectRandomIdea(ideas) {
  // used to pick a random idea from the given array
  return ideas[Math.floor(Math.random() * ideas.length)];
}


function scoreVotes(fullVotesArray, allIdeas) {
  // populates scores with all the possible options
  let scores = {};
  for (let ideaInd = 0; ideaInd < allIdeas.length; ideaInd++) {
    scores[allIdeas[ideaInd]] = 0;
  }
  // Sum the scores from the first, second and third votes in scores
  for (let scoreInd = 0; scoreInd < fullVotesArray[0].length; scoreInd++) {
    scores[fullVotesArray[0][scoreInd]] += 4;
    scores[fullVotesArray[1][scoreInd]] += 2;
    if (allIdeas.length > 2) {
      scores[fullVotesArray[2][scoreInd]] += 1;
    }
    if (typeof scores[fullVotesArray[3][scoreInd]] !== 'undefined'){
      scores[fullVotesArray[3][scoreInd]] -= 6;
    }
  }
  return scores;
}
