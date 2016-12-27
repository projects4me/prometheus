/* Licensing : http://legal.projects4.me/LICENSE.txt, please don't remove :) */
import Ember from "ember";
import _ from "lodash";

/**
  This method get the count of the votes cast for a conversation room


  @method countVotes
  @param model {CommentModel} The comment object
  @param search {String} The comment we are looking for
  @return count {Interger} The count of the comment with the search comment
  @todo Handle exception. If possible then make generic
*/
export function countVotes(params) {
  var voteCount = (_.countBy(params[0].getEach('comment'))[params[1]]);
  return (voteCount === undefined)?0:voteCount;
}

/**
  The object that provides the getWiki helper function

  @class CountVotesHelper
  @extends Ember.Helper.helper
  @author Hammad Hassan gollomer@gmail.com
*/
export default Ember.Helper.helper(countVotes);
