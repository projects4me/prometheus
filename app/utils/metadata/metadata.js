/* Licensing : http://legal.projects4.me/LICENSE.txt, please don't remove :) */
import Ember from "ember";
import _ from "lodash";

/**
  The meta is the main object storing the different types of metaata that the
  application makes use of

  @class MetadataUtil
  @extends Ember.Object
  @author Hammad Hassan gollomer@gmail.com
  @todo Allow the metadata to be retrived from the server
*/
export default Ember.Object.extend({

  /**
    The list of modules in the system and their default behaviors

    @property modules
    @type Object
    @for MetadataUtil
    @private
  */
  modules:{
    "dashboard":{
      "nav": true,
    },
    "project":{
      "nav": true,
    },
    "issue":{
      "nav": true,
    },
    "conversation":{
      "nav": true,
    },
    "workflow":{
      "nav": true,
    },
    "report":{
      "nav": true,
    },
    "timelog":{
      "nav": true,
    },
    "calendar":{
      "nav": true,
    },
    "wiki":{
      "nav": true,
    }
  },

  /**
    The metadata for the views in the sysetm. I want to built all the views via
    metadata, this allow me to built very extendible views and application in
    return.

    @property views
    @type Object
    @for MetadataUtil
    @private
  */
  views: {
    Navigation: {
      items: {
      Dashboard: {
        label: 'view.nav.menu.dashboard.label',
        icon: 'dashboard',
        route: 'app',
        anchorRoute: '',
        routeParams: null
      },
      Project: {
        label: 'view.nav.menu.project.label',
        icon: 'briefcase',
        route: 'app.module',
        anchorRoute: 'project',
        routeParams: {module: 'project'},
        actions: {
          section1: {
            list: {
              label: 'view.nav.menu.project.list',
              route: 'app.module',
              className: 'text-teal',
              anchorRoute: 'project',
              routeParams: {module: 'project'}
            },
            create: {
              label: 'view.nav.menu.project.create',
              route: 'app.create',
              className: 'text-red',
              anchorRoute: 'project/create',
              routeParams: {module: 'project'}
            }
          },
          section2:{
            import:{
              label: 'view.nav.menu.project.import',
              route: 'app.import',
              anchorRoute: 'project/import',
              routeParams: {module: 'project'}
            },
            export:{
              label: 'view.nav.menu.project.export',
              route: 'app.export',
              anchorRoute: 'project/export',
              routeParams: {module: 'project'}
            }
          }
        }
      },
      Issue:{
        label: 'view.nav.menu.issue.label',
        icon: 'tasks',
        route: 'app.module',
        anchorRoute: 'issue',
        routeParams: {module: 'issue'},
        actions:{
          section1:{
            list:{
              label: 'view.nav.menu.issue.list',
              route: 'app.module',
              className: 'text-teal',
              anchorRoute: 'issue',
              routeParams: {module: 'issue'}
            },
            create:{
              label: 'view.nav.menu.issue.create',
              route: 'app.create',
              className: 'text-red',
              anchorRoute: 'issue/create',
              routeParams: {module: 'issue'}
            }
          },
          section2:{
            import:{
              label: 'view.nav.menu.issue.import',
              route: 'app.import',
              anchorRoute: 'issue/import',
              routeParams: {module: 'issue'}
            },
            export:{
              label: 'view.nav.menu.issue.export',
              route: 'app.export',
              anchorRoute: 'issue/export',
              routeParams: {module: 'issue'}
            }
          }
        }
      },
      Conversation:{
        label: 'view.nav.menu.conversation.label',
        icon: 'comments',
        route: 'app.project.conversation',
        anchorRoute: 'conversation',
        routeParams: null
      },
      Workflow:{
        label: 'view.nav.menu.workflow.label',
        icon: 'puzzle-piece',
        route: 'app.module',
        anchorRoute: 'workflow',
        routeParams: {module: 'workflow'},
        actions:{
          section1:{
            list:{
              label: 'view.nav.menu.workflow.list',
              route: 'app.module',
              className: 'text-teal',
              anchorRoute: 'workflow',
              routeParams: {module: 'workflow'}
            },
            create:{
              label: 'view.nav.menu.workflow.create',
              route: 'app.create',
              className: 'text-red',
              anchorRoute: 'workflow/create',
              routeParams: {module: 'workflow'}
            }
          },
          section2:{
            import:{
              label: 'view.nav.menu.workflow.import',
              route: 'app.import',
              anchorRoute: 'workflow/import',
              routeParams: {module: 'workflow'}
            },
            export:{
              label: 'view.nav.menu.workflow.export',
              route: 'app.export',
              anchorRoute: 'workflow/export',
              routeParams: {module: 'workflow'}
            }
          }
        }
      },
      Report:{
        label: 'view.nav.menu.report.label',
        icon: 'bar-chart',
        route: 'app.module',
        anchorRoute: 'report',
        routeParams: {module: 'report'},
        actions:{
          section1:{
            list:{
              label: 'view.nav.menu.report.list',
              route: 'app.module',
              className: 'text-teal',
              anchorRoute: 'report',
              routeParams: {module: 'report'}
            },
            create:{
              label: 'view.nav.menu.report.create',
              route: 'app.create',
              className: 'text-red',
              anchorRoute: 'report/create',
              routeParams: {module: 'report'}
            }
          },
          section2:{
            export:{
              label: 'view.nav.menu.report.export',
              route: 'app.export',
              anchorRoute: 'report/export',
              routeParams: {module: 'report'}
            }
          }
        }
      },
      Timelog:{
        label: 'view.nav.menu.timelog.label',
        icon: 'clock-o',
        route: 'app.module',
        anchorRoute: 'timelog',
        routeParams: {module: 'timelog'},
        actions:{
          section1:{
            list:{
              label: 'view.nav.menu.timelog.list',
              route: 'app.module',
              className:"text-teal",
              anchorRoute: 'timelog',
              routeParams: {module: 'timelog'}
            },
            create:{
              label: 'view.nav.menu.timelog.create',
              route: 'app.create',
              className: "text-red",
              anchorRoute: 'timelog/create',
              routeParams: {module: 'timelog'}
            }
          },
          section2:{
            import:{
              label: 'view.nav.menu.timelog.import',
              route: 'app.import',
              anchorRoute: 'timelog/import',
              routeParams: {module: 'timelog'}
            },
            export:{
              label: 'view.nav.menu.timelog.export',
              route: 'app.export',
              anchorRoute: 'timelog/export',
              routeParams: {module: 'timelog'}
            }
          }
        }
      },
      Calendar:{
        label: 'view.nav.menu.calendar.label',
        icon: 'calendar',
        route: 'app.project.calendar',
        anchorRoute: 'calendar',
        routeParams: null
      },
      Wiki:{
        label: 'view.nav.menu.wiki.label',
        icon: 'book',
        route: 'app.project.wiki',
        anchorRoute: 'wiki',
        routeParams: null
      }
      }
    },
  },
  /**
    This variable store the business logic for the system, although the basic
    application behavior would be hard coded and would not work through the
    definitions in this object. However, hard coding the business logic
    makes us compromise the flexibility that we would otherwise have. This
    is where the businessLogic meta comes into play, this logic will be
    executed by the application and thus would allow us to extend the
    application behavior. All good but this is complex so will come later :)

    @property businessLogic
    @type Object
    @for MetadataUtil
    @private
    @todo Yet to be implemented :D
  */
  businessLogic:{},

  /**
    This function is used to retrive the metadata for the differnt views in the
    system. The function has the capability of translating the labels as well

    @method getViewMeta
    @param module {String} The module for which we have to retrive the meta
    @param view {String} The view of the module whose meta is required
    @param i18n {Object} The object for the internationalization library
    @return metadata {Object} The requested metadata
  */
  getViewMeta:function(module,view,i18n){
    if (this.views[module] !== undefined && this.views[module][view] !== undefined)
    {
      var meta = this.views[module][view];
      if (view === 'filters')
      {
        _.forEach(meta.enabledFilters,function(value){
          var label = i18n.t(value.label);
          if (label.string !== undefined){
            value.label = label.string;
          }
        });
      }
      return meta;
    }
    return false;
  }
});
