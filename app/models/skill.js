/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Model, { attr } from '@ember-data/model';

/**
 * A skill: instructions in markdown that agents can be granted.
 *
 * @class Skill
 * @namespace Prometheus.Model
 * @extends DS.Model
 */
export default class SkillModel extends Model {
    @attr('string') name;
    @attr('string') version;
    @attr('string') description;
    @attr('string') content;
    @attr('string') dateCreated;
    @attr('string') dateModified;
    @attr('string') modifiedUserName;
}
