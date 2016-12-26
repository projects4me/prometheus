import Ember from 'ember';

/**
  This component is used to render the HTML5 div with contenteditable property

  inspired from https://github.com/KasperTidemann/ember-contenteditable-view

  @class ContentEditableComponent
  @module App.Components
  @namespace Prometheus
*/
export default Ember.Component.extend({
	tagName: 'div',
	attributeBindings: ['contenteditable','spellcheck','placeholder'],
  classNames: ["editable"],

	// Variables:
  editable: true,
  checkSpelling: false,
	isUserTyping: false,
	plaintext: false,

	// Properties:
	contenteditable: (function() {
		var editable = this.get('editable');

		return editable ? 'true' : undefined;
	}).property('editable'),

  spellcheck: (function() {
		var spelling = this.get('checkSpelling');

		return spelling ? 'true' : 'false';
	}).property('checkSpelling'),

	// Processors:
	processValue: function() {
		if (!this.get('isUserTyping') && this.get('value')) {
			return this.setContent();
		}
	},

	// Observers:
	valueObserver: (function() {
		Ember.run.once(this, 'processValue');
	}).observes('value', 'isUserTyping'),

	// Events:
	didInsertElement: function() {
		return this.setContent();
	},

	focusOut: function() {
		return this.set('isUserTyping', false);
	},

	keyDown: function(event) {
		if (!event.metaKey) {
			return this.set('isUserTyping', true);
		}
	},

	keyUp: function() {
		return this.set('value', this.$().html());
	},


	setContent: function() {
		//return this.$().html(Ember.Handlebars.Utils.escapeExpression(this.get('value')));
    return this.get('value');
	}
});
