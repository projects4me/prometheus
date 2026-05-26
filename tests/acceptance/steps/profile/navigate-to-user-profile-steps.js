import steps from '../steps';

export const given = function () {
    return [
        {
            "User has qualification with title $title": (assert, ctx) =>
                async function (title) {
                    const user = ctx.get('currentUser');

                    server.create('userqualification', {
                        userId: user.id,
                        title,
                        type: 'education',
                    });

                    assert.ok(true, `User has qualification with title ${title}`);
                },
        },
    ];
};

export const then = function () {
    return [
        {
            "User $userField is $expectedResult": (assert) => async function (userField, expectedResult) {
                let selectors = {
                    name: "div.user-info .user-name",
                    designation: "div.user-info .user-designation",
                    qualification: "div.user-qualification-section .qualification-title",
                    githubUrl: 'div[data-social-name="github"] a',
                    gitlabUrl: 'div[data-social-name="gitlab"] a',
                    skypeUrl: 'div[data-social-name="skype"] a',
                    linkedinUrl: 'div[data-social-name="linkedin"] a'
                }
                assert.dom(selectors[userField]).hasText(expectedResult);
            }
        },
        {
            "User has $totalSkills skills": (assert) => async function (totalSkills) {
                let skillEls = document.querySelectorAll('.user-skill-chip[data-skill-item]');
                assert.equal(skillEls.length, totalSkills, `User has ${totalSkills} skills`);
            }
        }
    ];
}

export default function (assert) {
    return steps(assert);
}