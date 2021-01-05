var express = require('express')
var router = express.Router()
var maxIDNumber =  1000

// get the data for a session
router.get('/', function (req, res) {
  // get session ID number from req
  // TODO

  // get data corresponding to ID from DB
  // TODO

  jsonFromDB = {}
  res.json(jsonFromDB)
})

// post the db update
router.post('/', function (req, res) {
  // get information from req
  // TODO

  // Merge the DB data?
  // add information to DB
  // TODO

  res.send('request posted')
})

// get a unique ID number
router.get('/newID', function (req, res) {
  // get max id number and add 1
  maxIDNumber += 1;
  // return the id number
  newIDnumber = maxIDNumber;
  // res.responseType('text');
  res.json({ id: newIDnumber });
  // res.on('data', id_number => { id_number = newIDnumber; });
  res.sendStatus(200);
})

module.exports = router
