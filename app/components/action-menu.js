import Ember from "ember";

/**
 * This class adds the functionality of dropdown action menu in the system
 * In order to allow capturing of an event of any specified name we are passing
 * all incoming actions over to the controller.
 */
export default Ember.Component.extend({
  actions: {
    /**
     * Allowing capture of all possible event and simply forwarding them
     * @params string action delegate the specified event over to the controller
     */
    onAction:function(action) {
        this.sendAction(action);
    }
  },
});
