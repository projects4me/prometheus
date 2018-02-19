/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { helper } from '@ember/component/helper';
import { htmlSafe } from '@ember/string';

/**
 * This helper lets us translate the comment markup stored in the database.
 *
 * The current suuport is for `{{}}` mentions with the type user, `>. \n` for list
 * and `\n` converted to <br />
 *
 * No longer necessary as we are now using At.js
 *
 * @method translateComment
 * @param {String} data The comment
 * @return {String} translatedComment The translated comment
 * @todo Handle exception. If possible then make generic
 */
export function translateComment(params) {
    let data = params[0];

    if (data === null)
    {
        data = '';
    }

    /*
     // Find {{}}
     var str = data;
     var rex = new RegExp("{{.*?}}", "g"); // "g" for global
     var matchesArray = str.match(rex);
     var $link = '';
     for (var idx in matchesArray) {
     if (matchesArray.hasOwnProperty(idx)) {
     $link = matchesArray[idx];
     $link = JSON.parse($link.replace('{{','{').replace('}}','}'));

     // Create User link
     // @todo get module name from a registry
     if ($link.user !== undefined)
     {
     $link = '<a href="#/app/user/'+$link.id+'">'+$link.user+'</a>';
     }
     else {
     $link = '';
     }
     data = data.replace(matchesArray[idx],$link);
     }
     }

     // Handle list
     // $todo be able to handle mutiple list groups
     str = data;
     rex = new RegExp(">\..*?\n", "g"); // "g" for global
     matchesArray = str.match(rex);
     var $list = '';
     var $listGroup = '';
     if (matchesArray !== null)
     {
     for (idx in matchesArray) {
     if (matchesArray.hasOwnProperty(idx)) {
     $list = matchesArray[idx];
     $list = $list.replace('>. ','<li>').replace("\n","</li>");
     $listGroup += $list;
     data = data.replace(matchesArray[idx],$list);
     }
     }
     data = data.replace($listGroup,'<ul>'+$listGroup+'</ul>');
     }
     */

    // Handle end lines
    data = data.replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + '<br />' + '$2');

    return htmlSafe(data);
}

/**
 * The object that provides the getWiki helper function
 *
 * @class TranslateComment
 * @namespace Prometheus.Helpers
 * @extends Ember.Helper.helper
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default helper(translateComment);
