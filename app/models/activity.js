/* Licensing : http://legal.projects4.me/LICENSE.txt, please don't remove :) */
import DS from "ember-data";

/**
  The activity model

  @class ActivityModel
  @extends DS.Model
  @author Hammad Hassan gollmer@gmail.com
*/
export default DS.Model.extend({

  /**
    The date on which the activty was created

    @property dateCreated
    @type String
    @for ActivtyModel
    @private
  */
  dateCreated: DS.attr('string',{defaultValue:function(){return 'CURRENT_DATETIME';}}),

  /**
    The description of the activty

    @property description
    @type String
    @for ActivtyModel
    @private
  */
  description: DS.attr('string'),

  /**
    The identifier of the user who created the activity

    @property createdUser
    @type String
    @for ActivtyModel
    @private
  */
  createdUser: DS.attr('string'),

  /**
    The name of the entity the activity is related to

    @property relatedTo
    @type String
    @for ActivtyModel
    @private
  */
  relatedTo: DS.attr('string'),

  /**
    The identifier of the activty

    @property relatedId
    @type String
    @for ActivtyModel
    @private
  */
  relatedId: DS.attr('string'),

  /**
    The type of the activity, the type is used to determine the layout of the
    activty in the time-line

    @property type
    @type String
    @for ActivtyModel
    @private
  */
  type: DS.attr('string'),

  /**
    The name of the user who created the activity

    @property createdUserName
    @type String
    @for ActivtyModel
    @private
  */
  createdUserName: DS.attr('string'),

  /**
    If the type of activity is related when this field tells us the type of
    acitivity that was perfomed for the related item

    @property relatedActivity
    @type String
    @for ActivtyModel
    @private
  */
  relatedActivity: DS.attr('string'),

  /**
    The identifier of related entity that created the activity

    @property relatedActivityId
    @type String
    @for ActivtyModel
    @private
  */
  relatedActivityId: DS.attr('string'),

  /**
    If the type of activity is related when this field tells us the type of
    acitivity that was perfomed for the related item

    @property relatedActivityModule
    @type String
    @for ActivtyModel
    @private
  */
  relatedActivityModule: DS.attr('string'),

  /**
    The object of the user who created te activty

    @property createdBy
    @type UserModel
    @for ActivtyModel
    @private
  */
  createdBy : DS.belongsTo('user'),

  /**
    The project the activty is related to

    @property project
    @type ProjectModel
    @for ActivtyModel
    @private
  */
  project : DS.belongsTo('project'),

});
