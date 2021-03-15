/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { modifier } from 'ember-modifier';
import $ from 'jquery';

export default modifier((element, element_mask) => {
    /**
     * This function is used in order to do masking on input field depending upon there type e.g numeric, alphanumeric etc
     *
     * @method getMask
     * @param {String} mask
     * @public
     */
    function getMask(mask) {
        const masks = {
            'alpha': {
                'mask': "C",
                'maskTranslation': {
                    "C": { pattern: /^[a-zA-Z\s]+$/, recursive: true }
                }
            },
            'alphanumeric': {
                'mask': "C",
                'maskTranslation': {
                    "C": { pattern: /^[a-zA-Z0-9\s]+$/, recursive: true }
                }
            },
            'email': {
                'mask': "C",
                'maskTranslation': {
                    "C": { pattern: /[\w@\-.+]/, recursive: true }
                }
            }

        };
        return masks[mask];
    }
    let mask = getMask(element_mask);
    //getting element through JQuery '$' and then applying mask to that element.  
    $(element).mask(mask.mask, { translation: mask.maskTranslation });

    return () => {
        $(element).unmask();
    };
});