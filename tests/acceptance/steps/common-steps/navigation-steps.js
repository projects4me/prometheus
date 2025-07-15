import { click, currentURL, visit } from '@ember/test-helpers';
import steps from '../steps';
import { selectors as widgetsSelectors } from './widgets';

const selectors = {
    components: {
        "active milestones": widgetsSelectors['active milestones'].selector,
        "recent issues": widgetsSelectors['recent issues'].selector,
        "weekly activities": widgetsSelectors['weekly activities'].selector,
        "weekly timelogs": widgetsSelectors['weekly timelogs'].selector,
        "weekly conversations": widgetsSelectors['weekly conversations'].selector
    }
};

export const given = function () {
	return [
		{
			'Reverse navigation for pagination is enabled':
				(assert, ctx) =>
					async function () {
						ctx.set('reverseNavigation', true);
						assert.ok(true, 'Reverse navigation for pagination is enabled');
					}
		}
	];
};

export const when = function () {
    return [
        {
            "User click on $buttonName button": (assert) => async function (buttonName) {
                await click('button[type="submit"]');
                assert.ok(true, `User click on ${buttonName} button`);
            },
        },
        {
            "User navigates to $page": (assert) => async function (page) {
                await visit(`/${page}`);
                assert.equal(currentURL(), `/${page}`, `User navigates to /${page}`);
            }
        },
        {
            "User clicks on the \"$buttonLabel\" button": (assert) => async function (buttonLabel) {
                const buttonMapping = {
                    "mass update issues": "button[data-btn='mass-update-issues']",
                    "select all issues": "[data-select='all']",
                };
                const selector = buttonMapping[buttonLabel];
                await click(selector);
                assert.ok(true, `User clicks on the "${buttonLabel}" button`);
            }
        },
        //pagination steps
        {
            "User clicks on next page button in $componentName": (assert, ctx) => async function (componentName) {
                const selector = `${selectors.components[componentName]} [data-btn='next']`;
                setPage(ctx, 'next');
                await click(selector);
                assert.ok(true, `User clicks on next page button in ${componentName}`);
            }
        },
        {
            "User clicks on previous page button in $componentName": (assert, ctx) => async function (componentName) {
                const selector = `${selectors.components[componentName]} [data-btn='previous']`;
                setPage(ctx, 'previous');
                await click(selector);
                assert.ok(true, `User clicks on previous page button in ${componentName}`);
            }
        }
    ];
}

export const then = function () {
    return [
        {
            "User should be in $pageName page": (assert) => async function (pageName) {
                assert.equal(currentURL(), `/${pageName}`, `User should be in a /${pageName} page`);
            }
        }
    ];
}

function setPage(ctx, buttonType) {
    if(ctx.get('reverseNavigation')) {
        const page = buttonType === 'next' ? ctx.get('page') - 1 : ctx.get('page') + 1;
        ctx.set('page', page);
    } else {
        const page = buttonType === 'next' ? ctx.get('page') + 1 : ctx.get('page') - 1;
        ctx.set('page', page);
    }
}

export default function (assert) {
    return steps(assert);
}