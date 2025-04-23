/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Model, { attr, belongsTo, hasMany } from '@ember-data/model';
import { computed } from '@ember/object';

/**
 * The user model
 *
 * @class User
 * @namespace Prometheus.Model
 * @extends DS.Model
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default Model.extend({

    /**
     * Username
     *
     * @property username
     * @type String
     * @for User
     * @private
     */
    username: attr('string'),

    /**
     * Email Address
     *
     * @property email
     * @type String
     * @for User
     * @private
     */
    email: attr('string'),

    /**
     * Status
     *
     * @property status
     * @type String
     * @for User
     * @private
     */
    status: attr('string'),

    /**
     * Account Status of user.
     *
     * @property accountStatus
     * @type String
     * @for User
     * @private
     */
    accountStatus: attr('string'),

    /**
     * User preferred language.
     *
     * @property language
     * @type String
     * @for User
     * @private
     */
    language: attr('string', { defaultValue: "en" }),

    /**
     * User's timezone.
     *
     * @property timezone
     * @type String
     * @for User
     * @private
     */
    timezone: attr('string', {
        defaultValue: () => {
            return moment.tz.guess();
        }
    }),

    /**
     * Name
     *
     * @property name
     * @type String
     * @for User
     * @private
     */
    name: attr('string'),

    /**
     * Date on which the user was created
     *
     * @property dateCreated
     * @type String
     * @for User
     * @private
     */
    dateCreated: attr('string'),

    /**
     * Date on which the user was last modified
     *
     * @property dateModified
     * @type String
     * @for User
     * @private
     */
    dateModified: attr('string'),

    /**
     * Soft deletion flag
     *
     * @property deleted
     * @type String
     * @for User
     * @private
     */
    deleted: attr('string'),

    /**
     * Description
     *
     * @property description
     * @type String
     * @for User
     * @private
     */
    description: attr('string'),

    /**
     * User who created this user
     *
     * @property createdUser
     * @type String
     * @for User
     * @private
     */
    createdUser: attr('string'),

    /**
     * The name of the user who created this user.
     *
     * @property createdUserName
     * @type String
     * @for User
     * @private
     */    
    createdUserName: attr('string'),

    /**
     * User who modified this user
     *
     * @property modifiedUser
     * @type String
     * @for User
     * @private
     */
    modifiedUser: attr('string'),

    /**
     * The name of the user who modified this user.
     *
     * @property createdUserName
     * @type String
     * @for User
     * @private
     */    
    modifiedUserName: attr('string'),    

    /**
     * Title of the user
     *
     * @property title
     * @type String
     * @for User
     * @private
     */
    title: attr('string'),

    /**
     * Password of the user.
     *
     * @property password
     * @type String
     * @for User
     * @private
     */
    password: attr('string'),

    /**
     * Date of birth of the user.
     *
     * @property dateOfBirth
     * @type String
     * @for User
     * @private
     */
    dateOfBirth: attr('string'),

    /**
     * Phone number of the user
     *
     * @property phone
     * @type String
     * @for User
     * @private
     */
    phone: attr('string'),

    /**
     * A user's education
     *
     * @property education
     * @type String
     * @for User
     * @private
     */
    education: attr('string'),

    /**
     * Github url of the User
     *
     * @property githubUrl
     * @type String
     * @for User
     * @private
     */
    githubUrl: attr('string'),

    /**
     * Skype url of the User
     *
     * @property skypeUrl
     * @type String
     * @for User
     * @private
     */
    skypeUrl: attr('string'),

    /**
     * Linkedin url of the User
     *
     * @property linkedinUrl
     * @type String
     * @for User
     * @private
     */
    linkedinUrl: attr('string'),

    /**
     * Gitlab url of the User
     *
     * @property gitlabUrl
     * @type String
     * @for User
     * @private
     */
    gitlabUrl: attr('string'),

    /**
     * Slack url of the User
     *
     * @property slackUrl
     * @type String
     * @for User
     * @private
     */
    slackUrl: attr('string'),

    /**
    * Skills of the User
    *
    * @property skills
    * @type String
    * @for User
    * @private
    */
    skills: attr('string'),

    /**
     * The users's dashboard
     *
     * @property dashboard
     * @type DashboardModel
     * @for User
     * @private
     */
    dashboard: belongsTo('dashboard'),

    /**
     * Open closed projects of user.
     *
     * @property openClosedProject
     * @type Useropenclosedproject
     * @for User
     * @private
     */
    openClosedProject: belongsTo('useropenclosedproject'),

    /**
     * Open closed issues of user.
     *
     * @property openClosedIssue
     * @type Useropenclosedissue
     * @for User
     * @private
     */
    openClosedIssue: belongsTo('useropenclosedissue'),

    /**
      * Total time spent by user on issues.
      *
      * @property timeSpent
      * @type Usertimespent
      * @for User
      * @private
      */
    timeSpent: belongsTo('usertimespent'),

    /**
     * Daily collaboration of user in application.
     *
     * @property collaboration
     * @type Usercollaboration
     * @for User
     * @private
     */
    collaboration: belongsTo('usercollaboration'),

    /**
     * These are the latest projects of user.
     *
     * @property latestProjects
     * @type Userlatestproject
     * @for User
     * @private
     */
    latestProjects: hasMany('userlatestproject'),

    /**
     * These are the latest issues of user.
     *
     * @property latestIssues
     * @type Userlatestissue
     * @for User
     * @private
     */
    latestIssues: hasMany('userlatestissue'),

    /**
     * These are the members whom worked most with the user.
     *
     * @property mostWorkedMembers
     * @type Userworkmostwith
     * @for User
     * @private
     */
    mostWorkedMembers: hasMany('userworkmostwith'),

    /**
     * These are the recent activities of the user.
     *
     * @property recentActivities
     * @type Userecentactivity
     * @for User
     * @private
     */
    recentActivities: hasMany('userecentactivity'),

    /**
     * These are the tag relationship entries
     *
     * @property tagged
     * @type TaggedModel
     * @for User
     * @private
     */
    tagged: hasMany('tagged'),

    /**
     * These are the user projects
     *
     * @property projects
     * @type ProjectModel
     * @for User
     * @private
     */
    projects: hasMany('project'),

    /**
     * These are the badges earned by user.
     *
     * @property badges
     * @type BadgeModel
     * @for User
     * @private
     */
    badges: hasMany('badge'),

    /**
     * These are the user acl permissions.
     * 
     * @property aclPermissions
     * @type UserpermissionModel
     * @for User
     * @private
     */
    aclPermissions: hasMany('userpermission', {async: false}),

    /**
     * These are the level of each badge, earned by user.
     *
     * @property badgeLevels
     * @type BadgelevelModel
     * @for User
     * @private
     */
    badgeLevels: hasMany('badgelevel'),

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
    badgeDetails: computed('badges', 'badgeLevels', function () {
        let array = [];
        this.badges.forEach((badge) => {
            let badgeLevel = this.badgeLevels.findBy('badgeId', badge.id);
            let badgeInfo = {
                'badge': badge,
                'badgeLevel': badgeLevel
            }
            array.pushObject(badgeInfo);
        });
        return array;
    })

});