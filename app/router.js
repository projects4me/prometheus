/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import config from './config/environment';
import EmberRouter from '@ember/routing/router';

const Router = EmberRouter.extend({
    location: config.locationType,
    rootURL: config.rootURL
});

/*
 * This is the default router mapping
 */
Router.map(function() {
  this.route('index', { path: '/' });
  this.route('app',function() {
    this.route('index',{path:'/'});
    this.route('module',{path:':module'});
    this.route('projects',{path:'project'},function(){
        this.route('create');
        this.route('edit',{path:'/edit/:shortcode'});
    });
    this.route('project',{ path: "project/:shortcode" },function(){
        this.route('wiki',function(){
            this.route('index',{path:'/'});
            this.route('create');
            this.route('page',{path:'/:wiki_name'});
            this.route('edit',{path:'/edit/:wiki_name'});
        });
        this.route('conversation',{path:'conversations'});
        this.route('board');
        this.route('calendar');
        this.route('issue',function(){
            this.route('index',{path:'/'});
            this.route('create');
            this.route('page',{path:'/:issue_number'});
            this.route('edit',{path:'/edit/:issue_number'});
        });
    });
    this.route('user',function(){
      this.route('index',{path:'/'});
      this.route('create');
      this.route('page',{path:'/:user_id'});
      this.route('edit',{path:'/edit/:user_id'});
      this.route('management');
    });
    this.route('admin',function(){
        this.route('index',{path:'/'});
        this.route('create');
        this.route('page',{path:'/:user_id'});
        this.route('edit',{path:'/edit/:user_id'});
    });
    this.route('loading-assets', {path: '/loading-assets'});
    this.route('access-denied');
    this.route('role', function() {
      this.route('page', {path: '/:role_id'});
    });
  });
  this.route('signin', function() {});
  this.route('reset-password');
  this.route('not-found', {path: '/*path'});
});

export default Router;
