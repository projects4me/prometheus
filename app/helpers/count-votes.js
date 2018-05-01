/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import _ from "lodash";
import { helper } from '@ember/component/helper';

/**
 * This method get the count of the votes cast for a conversation room
 *
 * @method countVotes
 * @param {CommentModel} model The comment object
 * @param {String} search The comment we are looking for
 * @return {Integer} count The count of the comment with the search comment
 * @todo Handle exception. If possible then make generic
 */
export function countVotes(params) {
    var voteCount = (_.countBy(params[0].getEach('comment'))[params[1]]);
    return (voteCount === undefined)?0:voteCount;
}

/**
 * The object that provides the getWiki helper function
 *
 * @class CountVotes
 * @namespace Prometheus.Helpers
 * @extends Ember.Helper.helper
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default helper(countVotes);
