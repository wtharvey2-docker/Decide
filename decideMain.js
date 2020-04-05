/* Decide Page */
// Made so that everyone has a voice and have an equal say in making a decision
// Everyone put the same effort of coming up with ideas and ranking
// No one has to be the bad guy when it comes to ruling things out


/* Store Everyone's Vote*/
function getUserVote(decisionOption){
  /* Decision options are:
  0 = Random decision of user generated ideas
  1 = Random decision of user generated picks
  2 = User-ranked decision of user generated picks
    // For Further Work:
  3 = Random decision of choices from an external source
  4 = User-ranked decision of choices from an external source
  5 = Program-ranked decision on external choices based on external ratings
  */

  // this function won't be called if decisionOption === 0
  if (decisionOption === 1) {
    return [name, voteOne, 0, 0, voteNo]
  } else if (decisionOption === 2) {
    return [name, voteOne, voteTwo, voteThree, voteNo]
  };
};
