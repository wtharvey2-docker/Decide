const express = require('express');
const app = express();
const path = require('path');
const router = express.Router();
const PORT = process.env.PORT || 3000;

var dataComm = require('./dataComm.js')
app.use('/dataComm', dataComm)

app.get('/',function(req,res){
  res.sendFile(path.join(__dirname+'/decideMain.html'));
  //__dirname : It will resolve to your project folder.
});

app.get('/decideMainJS',function(req,res){
  res.sendFile(path.join(__dirname+'/decideMain.js'));
  //__dirname : It will resolve to your project folder.
});

app.all('/question/:id',function(req,res){
   res.sendFile(path.join(__dirname+'/decideQuestion.html'));
 });

app.get('/decideQuestionJS',function(req,res){
    res.sendFile(path.join(__dirname+'/decideQuestion.js'));
  });

// router.get('')
//
// router.get('/sitemap',function(req,res){
//   res.sendFile(path.join(__dirname+'/sitemap.html'));
// });

app.listen(PORT, () => {
    console.log(`Decide is running on port ${ PORT }`);
});
