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
    let request = new XMLHttpRequest();
    requestURL = '/newID';
    request.open('GET', requestURL, true);
    request.responseType = 'json';

    request.onload = function() {
      // gets a new id_val
      id_val = request.response;
      console.log(id_val)
      console.log('hi')
    };

    request.send();

    console.log('id_val is:' + id_val)
    // make form data into an entry in the data


    // set the action to be going to the question page
    var form = document.getElementById('groupForm');
    form.action = "decideQuestion";
}

// function algorithmZeroOptions() {
//   document.getElementById("allowRejects").checked = false;
//   // document.getElementById("showVotes").checked = false;
//   // document.getElementById("allowRejects").setAttribute("disabled","");
//   // document.getElementById("showVotes").setAttribute("disabled","");
// }
//
// function algorithmOneOptions() {
//   document.getElementById("allowRejects").removeAttribute("disabled");
//   // document.getElementById("showVotes").removeAttribute("disabled");
//   document.getElementById("allowRejects").checked = true;
//   // document.getElementById("showVotes").checked = true;
// }
//
// function algorithmTwoOptions() {
//   document.getElementById("allowRejects").removeAttribute("disabled");
//   // document.getElementById("showVotes").removeAttribute("disabled");
//   document.getElementById("allowRejects").checked = true;
//   // document.getElementById("showVotes").checked = true;
// }
