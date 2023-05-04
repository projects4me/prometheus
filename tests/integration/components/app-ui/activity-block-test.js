/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import humanizeDuration  from "humanize-duration";

module('Integration | Component | app-ui/activity-block', function (hooks) {
    setupRenderingTest(hooks);

    test('it renders activity block component', async function (assert) {
        let activity = {
            "relatedTo": "project",
            "type": "created",
            "dateCreated": "2022-09-28 05:57:50"
        }

        let expectedAnswer = {
            "activityBlockType": "project-created",
            "iconClass": "fa-briefcase"
        }

        this.set('activity', activity);

        await render(hbs`
            <AppUi::ActivityBlock
                @activity={{this.activity}}
            />
        `);

        let activityBlockSelector = `[data-activity-block-type="${expectedAnswer.activityBlockType}"]`;
        let createdSince = luxon.DateTime.now().diff(luxon.DateTime.fromFormat(activity.dateCreated, "yyyy-LL-dd hh:mm:ss")).toMillis();
        let humanizedDate = humanizeDuration(createdSince, {
            round: true,
            conjunction: "and",
            serialComma: false,
            largest: 2
        });

        assert.dom(activityBlockSelector).exists();
        assert.dom(`${activityBlockSelector} i`).hasClass(`${expectedAnswer.iconClass}`);
        assert.dom(`${activityBlockSelector} [data-activity="dateCreated"]`).hasText(`${humanizedDate} ago`);

    });
});
