/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | user-profile/social-links', function (hooks) {
    setupRenderingTest(hooks);

    test('it renders', async function (assert) {
        let user = {
            githubUrl: "github.com/test-github",
            gitlabUrl: "gitlab.com/test-gitlab",
            skypeUrl: "test-skype",
            linkedinUrl: "linkedin.com/in/test-linkedin",
            slackUrl: "test-slack"
        }

        let expectedAnswers = [
            {
                socialMediaName: "github",
                userName: "test-github"
            },
            {
                socialMediaName: "gitlab",
                userName: "test-gitlab"
            },
            {
                socialMediaName: "skype",
                userName: "test-skype"
            },
            {
                socialMediaName: "linkedin",
                userName: "test-linkedin"
            },
            {
                socialMediaName: "slack",
                userName: "@slack"
            }
        ]

        this.set('user', user);

        await render(hbs`
            <UserProfile::SocialLinks
                @user={{this.user}}
            />
        `)

        expectedAnswers.forEach((answer) => {
            let anchorTagSelector = `div[data-social-name='${answer.socialMediaName}'] > a`;
            let iTagSelector = `div[data-social-name='${answer.socialMediaName}'] > i`;
            
            assert.dom(anchorTagSelector).hasText(`${answer.userName}`);

            assert.dom(iTagSelector).hasClass(`fa-${answer.socialMediaName}`);
        });
    });
});