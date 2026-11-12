import { module, test } from "qunit";
import ThreadParticipants, { buildParticipants } from "prometheus/utils/state/thread-participants";
import { recordArray } from '../../../helpers/record-array';

module("Unit | Utility | state/thread-participants", function () {
  const creator = { id: "u1", name: "Creator" };
  const entry = (id, user, date) => ({ id, createdUser: user, createdUserName: `User ${user}`, date });

  test("creator first, then distinct authors newest first", function (assert) {
    let list = buildParticipants(creator, [
      entry("c1", "u2", "2026-01-01 10:00:01"),
      entry("c2", "u1", "2026-01-01 10:00:02"),
      entry("c3", "u3", "2026-01-01 10:00:03"),
      entry("c4", "u2", "2026-01-01 10:00:04"),
    ]);
    assert.deepEqual(list.map((p) => p.id), ["u1", "u2", "u3"]);
  });

  test("works without a creator or activity", function (assert) {
    assert.deepEqual(buildParticipants(null, []), []);
    assert.deepEqual(buildParticipants(creator).map((p) => p.id), ["u1"]);
  });

  test("loads the comments with minimal fields and adds live ones once", async function (assert) {
    let requests = [];
    let store = {
      query(model, params) {
        requests.push(params);
        return Promise.resolve(recordArray([{ id: "c1", createdUser: "u2", createdUserName: "U2", dateCreated: "2026-01-01 10:00:01" }]));
      },
    };
    let participants = new ThreadParticipants({ store });
    await participants.open("r1");
    assert.strictEqual(requests[0].limit, -1);
    assert.notOk(requests[0].fields.includes("Comment.comment,"), "no comment text requested");
    participants.add({ id: "c2", createdUser: "u3", createdUserName: "U3", dateCreated: "2026-01-02" });
    participants.add({ id: "c2", createdUser: "u3", createdUserName: "U3", dateCreated: "2026-01-02" });
    assert.strictEqual(participants.records.length, 2);
    assert.deepEqual(buildParticipants(creator, participants.records).map((p) => p.id), ["u1", "u3", "u2"]);
    participants.remove("c2");
    assert.strictEqual(participants.records.length, 1);
  });
});
