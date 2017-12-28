/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
    location: config.locationType,
    rootURL: config.rootURL
});

/*
 * This is the default router mapping
 */
Router.map(function() {
    this.route('index', { path: '/' });
    this.route(config.api.prefix,function() {
        this.route('index',{path:'/'});
        this.route('module',{path:':module'});
        this.route('projects',{path:'project'},function(){
            this.route('create',{path:'/create'});
            this.route('edit',{path:'/edit/:projectId'});
        });
        this.route('project',{ path: "project/:projectId" },function(){
            this.route('wiki',function(){
                this.route('index',{path:'/'});
                this.route('create',{path:'/create'});
                this.route('page',{path:'/:wikiName'});
                this.route('edit',{path:'/edit/:wikiName'});
            });
            this.route('conversation',{path:'conversations'});
            this.route('board',{path:'board'});
            this.route('calendar',{path:'calendar'});
            this.route('issue',function(){
                this.route('index',{path:'/'});
                this.route('create',{path:'/create'});
                this.route('page',{path:'/:issueNumber'});
                this.route('edit',{path:'/edit/:issueNumber'});
            });
        });
    });
    this.route('signin', { path: '/signin' }, function() {});
});

export default Router;
