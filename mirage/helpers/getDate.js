import _ from 'lodash';

export function createdDate (min, max) {
    return `${luxon.DateTime.now().minus(_.random(min, max), 'days').toFormat('yyyy-MM-dd')} ${luxon.DateTime.now().minus(_.random(1, 24), 'hours').minus(_.random(1,60), 'minutes').minus(_.random(1, 60), 'seconds').minus(_.random(1, 1000), 'milliseconds').toFormat('yyyy-MM-dd')}`;
}

export function modifiedDate (min, max) {
    return `${luxon.DateTime.now().minus(_.random(min, max), 'days').toFormat('yyyy-MM-dd')} ${luxon.DateTime.now().minus(_.random(1, 24), 'hours').minus(_.random(1,60), 'minutes').minus(_.random(1, 60), 'seconds').minus(_.random(1, 1000), 'milliseconds').toFormat('yyyy-MM-dd')}`;
}

export function startDate(min, max) {
    return `${luxon.DateTime.now().minus(_.random(min, max), 'days').toFormat('yyyy-MM-dd')}`;
}

export function endDate(min, max) {
    return `${luxon.DateTime.now().plus(_.random(min, max), 'days').toFormat('yyyy-MM-dd')}`;
}