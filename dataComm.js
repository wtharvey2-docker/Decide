var express = require('express')
var router = express.Router()
const bodyParser = require('body-parser');
router.use(bodyParser.json());
router.use(bodyParser.text());

var maxIDNumber =  1000

AllSessionDictionary = {
  22: {Question: "What do you want to do?",
  Algorithm: '1',
  Rejects: '1',
  State: 'ideation',
  QuestionID: '333',
  Ideas: [],
  Votes: [],
  Winner: ""
},
  111: {Question: "What should we have to eat?",
  Algorithm: '1',
  Rejects: '1',
  State: 'ideation',
  QuestionID: '111'},
  222: {Question: "What game should we play?",
  Algorithm: '1',
  Rejects: '1',
  State: 'ideation',
  QuestionID: '222',
  Ideas: [],
  Votes: [],
  Winner: ""},
  333: {Question: "What should we watch?",
  Algorithm: '1',
  Rejects: '1',
  State: 'ideation',
  QuestionID: '333',
  Ideas: [],
  Votes: [],
  Winner: ""},
}

// get a unique ID number
router.get('/newID',(req, res) => {
  console.log('A new ID request!')
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
  console.log('sessionID is ' + req.body)

  // get data corresponding to ID from DB
  jsonFromDB = AllSessionDictionary[sessionID];
  console.log("what will be sent:")
  console.log(jsonFromDB)

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

  console.log('New question session entered!')
  console.log(AllSessionDictionary)
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
  console.log(newIdea)
  console.log(AllSessionDictionary[questID])
  for (ideaInd = 0; ideaInd < AllSessionDictionary[questID]["Ideas"].length; ideaInd++){
    if (newIdea == AllSessionDictionary[questID]['Ideas'][ideaInd]){
      ideaBool = 0;
    }
  }

  // Add the idea to the ideaArray
  if (ideaBool) {
    AllSessionDictionary[questID]['Ideas'].push(newIdea)
  }
  console.log(AllSessionDictionary[questID])
  console.log("Should be done")
  res.sendStatus(202)
})

// a post to end idea input
router.post('/endIdeation', function (req,res) {
  let sessionID = req.body
  if (AllSessionDictionary[sessionID]['Ideas'].length > 1) {
    AllSessionDictionary[sessionID]["State"] = "voting";
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
    AllSessionDictionary[sessionID]["State"] = "voting";
  }
  res.sendStatus(202)
  })

// post a message to reset ideation
router.post('/resetIdeas', function (req,res) {
  // TODO
})

// post a message to reset Voting
router.post('/resetVotes', function (req,res) {
  // TODO
})


module.exports = router
