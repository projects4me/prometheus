/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@ember/component';
import ENV from "prometheus/config/environment";
import { inject } from '@ember/service';
import $ from 'jquery';

/**
 * This component is used to render the application header
 *
 * @class ApplicationControlbar
 * @namespace Prometheus.Components
 * @extends Ember.Component
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default Component.extend({

    /**
     * This is the socket service for the application
     *
     * @property websockets
     * @type Ember.Service
     * @for ApplicationControlbar
     */
    websockets: inject('socket-io'),

    /**
     * The current user of the application
     *
     * @property currentUser
     * @type Ember.Service
     * @for ApplicationControlbar
     */
    currentUser: inject('current-user'),

    /**
     * The tag to be used for this component
     *
     * @property tagName
     * @for ApplicationControlbar
     * @type String
     * @private
     */
    tagName: 'aside',

    /**
     * The classes to be rendered with the element
     *
     * @property classNames
     * @for ApplicationControlbar
     * @type Array
     * @private
     */
    classNames: ["control-sidebar control-sidebar-dark"],

    /**
     * This function enables the control sidebar
     *
     * @method didInsertElement
     * @for ApplicationControlbar
     * @protected
     */
    didInsertElement(){
        $.AdminLTE.controlSidebar.activate();
        this._super(...arguments);
        let _self = this;
        _self.users = [];
        _self.appPrefix = ENV.api.prefix;
        _self.serverURI = ENV.chat.protocol+'://'+ENV.chat.host+':'+ENV.chat.port+'/?id=1';
        Logger.debug(_self.get('websockets'));
        if (ENV.environment === 'production') {
            const socket = _self.get('websockets').socketFor(this.serverURI);
            socket.on('connect', _self.onConnect, _self);
            socket.on('message', _self.onMessage, _self);
            socket.on('userList', _self.onUserList, _self);
            socket.on('userJoined', _self.onUserJoined, _self);
            socket.on('userLeft', _self.onUserLeft, _self);
        }
    },


    onConnect(data) {
        Logger.debug('Connection established');
        Logger.debug(data);
        let _self = this;
        const socket = _self.get('websockets').socketFor(this.serverURI);

        socket.emit('register',{id:_self.get('currentUser.user.id'),name:_self.get('currentUser.user.name')});
        socket.emit('messageRoom', {room:'/abc/public',message:"Here I am"});
        socket.emit('list');
    },

    onUserJoined(data){
        Logger.debug('A user has joined');
        Logger.debug(data);
        const socket = this.get('websockets').socketFor(this.serverURI);
        socket.emit('list');
    },

    onUserLeft(data){
        Logger.debug('A user has left');
        Logger.debug(data);
        const socket = this.get('websockets').socketFor(this.serverURI);
        socket.emit('list');
    },

    onMessage(data) {
        Logger.debug('A message has been received');
        let _self = this;
        if (typeof _self.gotMessage === 'function')
        {
            _self.sendAction('gotMessage',data);
        }
    },

    onUserList(data) {
        Logger.debug('Received user list');
        // This is executed within the ember run loop
        this.set('users',data);
        this.users = data;
        Logger.debug(data);
    },

    willDestroyElement() {
        let _self = this;
        const socket = _self.get('websockets').socketFor(_self.serverURI);

        socket.off('connect', _self.onConnect);
        socket.off('message', _self.onMessage);
        socket.off('userList', _self.onUserList);
        socket.off('userJoin', _self.onUserJoined);
        socket.off('userLeft', _self.onUserLeft);
    },

    /**
     * These are the actions handled by this controller
     *
     * @property actions
     * @type Object
     * @for ApplicationControlbar
     */
    actions:{

        /**
         * This action is called in order to start a chat with a user
         *
         * @param user
         * @public
         */
        startchat(user){
            Logger.debug('Prometheus.Components.ApplicationControlbar::startchat');
            let _self = this;

            if (typeof _self.initChat === 'function')
            {
                _self.sendAction('initChat',user);
            }

            Logger.debug('-Prometheus.Components.ApplicationControlbar::startchat');
        }
    }

});
