var express = require('express')
var router = express.Router()
var maxIDNumber =  1000

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
  console.log("next line is req.params")
  console.log(req.params)
  // Merge the DB data?
  // add information to DB
  // TODO

  console.log('New question session entered!')
  res.send('request posted')
})

module.exports = router
