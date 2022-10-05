/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Model, { attr } from '@ember-data/model';

/**
 * The user recent activity model.
 *
 * @class UserecentactivityModel
 * @namespace Prometheus.Model
 * @extends DS.Model
 * @author Rana Nouman <ranamnouman@yahoo.com>
 */
export default class UserecentactivityModel extends Model {

    /**
     * Identifier of user.
     * 
     * @property userId
     * @type String
     * @for Userecentactivity
     * @private
     */
     @attr('string') userId;

     /**
      * The name of the entity the activity is related to.
      * 
      * @property relatedTo
      * @type String
      * @for Userecentactivity
      * @private
      */
     @attr('string') relatedTo;
     
    /**
     * Identifier of related entity.
     * 
     * @property relatedId
     * @type String
     * @for Userecentactivity
     * @private
     */
     @attr('string') relatedId;

     /**
      * Creation date of activity.
      * 
      * @property dateCreated
      * @type String
      * @for Userecentactivity
      * @private
      */
     @attr('string') dateCreated;

     /**
      * Type of activity.
      * 
      * @property type
      * @type String
      * @for Userecentactivity
      * @private
      */
      @attr('string') type;     
     
    /**
     * Type of activity performed on related entity.
     * 
     * @property relatedActivity
     * @type String
     * @for Userecentactivity
     * @private
     */
     @attr('string') relatedActivity;

     /**
      * Identifier of related activity.
      * 
      * @property relatedActivityId
      * @type String
      * @for Userecentactivity
      * @private
      */
     @attr('string') relatedActivityId; 

     /**
      * Name of the related entity module on which activity is performed.
      * 
      * @property relatedActivityModule
      * @type String
      * @for Userecentactivity
      * @private
      */
      @attr('string') relatedActivityModule; 
}
