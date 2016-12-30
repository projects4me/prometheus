/* Licensing : http://legal.projects4.me/LICENSE.txt, please don't remove :) */
import DS from "ember-data";

/**
  The time log model

  @class TimelogModel
  @extends DS.Model
  @author Hammad Hassan gollmer@gmail.com
*/
export default DS.Model.extend({

  /**
   The date on which the time log entry was made

   @property dateCreated
   @type String
   @for TimelogModel
   @private
  */
  "dateCreated": DS.attr('string'),

  /**
   The date on which the time log entry was last modified

   @property dateModified
   @type String
   @for TimelogModel
   @private
  */
  "dateModified": DS.attr('string'),

  /**
   The soft deletion flag of the time log entry

   @property deleted
   @type String
   @for TimelogModel
   @private
  */
  "deleted": DS.attr('string'),

  /**
   The identifier of the user who created the time log entry

   @property createdUser
   @type String
   @for TimelogModel
   @private
  */
  "createdUser": DS.attr('string'),

  /**
   The identifier of the user who last modifed the time log entry

   @property modifedUser
   @type String
   @for TimelogModel
   @private
  */
  "modifiedUser": DS.attr('string'),

  /**
   The identifier of the issue for which the time log entry was made

   @property issueId
   @type String
   @for TimelogModel
   @private
  */
  "issueId": DS.attr('string'),

  /**
   The minutes part of the time log entry

   @property minutes
   @type String
   @for TimelogModel
   @private
  */
  "minutes": DS.attr('string'),

  /**
   The hours part of the time log entry

   @property hours
   @type String
   @for TimelogModel
   @private
  */
  "hours": DS.attr('string'),

  /**
   The days part of the time log entry

   @property days
   @type String
   @for TimelogModel
   @private
  */
  "days": DS.attr('string'),

  /**
   The context in which the time log entry was made, currently we are supporting
   estiamted time and the spent time. The estimated time is represented by 'est'
   and the spent time is represented by 'spent'

   @property context
   @type String
   @for TimelogModel
   @private
  */
  "context": DS.attr('string')

});
