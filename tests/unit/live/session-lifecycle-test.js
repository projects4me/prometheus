import { module, test } from "qunit";
import { setupTest } from "ember-qunit";
import { installFakeHermes } from "../../helpers/hermes-fake";

module("Unit | Live | session lifecycle", function (hooks) {
  setupTest(hooks);
  installFakeHermes(hooks);

  test("S3: logout path stops notifications and clears hermes", function (assert) {
    let hermes = this.owner.lookup("service:hermes");
    let notifications = this.owner.lookup("service:notifications");
    hermes.connect();
    notifications.hermes = hermes;
    notifications.currentUser = { user: { id: "user-1" } };
    notifications.startLiveSync();

    hermes.register({}, "project-1", {
      "issue.created": () => {},
    });
    assert.ok(hermes.desiredIntents.length > 0);

    notifications.stopLiveSync();
    hermes.clearRegistrations();
    hermes.disconnect();

    assert.false(notifications._liveStarted);
    assert.strictEqual(hermes.desiredIntents.length, 0);
    assert.strictEqual(hermes.socket, null);
  });

  test("S4: issue list controller does not register hermes intents", function (assert) {
    let hermes = this.owner.lookup("service:hermes");
    hermes.connect();
    let before = hermes.desiredIntents.length;

    // Issue list / detail / wiki intentionally have no registerHermesIntents
    let issueIndex = this.owner.lookup("controller:app.project.issue.index");
    assert.strictEqual(
      typeof issueIndex.registerHermesIntents,
      "undefined",
      "issue list does not own hermes registration"
    );
    assert.strictEqual(hermes.desiredIntents.length, before);
  });
});
