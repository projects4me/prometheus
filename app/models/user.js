/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Model, { attr, belongsTo, hasMany } from '@ember-data/model';
import { imagePathToBase64 } from 'prometheus/utils/image-to-base64';
import * as dates from 'prometheus/utils/date';

/**
 * Eagerly fetch the default profile picture and cache it as a base64 data URI.
 */
let defaultProfilePicture = '/img/default.png';
imagePathToBase64('/img/default.png').then((base64) => {
    defaultProfilePicture = base64;
});

/**
 * Whether a profile picture is the placeholder a user gets before uploading one.
 *
 * @method isDefaultProfilePicture
 * @param {String} picture
 * @return {Boolean}
 */
export function isDefaultProfilePicture(picture) {
    return !picture || picture === defaultProfilePicture || picture.endsWith('/img/default.png');
}

/**
 * The user model
 *
 * @class User
 * @namespace Prometheus.Model
 * @extends DS.Model
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default class UserModel extends Model {

    /**
     * Email Address
     *
     * @property email
     * @type String
     * @for User
     * @private
     */
    @attr('string') email;

    /**
     * Profile picture of the user stored as a base64 encoded string.
     *
     * @property profilePicture
     * @type String
     * @for User
     * @private
     */
    @attr('string', { defaultValue: () => defaultProfilePicture }) profilePicture;

    /**
     * Status
     *
     * @property status
     * @type String
     * @for User
     * @private
     */
    @attr('string') status;

    /**
     * Account Status of user.
     *
     * @property accountStatus
     * @type String
     * @for User
     * @private
     */
    @attr('string') accountStatus;

    /**
     * The kind of account: `human` or `agent`.
     *
     * @property type
     * @type String
     * @for User
     * @private
     */
    @attr('string', { defaultValue: 'human' }) type;

    /**
     * User preferred language.
     *
     * @property language
     * @type String
     * @for User
     * @private
     */
    @attr('string', { defaultValue: "en" }) language;

    /**
     * User's timezone.
     *
     * @property timezone
     * @type String
     * @for User
     * @private
     */
    @attr('string', {
        defaultValue: () => {
            return dates.guessTimezone();
        }
    }) timezone;

    /**
     * Name
     *
     * @property name
     * @type String
     * @for User
     * @private
     */
    @attr('string') name;

    /**
     * Date on which the user was created
     *
     * @property dateCreated
     * @type String
     * @for User
     * @private
     */
    @attr('string') dateCreated;

    /**
     * Date on which the user was last modified
     *
     * @property dateModified
     * @type String
     * @for User
     * @private
     */
    @attr('string') dateModified;

    /**
     * Soft deletion flag
     *
     * @property deleted
     * @type String
     * @for User
     * @private
     */
    @attr('string') deleted;

    /**
     * Description
     *
     * @property description
     * @type String
     * @for User
     * @private
     */
    @attr('string') description;

    /**
     * User who created this user
     *
     * @property createdUser
     * @type String
     * @for User
     * @private
     */
    @attr('string') createdUser;

    /**
     * The name of the user who created this user.
     *
     * @property createdUserName
     * @type String
     * @for User
     * @private
     */    
    @attr('string') createdUserName;

    /**
     * User who modified this user
     *
     * @property modifiedUser
     * @type String
     * @for User
     * @private
     */
    @attr('string') modifiedUser;

    /**
     * The name of the user who modified this user.
     *
     * @property createdUserName
     * @type String
     * @for User
     * @private
     */    
    @attr('string') modifiedUserName;

    /**
     * Title of the user
     *
     * @property title
     * @type String
     * @for User
     * @private
     */
    @attr('string') title;

    /**
     * Date of birth of the user.
     *
     * @property dateOfBirth
     * @type String
     * @for User
     * @private
     */
    @attr('string') dateOfBirth;

    /**
     * Phone number of the user
     *
     * @property phone
     * @type String
     * @for User
     * @private
     */
    @attr('string') phone;

    /**
     * Github url of the User
     *
     * @property githubUrl
     * @type String
     * @for User
     * @private
     */
    @attr('string') githubUrl;

    /**
     * Skype url of the User
     *
     * @property skypeUrl
     * @type String
     * @for User
     * @private
     */
    @attr('string') skypeUrl;

    /**
     * Linkedin url of the User
     *
     * @property linkedinUrl
     * @type String
     * @for User
     * @private
     */
    @attr('string') linkedinUrl;

    /**
     * Gitlab url of the User
     *
     * @property gitlabUrl
     * @type String
     * @for User
     * @private
     */
    @attr('string') gitlabUrl;

    /**
     * Slack url of the User
     *
     * @property slackUrl
     * @type String
     * @for User
     * @private
     */
    @attr('string') slackUrl;

    /**
     * Date on which the user was last active
     *
     * @property lastActivityAt
     * @type String
     * @for User
     * @private
     */
    @attr('string') lastActivityAt;

    /**
     * Date on which the user was joined
     *
     * @property dateJoined
     * @type String
     * @for User
     * @private
     */
    @attr('string') dateJoined;

    /**
     * The users's dashboard
     *
     * @property dashboard
     * @type DashboardModel
     * @for User
     * @private
     */
    @belongsTo('dashboard', { async: true, inverse: null }) dashboard;

    /**
     * Open closed projects of user.
     *
     * @property openClosedProject
     * @type Useropenclosedproject
     * @for User
     * @private
     */
    @belongsTo('useropenclosedproject', { async: true, inverse: null }) openClosedProject;

    /**
     * Open closed issues of user.
     *
     * @property openClosedIssue
     * @type Useropenclosedissue
     * @for User
     * @private
     */
    @belongsTo('useropenclosedissue', { async: true, inverse: null }) openClosedIssue;

    /**
      * Total time spent by user on issues.
      *
      * @property timeSpent
      * @type Usertimespent
      * @for User
      * @private
      */
    @belongsTo('usertimespent', { async: true, inverse: null }) timeSpent;

    /**
     * Daily collaboration of user in application.
     *
     * @property collaboration
     * @type Usercollaboration
     * @for User
     * @private
     */
    @belongsTo('usercollaboration', { async: true, inverse: null }) collaboration;

    /**
     * These are the latest projects of user.
     *
     * @property latestProjects
     * @type Userlatestproject
     * @for User
     * @private
     */
    @hasMany('userlatestproject', { async: true, inverse: null }) latestProjects;

    /**
     * These are the latest issues of user.
     *
     * @property latestIssues
     * @type Userlatestissue
     * @for User
     * @private
     */
    @hasMany('userlatestissue', { async: true, inverse: null }) latestIssues;

    /**
     * These are the members whom worked most with the user.
     *
     * @property mostWorkedMembers
     * @type Userworkmostwith
     * @for User
     * @private
     */
    @hasMany('userworkmostwith', { async: true, inverse: null }) mostWorkedMembers;

    /**
     * These are the recent activities of the user.
     *
     * @property recentActivities
     * @type Userecentactivity
     * @for User
     * @private
     */
    @hasMany('userecentactivity', { async: true, inverse: null }) recentActivities;

    /**
     * These are the tag relationship entries
     *
     * @property tagged
     * @type TaggedModel
     * @for User
     * @private
     */
    @hasMany('tagged', { async: true, inverse: null }) tagged;

    /**
     * These are the user projects
     *
     * @property projects
     * @type ProjectModel
     * @for User
     * @private
     */
    @hasMany('project', { async: true, inverse: 'members' }) projects;

    /**
     * These are the badges earned by user.
     *
     * @property badges
     * @type BadgeModel
     * @for User
     * @private
     */
    @hasMany('badge', { async: true, inverse: 'user' }) badges;

    /**
     * These are the user acl permissions.
     * 
     * @property aclPermissions
     * @type UserpermissionModel
     * @for User
     * @private
     */
    @hasMany('userpermission', { async: false, inverse: null }) aclPermissions;

    /**
     * These are the level of each badge, earned by user.
     *
     * @property badgeLevels
     * @type BadgelevelModel
     * @for User
     * @private
     */
    @hasMany('badgelevel', { async: true, inverse: null }) badgeLevels;

    /**
     * Skills associated with this user.
     *
     * @property skills
     * @type {Prometheus.Models.Userskill}
     * @for User
     * @private
     */
    @hasMany('userskill', { async: true, inverse: 'user' }) skills;

    /**
     * External identities (provider, handle, ...) of this user or agent.
     *
     * @property identities
     * @type {Prometheus.Models.Useridentity}
     * @for User
     * @private
     */
    @hasMany('useridentity', { async: true, inverse: 'user' }) identities;

    /**
     * Qualification entries (education or certification) for this user.
     *
     * @property qualifications
     * @type {Prometheus.Models.Userqualification}
     * @for User
     * @private
     */
    @hasMany('userqualification', { async: true, inverse: 'user' }) qualifications;

    /**
     * This computed property is used in order to prepare an array of 
     * objects containing the badge on behalf of its badge level. So it's
     * easier for us to render the badge information in the user profile 
     * template.
     *
     * @property badgeDetails
     * @type Array
     * @for User
     * @private
     */
    get badgeDetails() {
        let array = [];
        this.badges.forEach((badge) => {
            let badgeLevel = this.badgeLevels.find((item) => item.badgeId === badge.id);
            let badgeInfo = {
                'badge': badge,
                'badgeLevel': badgeLevel
            }
            array.push(badgeInfo);
        });
        return array;
    }

}