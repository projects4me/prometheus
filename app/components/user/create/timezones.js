/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';

/**
 * This component is used to render dropdown of timezones.
 *
 * @class UserCreateTimezonesComponent
 * @namespace Prometheus.Components
 * @extends Ember.Component
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class UserCreateTimezonesComponent extends Component {

    /**
     * This function prepares and return the list of timezones that will be given to
     * ember power select as an input.
     * 
     * @method get
     */
    get timezonesList() {
        const selectorOptions = moment.tz.names()
            .reduce((timezoneslist, zoneName) => {
                timezoneslist.push({
                    name: zoneName,
                    offset: moment.tz(zoneName).utcOffset()
                });

                return timezoneslist;
            }, [])
            //sort according to timezone idenftifier
            .sort((tz1, tz2) => {
                return tz1.name - tz2.name
            })
            //set preferred abbrevation of timezones
            .reduce((timezoneslist, timezone) => {

                //check if the timezone has offset or not.
                if (timezone.offset) {
                    timezone.preferredzoneAbbr = moment.tz(timezone.name).zoneAbbr();
                    if (!isNaN(timezone.preferredzoneAbbr)) {
                        timezone.preferredzoneAbbr = 'GMT';
                    }
                }
                //if there is no offset then set preferred abbrevation of zone to GMT
                else {
                    timezone.preferredzoneAbbr = 'GMT';
                }

                //Change format of offset. e.g 300 to +05:00
                const offset = timezone.offset ? moment.tz(timezone.name).format('Z') : '';

                timezoneslist.push({
                    label: `${timezone.name} (${timezone.preferredzoneAbbr}${offset})`,
                    value: `${timezone.name}`
                });
                return timezoneslist;
            }, []);

        return selectorOptions;
    }
}
