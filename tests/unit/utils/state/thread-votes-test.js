import { module, test } from "qunit";
import ThreadVotes from "prometheus/utils/state/thread-votes";

module("Unit | Utility | state/thread-votes", function () {
  function row(id, user, text, dateCreated) {
    return { id, createdUser: user, createdUserName: `User ${user}`, comment: text, dateCreated };
  }

  function fakeStore(rows) {
    return {
      requests: [],
      query(modelName, params) {
        this.requests.push(params);
        return Promise.resolve({ toArray: () => rows });
      },
    };
  }

  test("loads all votes of the room and tallies them", async function (assert) {
    let store = fakeStore([
      row("c1", "u1", "I agree", "2026-01-01 10:00:01"),
      row("c2", "u2", "I agree", "2026-01-01 10:00:02"),
      row("c3", "u3", "I disagree", "2026-01-01 10:00:03"),
      row("c4", "u4", "just a comment", "2026-01-01 10:00:04"),
    ]);
    let votes = new ThreadVotes({ store });
    await votes.open("r1");
    assert.strictEqual(store.requests[0].limit, -1, "all votes are requested");
    assert.strictEqual(votes.total, 3, "other comments are not votes");
    assert.strictEqual(votes.agreeCount, 2);
    assert.strictEqual(votes.disagreeCount, 1);
    assert.strictEqual(votes.agreePercent, 67);
    assert.strictEqual(votes.leaning, "agree");
    assert.strictEqual(votes.leadingCount, 2);
    assert.deepEqual(votes.newestFirst.map((vote) => vote.id), ["c3", "c2", "c1"]);
    assert.strictEqual(votes.voteOf("u3"), "I disagree");
    assert.strictEqual(votes.voteOf("nobody"), null);
  });

  test("leaning is none without votes and tied on equal votes", async function (assert) {
    let votes = new ThreadVotes({ store: fakeStore([]) });
    await votes.open("r1");
    assert.strictEqual(votes.leaning, "none");
    assert.strictEqual(votes.agreePercent, 0);
    votes.add(row("c1", "u1", "I agree", "d"));
    votes.add(row("c2", "u2", "I disagree", "d"));
    assert.strictEqual(votes.leaning, "tied");
  });

  test("a vote added twice is counted once", async function (assert) {
    let votes = new ThreadVotes({ store: fakeStore([]) });
    await votes.open("r1");
    votes.add(row("c1", "u1", "I agree", "d"));
    votes.add(row("c1", "u1", "I agree", "d"));
    assert.strictEqual(votes.total, 1);
    votes.remove("c1");
    assert.strictEqual(votes.total, 0);
  });

  test("a failed load is flagged", async function (assert) {
    let votes = new ThreadVotes({ store: { query: () => Promise.reject(new Error("x")) } });
    window.Logger = window.Logger || { error() {} };
    await votes.open("r1");
    assert.true(votes.failed);
    assert.false(votes.isLoading);
  });
});
