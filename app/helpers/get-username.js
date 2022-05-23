/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { helper } from '@ember/component/helper';

/**
 * This is a helper function that is used to retrieve the username from the url
 * of user's social link.
 *
 * @method getUsername
 * @param {String} socialMediaName Name of social platform
 * @param {String} socialLink The link of user's social platform
 * @return {String} userName The user's name
 * @private
 */
export function getUsername([socialMediaName, socialLink]/*, hash*/) {
    let userName = '';
    switch (socialMediaName) {
        case 'github':
            userName = extractUsername(socialLink);
            break;
        case 'skype':
            userName = extractSkypeUsername(socialLink);
            break;
        case 'linkedin':
            userName = extractUsername(socialLink);
            break;
        case 'gitlab':
            userName = extractUsername(socialLink);
            break;
        default:
            break;
    }

    return userName;
};

/**
 * This function extract username from a url and
 * returns that username.
 *
 * @method extractUsername
 * @param {String} socialLink The link of user's social platform
 * @return {String} userName The user's name
 * @private
 */
function extractUsername(socialLink) {
    socialLink = removeTrailingSlash(socialLink);
    let regex = new RegExp("[^/]*$");
    let username = regex.exec(socialLink);
    return username[0];
}

/**
 * This function extract username from a skype url. The regex
 * used in this function is especially for username extraction from
 * skype specific platform.
 *
 * @method extractUsername
 * @param {String} socialLink The link of user's social platform
 * @return {String} userName The user's name
 * @private
 */
function extractSkypeUsername(socialLink) {
    socialLink = removeTrailingSlash(socialLink);
    let regex = new RegExp("(skype)$|[^:]*$");
    let username = regex.exec(socialLink);
    return username[0];
}

/**
 * This function removes trailing slash from a social link.
 *
 * @method extractUsername
 * @param {String} socialLink The link of user's social platform
 * @return {String} userName The user's name
 * @private
 */
function removeTrailingSlash(socialLink) {
    if (typeof socialLink === "string") {
        return socialLink.replace(/(\/+$)/, '');
    }
}

export default helper(getUsername)