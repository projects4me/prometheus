/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { click } from '@ember/test-helpers';
import { find, findAll } from '@ember/test-helpers';
import Collection from 'ember-cli-mirage/orm/collection';
import steps from '../steps';
import Context from '../../../../mirage/yadda-context/context';

/**
 * Selectors for breadcrumb elements
 */
const selectors = {
    breadcrumb: 'ol.breadcrumb',
    breadcrumbItem: 'ol.breadcrumb li',
    breadcrumbLink: 'ol.breadcrumb li a',
    breadcrumbActive: 'ol.breadcrumb li.active',
    breadcrumbIcon: 'ol.breadcrumb li i.fa'
};

export default function(assert) {
    let yaddaa = steps(assert);

    yaddaa.
        given('Project has issue with number "$issueNumber"', async function (issueNumber) {
            let project = server.schema.projects.find(1);
            let issues = server.create('issue', {
                issueNumber: issueNumber,
                projectId: project.id,
                projectShortcode: project.shortCode,
                status: 'new',
                priority: 'medium',
                project: project
            });
            let issueCollection = new Collection('issue', [issues]);
            project.update({
                issues: issueCollection
            });
            assert.ok(true, `Project has issue with number ${issueNumber}`);
        })
        .given('There is custom callback for issue', async function () {
            let ctx = new Context();
            ctx.set('customCallback', function (issues) {
                let issue = server.schema.issues.findBy({
                    issueNumber: 123
                });
                return new Collection('issue', [issue]);
            });
        }).       
        when('User clicks on "$breadcrumbText" breadcrumb', async function (breadcrumbText) {
            const breadcrumbItems = findAll(selectors.breadcrumbItem);
            let found = false;
            
            for (let i = 0; i < breadcrumbItems.length; i++) {
                const item = breadcrumbItems[i];
                const link = item.querySelector('a');
                const text = item.textContent.trim().replace(/\s+/g, ' ');
                
                if (text.includes(breadcrumbText) && link) {
                    await click(link);
                    found = true;
                    assert.ok(true, `User clicks on "${breadcrumbText}" breadcrumb`);
                    break;
                }
            }
            
            if (!found) {
                assert.ok(false, `Breadcrumb item with text "${breadcrumbText}" not found or not clickable`);
            }
        }).
        then('Breadcrumb should be displayed', function () {
            const breadcrumb = find(selectors.breadcrumb);
            assert.ok(breadcrumb, 'Breadcrumb should be displayed');
            const items = breadcrumb.querySelectorAll('li');
            assert.ok(items.length > 0, 'Breadcrumb should have at least one item');
        }).
        then('Breadcrumb should have $count items', function (count) {
            const breadcrumbItems = findAll(selectors.breadcrumbItem);
            const expectedCount = parseInt(count, 10);
            assert.equal(
                breadcrumbItems.length,
                expectedCount,
                `Breadcrumb should have ${expectedCount} items, but has ${breadcrumbItems.length}`
            );
        }).
        then('Breadcrumb item $index should be "$text"', function (index, text) {
            const breadcrumbItems = findAll(selectors.breadcrumbItem);
            const itemIndex = parseInt(index, 10);
            
            assert.ok(
                breadcrumbItems.length > itemIndex,
                `Breadcrumb should have at least ${itemIndex + 1} items, but has ${breadcrumbItems.length}`
            );
            
            const item = breadcrumbItems[itemIndex];
            const itemText = item.textContent.trim().replace(/\s+/g, ' ');
            
            const isMatch = itemText.includes(text) || itemText === text;
            assert.ok(
                isMatch,
                `Breadcrumb item ${itemIndex} should be "${text}", but is "${itemText}"`
            );
        }).
        then('Breadcrumb item $index should have icon "$iconName"', function (index, iconName) {
            const breadcrumbItems = findAll(selectors.breadcrumbItem);
            const itemIndex = parseInt(index, 10);
            
            assert.ok(
                breadcrumbItems.length > itemIndex,
                `Breadcrumb should have at least ${itemIndex + 1} items`
            );
            
            const item = breadcrumbItems[itemIndex];
            const icon = item.querySelector(`i.fa-${iconName}`);
            
            assert.ok(
                icon,
                `Breadcrumb item ${itemIndex} should have icon "fa-${iconName}", but ${icon ? 'found' : 'not found'}`
            );
        }).
        then('Breadcrumb item $index should be linkable', function (index) {
            const breadcrumbItems = findAll(selectors.breadcrumbItem);
            const itemIndex = parseInt(index, 10);
            
            assert.ok(
                breadcrumbItems.length > itemIndex,
                `Breadcrumb should have at least ${itemIndex + 1} items`
            );
            
            const item = breadcrumbItems[itemIndex];
            const link = item.querySelector('a');
            
            assert.ok(
                link,
                `Breadcrumb item ${itemIndex} should be linkable (have an anchor tag), but does not have one`
            );
        }).
        then('Breadcrumb item $index should not be linkable', function (index) {
            const breadcrumbItems = findAll(selectors.breadcrumbItem);
            const itemIndex = parseInt(index, 10);
            
            assert.ok(
                breadcrumbItems.length > itemIndex,
                `Breadcrumb should have at least ${itemIndex + 1} items`
            );
            
            const item = breadcrumbItems[itemIndex];
            const link = item.querySelector('a');
            
            assert.notOk(
                link,
                `Breadcrumb item ${itemIndex} should not be linkable (should not have an anchor tag), but has one`
            );
        }).
        then('Breadcrumb item $index should have active class', function (index) {
            const breadcrumbItems = findAll(selectors.breadcrumbItem);
            const itemIndex = parseInt(index, 10);
            
            assert.ok(
                breadcrumbItems.length > itemIndex,
                `Breadcrumb should have at least ${itemIndex + 1} items`
            );
            
            const item = breadcrumbItems[itemIndex];
            
            assert.ok(
                item.classList.contains('active'),
                `Breadcrumb item ${itemIndex} should have active class, but classList is: ${item.className}`
            );
        })
    return yaddaa;
}

