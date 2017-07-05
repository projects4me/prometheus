import { moduleFor, test } from 'ember-qunit';

moduleFor('service:related-fields', 'Unit | Service | related fields', {
  // Specify the other units that are required for this test.
  // needs: ['service:foo']
});

// Replace this with your real tests.
test('get users list', function(assert) {
  let service = this.subject();
  assert.equal(service.getList('users',['id','name'],{'query':'Users.id:1'}),[{'id':{'name':"Hammad"}}]);
});
