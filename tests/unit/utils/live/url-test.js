import { module, test } from "qunit";
import { resolveHermesUrl } from "prometheus/utils/live/url";

module("Unit | Utility | live/url", function () {
  test("rewrites loopback Hermes hosts to the page hostname", function (assert) {
    assert.strictEqual(
      resolveHermesUrl("http://localhost:9000", { hostname: "127.0.0.1" }),
      "http://127.0.0.1:9000"
    );
    assert.strictEqual(
      resolveHermesUrl("http://127.0.0.1:9000", { hostname: "localhost" }),
      "http://localhost:9000"
    );
    assert.strictEqual(
      resolveHermesUrl("http://hermes.internal:9000", { hostname: "127.0.0.1" }),
      "http://hermes.internal:9000"
    );
  });
});
