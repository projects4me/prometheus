import steps from '../steps';

export const then = function () {
    return [
        {
            "User $userField is $expectedResult": (assert) => async function (userField, expectedResult) {
                let selectors = {
                    name: "div.user-info .user-name",
                    designation: "div.user-info .user-designation",
                    education: "div.user-education .education",
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
                let skillEls = document.querySelectorAll('div.user-skills span.skill-item');
                assert.equal(skillEls.length, totalSkills, `User has ${totalSkills} skills`);
            }
        }
    ];
}

export default function (assert) {
    return steps(assert);
}