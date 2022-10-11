/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | user-profile/latest-projects', function (hooks) {
    setupRenderingTest(hooks);

    test('it renders component with some projects', async function (assert) {
        let projects = [
            {
                name: "project A",
                shortCode: "PROA",
                status: "in_progress",
                description: "description of project a"
            },
            {
                name: "project B",
                shortCode: "PROB",
                status: "new",
                description: "description of project b"
            }
        ]

        let expectedAnswers = [
            {
                name: "project A",
                shortCode: "(PROA)",
                status: "In Progress",
                description: "description of project a"
            },
            {
                name: "project B",
                shortCode: "(PROB)",
                status: "New",
                description: "description of project b"
            }
        ]

        this.set('projects', projects);

        await render(hbs`
            <UserProfile::LatestProjects
                @projects={{this.projects}}
            />
        `);

        expectedAnswers.forEach((project) => {
            for (const [key, value] of Object.entries(project)) {
                assert.dom(`div[data-project="${project.name}"] [data-latest-project-field="${key}"]`).hasText(value);
            }
        });
        
    });

    test('it render component without any project', async function (assert) {
        let projects = [];
        
        this.set('projects', projects);
        
        await render(hbs`
            <UserProfile::LatestProjects
                @projects={{this.projects}}
            />
        `);

        assert.dom('div.no-content div.description').hasText('No Projects found');
    });
});
