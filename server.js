const express = require('express');
const app = express();
const path = require('path');
const router = express.Router();
const PORT = process.env.PORT || 3000;

router.get('/',function(req,res){
  res.sendFile(path.join(__dirname+'/decideMain.html'));
  //__dirname : It will resolve to your project folder.
});

router.get('/decideMainJS',function(req,res){
  res.sendFile(path.join(__dirname+'/decideMain.js'));
  //__dirname : It will resolve to your project folder.
});

router.get('/decideQuestion',function(req,res){
   res.sendFile(path.join(__dirname+'/decideQuestion.html'));
 });

 router.get('/decideQuestionJS',function(req,res){
    res.sendFile(path.join(__dirname+'/decideQuestion.js'));
  });
//
// router.get('/sitemap',function(req,res){
//   res.sendFile(path.join(__dirname+'/sitemap.html'));
// });

//add the router
app.use('/', router);
app.listen(PORT, () => {
    console.log(`Decide is running on port ${ PORT }`);
});

// console.log('Running at Port 3000 or ' + String(process.env.port));
