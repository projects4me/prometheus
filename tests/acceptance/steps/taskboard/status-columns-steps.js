import steps from '../steps';

/**
 * Normalises a computed colour, browsers report it as rgb().
 */
function hexOf(color) {
    let [r, g, b] = color.match(/\d+/g).map(Number);
    return '#' + [r, g, b].map(value => value.toString(16).padStart(2, '0')).join('');
}

/**
 * The column headers of the first milestone on the board.
 */
function columnHeaders() {
    return [...document.querySelector('div.milestone.box-body').querySelectorAll('.box-header[data-field-status]')];
}

function columnHeader(name) {
    return columnHeaders().find(header => header.dataset.fieldStatus === name);
}

export default function (assert) {
    return steps(assert)
        .given('The issue statuses of the project are\n$table', function (table) {
            let project = server.schema.projects.find(1);

            table.forEach(row => {
                let attributes = { name: row.name, sortOrder: parseInt(row.sortOrder), color: row.color };
                let status = server.schema.issuestatuses.findBy({ name: row.name });

                status ? status.update(attributes) : server.create('issuestatus', { ...attributes, projectId: project.id });
            });
        })
        .then('The board columns are $names', function (names) {
            let columns = columnHeaders().map(header => header.dataset.fieldStatus);
            assert.deepEqual(columns, names.split(',').map(name => name.trim()));
        })
        .then('The $name column header is coloured $color', function (name, color) {
            assert.equal(hexOf(getComputedStyle(columnHeader(name)).borderTopColor), color);
        })
        .then('The $name column header shows the label $label', function (name, label) {
            assert.equal(columnHeader(name).innerText.replace(/\(\d+\)/, '').trim(), label);
        })
        .then('The issue status badge is coloured $color', function (color) {
            let badge = document.querySelector('[data-field="issue.status"].badge');
            assert.equal(hexOf(getComputedStyle(badge).backgroundColor), color);
        });
}
