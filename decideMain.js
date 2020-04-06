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

function algorithmZeroOptions() {
  document.getElementById("allowRejects").removeAttribute("checked");
  document.getElementById("showVotes").removeAttribute("checked");
  document.getElementById("allowRejects").setAttribute("disabled","");
  document.getElementById("showVotes").setAttribute("disabled","");
}

function algorithmOneOptions() {
  document.getElementById("allowRejects").removeAttribute("disabled");
  document.getElementById("showVotes").removeAttribute("disabled");
  document.getElementById("allowRejects").setAttribute("checked","");
  document.getElementById("showVotes").setAttribute("checked","");
}

function algorithmTwoOptions() {
  document.getElementById("allowRejects").removeAttribute("disabled");
  document.getElementById("showVotes").removeAttribute("disabled");
  document.getElementById("allowRejects").setAttribute("checked","");
  document.getElementById("showVotes").setAttribute("checked","");
}
