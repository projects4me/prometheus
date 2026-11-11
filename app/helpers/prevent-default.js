/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { helper } from '@ember/component/helper';

/**
 * Wraps a handler for the {{on}} modifier so that it calls event.preventDefault() first,
 * which is what the removed {{action}} modifier did on its own. Use it on anchors with a
 * real href (including "#") so that the browser does not follow the link.
 * The handler is called with the extra arguments and then the event.
 *
 * Usage: <a href="#" {{on "click" (prevent-default this.save model)}}>
 *
 * @method preventDefault
 * @param {Array} params the handler followed by its arguments
 * @return {Function} the handler to pass to {{on}}
 */
export function preventDefault([handler, ...args]) {
    return function (event) {
        event.preventDefault();
        return handler(...args, event);
    };
}

export default helper(preventDefault);
