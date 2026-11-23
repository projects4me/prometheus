/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */
import Modifier from 'ember-modifier';
import { registerDestructor } from '@ember/destroyable';
import { menuPlacement } from 'prometheus/utils/ui/menu-placement';

/**
 * Measures a dropdown menu against its anchor when it is inserted and whenever the window is resized, and reports
 * `{ end, up }` (see `menuPlacement`): `<ul {{place-menu this.anchorSelector this.onPlacement}}>`. The anchor is the
 * closest ancestor matching the selector. The listener is removed when the menu is torn down.
 *
 * @namespace Prometheus.Modifiers
 */
export default class PlaceMenuModifier extends Modifier {
  listener = null;

  constructor(owner, args) {
    super(owner, args);
    registerDestructor(this, () => this.stop());
  }

  modify(element, [selector, callback]) {
    this.stop();
    let measure = () => {
      let anchor = element.closest(selector);

      if (!anchor || typeof callback !== 'function') {
        return;
      }
      let placement = menuPlacement(
        anchor.getBoundingClientRect(),
        { width: element.offsetWidth, height: element.offsetHeight },
        { width: window.innerWidth, height: window.innerHeight },
      );

      // not inside the render that installs the modifier: the callback updates tracked state the template reads
      // and not after the modifier was torn down or replaced
      Promise.resolve().then(() => {
        if (this.listener === measure) {
          callback(placement);
        }
      });
    };

    this.listener = measure;
    window.addEventListener('resize', measure);
    measure();
  }

  stop() {
    if (this.listener) {
      window.removeEventListener('resize', this.listener);
      this.listener = null;
    }
  }
}
