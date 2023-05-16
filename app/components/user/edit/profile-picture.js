/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import AppComponent from 'prometheus/components/app';
import { action } from '@ember/object';

/**
 * This component renders user profile picture.
 *
 * @class UserEditProfilePictureComponent
 * @namespace Prometheus.Components
 * @extends AppComponent
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class UserEditProfilePictureComponent extends AppComponent {

    /**
     * This function opens image file selection dialog box.
     * 
     * @method selectImage
     */    
    @action selectImage() {
        $('#upload-img').click();
    }
}
