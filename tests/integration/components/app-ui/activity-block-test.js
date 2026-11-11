/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import CurrentUserStub from '../../stub-services/current-user-stub';
import * as dates from 'prometheus/utils/date';

module('Integration | Component | app-ui/activity-block', function (hooks) {
    setupRenderingTest(hooks);

    hooks.beforeEach(function () {
        this.owner.register('service:currentUser', CurrentUserStub);
    });

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
        let createdSince = dates.humanizeDuration(dates.diff(dates.now(), activity.dateCreated, undefined, { zone: 'UTC' }));

        assert.dom(activityBlockSelector).exists();
        assert.dom(`${activityBlockSelector} i`).hasClass(`${expectedAnswer.iconClass}`);
        assert.dom(`${activityBlockSelector} [data-activity="dateCreated"]`).hasText(`${createdSince} ago`);

    });
});
