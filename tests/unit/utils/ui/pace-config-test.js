import { module, test } from "qunit";
import {
    TRANSPORT_URL_MARKERS,
    buildTransportIgnoreUrls,
    shouldIgnoreTransportUrl,
} from "prometheus/utils/ui/pace-config";

module("Unit | Utility | ui/pace-config", function () {
    test("TRANSPORT_URL_MARKERS includes Socket.IO path", function (assert) {
        assert.true(TRANSPORT_URL_MARKERS.includes("/socket.io/"));
    });

    test("buildTransportIgnoreUrls adds Hermes origin markers", function (assert) {
        let patterns = buildTransportIgnoreUrls("http://localhost:9000");

        assert.true(patterns.includes("/socket.io/"));
        assert.true(patterns.includes("http://localhost:9000"));
    });

    test("shouldIgnoreTransportUrl ignores Socket.IO polling requests", function (assert) {
        assert.true(
            shouldIgnoreTransportUrl(
                "http://localhost:9000/socket.io/?EIO=4&transport=polling&t=abc",
                "http://localhost:9000"
            )
        );
    });

    test("shouldIgnoreTransportUrl ignores Hermes WebSocket upgrade URLs", function (assert) {
        assert.true(
            shouldIgnoreTransportUrl(
                "ws://localhost:9000/socket.io/?EIO=4&transport=websocket",
                "http://localhost:9000"
            )
        );
    });

    test("shouldIgnoreTransportUrl does not ignore API requests", function (assert) {
        assert.false(
            shouldIgnoreTransportUrl(
                "http://test.projects4me/api/v1/project",
                "http://localhost:9000"
            )
        );
    });
});
