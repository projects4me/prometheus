import { module, test } from "qunit";
import ThreadComments from "prometheus/utils/state/thread-comments";
import { recordArray } from '../../../helpers/record-array';

module("Unit | Utility | state/thread-comments", function () {
  function comment(id, dateCreated) {
    return { id, dateCreated };
  }

  // Answers each query with the next response; a response that is an Error rejects the query
  function fakeStore(responses, requests = []) {
    return {
      requests,
      query(modelName, params) {
        requests.push(params);
        let response = responses[requests.length - 1] || [];
        if (response instanceof Error) {
          return Promise.reject(response);
        }
        return Promise.resolve(recordArray(response, { links: requests.length < responses.length ? { next: {} } : {} }));
      },
    };
  }

  function ids(loader) {
    return loader.items.map((item) => item.id);
  }

  test("comments created in the same second are all loaded across pages", async function (assert) {
    let [c1, c2, c3, c4, c5] = [
      comment("c1", "2026-01-01 10:00:01"),
      comment("c2", "2026-01-01 10:00:02"),
      comment("c3", "2026-01-01 10:00:02"),
      comment("c4", "2026-01-01 10:00:02"),
      comment("c5", "2026-01-01 10:00:03"),
    ];
    let requests = [];
    // Page 1 ends inside the three comments of 10:00:02; the next page gets them again, in another order
    let store = fakeStore([[c5, c4], [c3, c4, c2], [c2, c3, c4, c1]], requests);
    let loader = new ThreadComments({ store, pageSize: 2 });

    await loader.open("room-1");
    assert.deepEqual(ids(loader), ["c4", "c5"]);

    await loader.loadOlder();
    assert.ok(requests[1].query.includes("(Comment.dateCreated <: 2026-01-01 10:00:02)"));
    assert.strictEqual(requests[1].limit, 3, "room for the one comment already loaded at the cursor");
    assert.deepEqual(ids(loader), ["c2", "c3", "c4", "c5"]);

    await loader.loadOlder();
    assert.strictEqual(requests[2].limit, 5, "room for the three comments at the cursor");
    assert.deepEqual(ids(loader), ["c1", "c2", "c3", "c4", "c5"], "each comment is shown once");
    assert.false(loader.hasOlder);
  });

  test("a failed page is retried from the same cursor", async function (assert) {
    let requests = [];
    let c2 = comment("c2", "2026-01-01 10:00:02");
    let store = fakeStore([[comment("c3", "2026-01-01 10:00:03"), c2], new Error("offline"), [c2, comment("c1", "2026-01-01 10:00:01")]], requests);
    let loader = new ThreadComments({ store, pageSize: 2 });
    await loader.open("room-1");

    await loader.loadOlder();
    assert.true(loader.failed);
    assert.false(loader.isLoading);
    assert.deepEqual(ids(loader), ["c2", "c3"], "the loaded comments stay");

    await loader.loadOlder();
    assert.false(loader.failed);
    assert.strictEqual(requests[2].query, requests[1].query, "the retry asks for the same page");
    assert.deepEqual(ids(loader), ["c1", "c2", "c3"]);
  });

  test("comments added or removed while the thread is open do not move the cursor", async function (assert) {
    let requests = [];
    let c2 = comment("c2", "2026-01-01 10:00:02");
    // c2 is deleted after the first page, so the older page no longer has it
    let store = fakeStore([[comment("c3", "2026-01-01 10:00:03"), c2], [comment("c1", "2026-01-01 10:00:01")]], requests);
    let loader = new ThreadComments({ store, pageSize: 2 });
    await loader.open("room-1");

    loader.add(comment("c9", "2026-01-01 10:00:09"));
    loader.remove("c2");
    await loader.loadOlder();

    assert.ok(requests[1].query.includes("(Comment.dateCreated <: 2026-01-01 10:00:02)"), "the cursor is the oldest fetched comment");
    assert.deepEqual(ids(loader), ["c1", "c3", "c9"], "nothing is skipped");
  });

  test("a load that finishes after another thread was opened is dropped", async function (assert) {
    let release;
    let store = {
      calls: 0,
      query() {
        this.calls++;
        if (this.calls === 1) {
          return new Promise((resolve) => {
            release = () => resolve(recordArray([comment("a1", "2026-01-01 10:00:01")], { links: {} }));
          });
        }
        return Promise.resolve(recordArray([comment("b1", "2026-01-01 10:00:01")], { links: {} }));
      },
    };
    let loader = new ThreadComments({ store, pageSize: 2 });

    let first = loader.open("room-a");
    await loader.open("room-b");
    release();
    await first;

    assert.deepEqual(ids(loader), ["b1"], "only the open thread's comments are shown");
  });
});
