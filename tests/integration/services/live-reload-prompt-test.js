import { module, test } from "qunit";
import { setupTest } from "ember-qunit";

module("Integration | Service | live-reload-prompt", function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this.originalMessenger = window.Messenger;
    this.messages = [];
    let messages = this.messages;
    window.Messenger = class {
      post(options) {
        let message = {
          options,
          cancelled: false,
          cancel() {
            this.cancelled = true;
          },
          update() {},
        };
        messages.push(message);
        return message;
      }
    };
  });

  hooks.afterEach(function () {
    window.Messenger = this.originalMessenger;
  });

  test("dedupes per owner and clears after a successful reload", async function (assert) {
    let service = this.owner.lookup("service:live-reload-prompt");
    let owner = {};
    let reloads = 0;

    let first = service.show(owner, async () => reloads++);
    let second = service.show(owner, async () => reloads++);

    assert.strictEqual(first, second, "the route has one persistent prompt");
    assert.strictEqual(this.messages.length, 1);

    await first.options.actions.reload.action();
    assert.strictEqual(reloads, 1);
    assert.true(first.cancelled, "successful reload clears the prompt");
    assert.notOk(service.prompts.has(owner));
  });

  test("dismiss clears the route prompt", function (assert) {
    let service = this.owner.lookup("service:live-reload-prompt");
    let owner = {};
    let prompt = service.show(owner, () => {});

    prompt.options.actions.dismiss.action();

    assert.true(prompt.cancelled);
    assert.notOk(service.prompts.has(owner));
  });
});
