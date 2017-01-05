/* Licensing : http://legal.projects4.me/LICENSE.txt, please don't remove :) */
import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('index', { path: '/' });
  this.route(config.api.prefix,function() {
    this.route('index',{path:'/'});
    this.route('module',{path:':module'});
    this.route('projectlist',{path:'project'});
    this.route('project',{ path: "project/:projectId" },function(){
      this.route('wiki',function(){
        this.route('index',{path:'/'});
        this.route('create',{path:'/create'});
        this.route('page',{path:'/:wikiName'});
        this.route('edit',{path:'/edit/:wikiName'});
      });
      this.route('conversation',{path:'conversations'});
      this.route('calendar',{path:'calendar'});
    });
/*
    this.route('module',{path:':module'});
    this.route('detail',{path:':module/:id'});
    this.route('create',{path:':module/create'});
    this.route('conversation',{path:'conversations'});
    this.route('wiki',function(){
      this.route('index',{path:'/'});
      this.route('project',{ path: "/:projectId" },function(){
        this.route('create',{path:'/create'});
        this.route('page',{path:'/:wikiName'});
        this.route('edit',{path:'/edit/:wikiName'});
      });
    });
    */
  });
  this.route('signin', { path: '/signin' }, function() {});
});

export default Router;
