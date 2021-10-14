export function createdDate (min, max) {
    return `${moment().subtract(_.random(min, max), 'days').format(moment.HTML5_FMT.DATE)} ${moment().subtract(_.random(1, 24), 'hours').subtract(_.random(1,60), 'minutes').subtract(_.random(1, 60), 'seconds').subtract(_.random(1, 1000), 'milliseconds').format(moment.HTML5_FMT.TIME_MS)}`;
}

export function modifiedDate (min, max) {
    return `${moment().subtract(_.random(min, max), 'days').format(moment.HTML5_FMT.DATE)} ${moment().subtract(_.random(1, 24), 'hours').subtract(_.random(1,60), 'minutes').subtract(_.random(1, 60), 'seconds').subtract(_.random(1, 1000), 'milliseconds').format(moment.HTML5_FMT.TIME_MS)}`;
}

export function startDate(min, max) {
    return `${moment().subtract(_.random(min, max), 'days').format(moment.HTML5_FMT.DATE)}`;
}

export function endDate(min, max) {
    return `${moment().add(_.random(min, max), 'days').format(moment.HTML5_FMT.DATE)}`;
}