import Ember from 'ember';

/**
  This method extracts the page number from the URL in _links property returned
  via the API

  @method getPage
  @for App.Helpers
  @module App
  @submodule Helpers
  @namespace prometheus
*/
export function getPage(params) {
  var url = params[0];

  var regex = new RegExp("[?&]page(=([^&#]*)|&|#|$)"),
      results = regex.exec(url);
  if (!results) {
    return null;
  }
  if (!results[2]) {
    return '';
  }
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

export default Ember.Helper.helper(getPage);
