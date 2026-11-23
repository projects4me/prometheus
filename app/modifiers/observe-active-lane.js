/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4me/LICENSE.txt. Do not remove this line
 */

import Modifier from 'ember-modifier';
import { registerDestructor } from '@ember/destroyable';

/**
 * Reports which Task Board lane is in view while the board scrolls horizontally.
 * Lanes are the children carrying `data-lane-name`. The callback gets the name of
 * the lane that is mostly in view. The observer is disconnected on destroy.
 *
 * @example
 *      <div class="milestone box-body" {{observe-active-lane this.setActiveLane}}>
 *
 * @class ObserveActiveLaneModifier
 * @namespace Prometheus.Modifiers
 * @extends Modifier
 */
export default class ObserveActiveLaneModifier extends Modifier {
	observer = null;

	constructor(owner, args) {
		super(owner, args);
		registerDestructor(this, () => this.stop());
	}

	modify(element, [callback]) {
		this.stop();
		if (typeof IntersectionObserver !== 'function' || typeof callback !== 'function') {
			return;
		}
		// An observer callback only gets the lanes that changed, so keep every lane's last ratio
		const ratios = new Map();
		this.observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					ratios.set(entry.target, entry.isIntersecting ? entry.intersectionRatio : 0);
				});
				let best = null;
				ratios.forEach((ratio, lane) => {
					if (ratio > 0 && (!best || ratio > best.ratio)) {
						best = { lane, ratio };
					}
				});
				if (best) {
					callback(best.lane.getAttribute('data-lane-name'));
				}
			},
			{ root: element, threshold: [0.5, 0.75, 1] }
		);
		element.querySelectorAll(':scope > [data-lane-name]').forEach((lane) => this.observer.observe(lane));
	}

	stop() {
		this.observer?.disconnect();
		this.observer = null;
	}
}
