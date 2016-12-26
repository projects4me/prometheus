import Ember from "ember";

/**
  This is the controller for the conversation controller route

  @class AppProjectConversationController
  @extends Ember.Controller
*/
export default Ember.Controller.extend({

  /**
   The current user service

   @property currentUser
   @type Ember.Service
   @for AppProjectConversationController
   @public
  */
  currentUser: Ember.inject.service(),

  /**
   This is the flag which is used to

   @property currentUser
   @type Ember.Service
   @for AppProjectConversationController
   @public
  */
  shiftPressed:false,

  /**
   This is the list of issues related to the current project

   @property issuesList
   @type Array
   @for AppProjectConversationController
   @public
  */
  issuesList: [],

  /**
   This is the list users in the system

   @property usersList
   @type Array
   @for AppProjectConversationController
   @public
  */
  usersList: [],

  /**
   These are the actions that are handled by this controller

   @property actions
   @type Object
   @for AppProjectConversationController
   @public
  */
  actions: {

    save:function(relatedId,contents){
      Logger.debug('AppProjectConversationController::saveme()');
      Logger.debug(relatedId);
      Logger.debug(contents);
      var self = this;

      let comment = this.get('store').createRecord('comment', {
          relatedId: relatedId,
          relatedTo: 'conversationrooms',
          comment: contents,
          dateCreated: 'CURRENT_DATETIME',
          dateModified: 'CURRENT_DATETIME',
          createdUser: '1',
          createdUserName: 'Hammad Hassan',
          modifiedUser: '1',
          modifiedUserName: 'Hammad Hassan',
          deleted: 0
      });

      comment.save().then(function (comment) {
        Logger.debug('Comment Saved');
        Logger.debug(comment);
        var count = self.model.get('length');
        while (count > 0)
        {
          count--;
          if(self.model.nextObject(count).get('id') === relatedId)
          {
            self.model.nextObject(count).get('comments').pushObject(comment);
            self.set('comment',"");
            break;
          }
        }
      });

    },

     /**
      This function allows us to save votes in the database as comments
      @todo Check if the user has already voted if so then disable the vote
     */
     vote:function(vote,relatedId) {
       if (relatedId === null)
       {
         return false;
       }

       var self = this;
       let comment = this.get('store').createRecord('comment', {
           relatedId: relatedId,
           relatedTo: 'conversationrooms',
           comment: vote,
           dateCreated: 'CURRENT_DATETIME',
           dateModified: 'CURRENT_DATETIME',
           createdUser: '1',
           createdUserName: 'Hammad Hassan',
           modifiedUser: '1',
           modifiedUserName: 'Hammad Hassan',
           deleted: 0
       });


       comment.save().then(function (savedComment) {
         var count = self.model.get('length');
         while (count > 0)
         {
             count--;
             if(self.model.nextObject(count).get('id') === relatedId)
             {
               self.model.nextObject(count).get('comments').pushObject(comment);
               event.target.value = '';
               break;
             }
         }
       });
     },

   }
});
