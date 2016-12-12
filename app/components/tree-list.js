/* Licensing : http://legal.projects4.me/LICENSE.txt, please don't remove :) */
import Ember from "ember";

/**
  This component is used to help the event handling of route request in the
  tree-list
  @class tree-list
  @module App.Components
  @namespace Prometheus
*/
export default Ember.Component.extend({

  /**
    These are the evet handlers for the component.
    @property actions
    @type Object
    @for tree-list
    @public
  */
   actions:{
     /**
       Load a particular wiki page
       @method loadWiki
       @param projectId {String} The projectId to which the wiki belogns to
       @param wikiName {String} The name of the wiki to which we need to navigate to
       @public
       @todo Trigger the notificaiton
     */
     loadWiki:function(projectId,wikiName) {
       // This route is not exposed by EmbberJS, we included this by utilizing
       // intializer. Normally this would not be required but the tree view
       // causes us to call the same component recursively and thus it becomes
       // very difficult to pass action context across
       this.get('router').transitionTo('app.project.wiki.page',{projectId:projectId,wikiName:wikiName});
     }
   }
});
