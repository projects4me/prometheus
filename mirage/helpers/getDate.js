import _ from 'lodash';
import * as dates from 'prometheus/utils/date';

function daysAgo(min, max) {
    return dates.format(dates.subtract(dates.now(), _.random(min, max), 'days'), 'YYYY-MM-DD');
}

function randomTime() {
    let time = dates.subtract(dates.now(), _.random(1, 24), 'hours');
    time = dates.subtract(time, _.random(1, 60), 'minutes');
    time = dates.subtract(time, _.random(1, 60), 'seconds');
    time = dates.subtract(time, _.random(1, 1000), 'milliseconds');
    return dates.format(time, 'HH:mm:ss.SSS');
}

export function createdDate (min, max) {
    return `${daysAgo(min, max)} ${randomTime()}`;
}

export function modifiedDate (min, max) {
    return `${daysAgo(min, max)} ${randomTime()}`;
}

export function startDate(min, max) {
    return daysAgo(min, max);
}

export function endDate(min, max) {
    return dates.format(dates.add(dates.now(), _.random(min, max), 'days'), 'YYYY-MM-DD');
}
