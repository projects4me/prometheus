import Ember from 'ember';

export function getProp(params) {
  var data = params[0];
  var index = params[1];
  return data.get(index);
}

export default Ember.Helper.helper(getProp);
