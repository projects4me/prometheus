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



  init: function () {
    this._super();
    //Ember.run.schedule("afterRender",this,function() {
    //  this.send("setupMasonary");
    //});
  },

  actions: {

    saveme:function(id,contents){
      Logger.debug('AppProjectConversationController::saveme()');
      Logger.debug(id);
      Logger.debug(contents);
    },

    save:function() {
       var self = this;
       if (event.keyCode === 13)
       {
         if (!this.shiftPressed)
         {
           var relatedId = event.target.attributes['data-related'].nodeValue;
           let comment = this.get('store').createRecord('comment', {
               relatedId: relatedId,
               relatedTo: 'conversationrooms',
               comment: el.slice(0, -1),
               dateCreated: 'CURRENT_DATETIME',
               dateModified: 'CURRENT_DATETIME',
               createdUser: '1',
               createdUserName: 'Hammad Hassan',
               modifiedUser: '1',
               modifiedUserName: 'Hammad Hassan',
               deleted: 0
           });

           event.target.disabled = true;
           comment.save().then(function (savedComment) {
             //console.log('Comment Saved');
             //console.log(comment);
             //console.log(savedComment);
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
             event.target.disabled = false;
           });
         }
       }

       this.shiftPressed = false;
     },

     keydown:function(el,event) {
       if(event.keyCode === 16){
         this.shiftPressed=true;
       }
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
