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
        route: 'app.project.issues',
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
    Project:{
      list: {
        fields:{
          name:{
            fieldName: 'name',
            label: 'view.projects.list.name',
            type: 'text',
            sort:true,
            sortPriority:1,
            link:true,
          },
          shortCode:{
            fieldName: 'shortCode',
            type: 'text',
            label: 'view.projects.list.shortcode',
            sort:true,
          },
          dateCreated:{
            fieldName: 'dateCreated',
            type: 'datetime',
            label: 'view.projects.list.dateCreated',
            sort:true,
          },
          dateModified:{
            fieldName: 'dateModified',
            type: 'text',
            label: 'view.projects.list.dateCreated',
            sort:true,
          },
          notes:{
            fieldName: 'notes',
            type: 'textarea',
            label: 'view.projects.list.notes',
            sort:false,
            length:50
          }
        }
      },
      create:{
        buttons:{
          inline: {
            save:{
              name:"save",
              event:"onSave",
              label:"global.form.save"
            },
            cancel:{
              name:"cancel",
              event:"onCancel",
              label:"global.form.cancel"
            }
          },
          dropdown: {
            group1:{
              findDuplicate:{
                name:"findDuplicate",
                event:"onFindDuplicate",
                label:"global.form.findDuplicate"
              },
              findDuplicate2:{
                name:"findDuplicate",
                event:"onFindDuplicate",
                label:"global.form.findDuplicate"
              }

            },
            group2:{
              findDuplicate:{
                name:"findDuplicate",
                event:"onFindDuplicate",
                label:"global.form.findDuplicate"
              }
            }
          }
        },
        sections:{
          section1:{
            label: 'view.projects.create.section1',
            style: 'grid',
            fields:{
              name : {
                fieldName: "name",
                label: "view.projects.create.name",
                size: 'col-xs-6',
                type: 'text',
                required: true,
                errorMsg: 'view.projects.create.name.error',
                filter:'text'
              },
              shortCode:{
                  fieldName: "shortCode",
                  label: "view.projects.create.shortcode",
                  size: 'col-xs-6',
                  type: 'text',
                  help: 'view.projects.create.shortcode.help',
                  required: true,
                  errorMsg: 'view.projects.create.shortcode.error',
                  filter:'alphanumeric'
              },
              type:{
                  fieldName: "type",
                  binding: "model.type",
                  label: "view.projects.create.type",
                  size: 'col-xs-6',
                  type: 'multienum',
                  required: true,
                  errorMsg: 'view.projects.create.type.error',
                  options:[
                        {label: "Software", value: 'software'},
                        {label: "Civil", value: 'civil'}
                  ]
              },
              dateCreated:{
                  fieldName: "dateCreated",
                  binding: "model.dateCreated",
                  label: "view.projects.create.dateCreated",
                  size: 'col-xs-6',
                  type: 'datetime',
                  required: true,
                  filter:'date',
                  errorMsg: 'view.projects.create.dateCreated.error',
              },
              textfield:{
                fieldName:  'textfield',
                binding:  'model.textfield',
                label: 'view.projects.create.textfield',
                size: 'col-xs-6',
                type: 'text',
                required: false,
                length: '100',
                filter:'text',
                errorMsg: 'view.projects.create.textfield.error',
              },
              enumfield:{
                fieldName: 'enumfield',
                binding: 'model.enumfield',
                label: 'view.projects.create.enumfield',
                size: 'col-xs-6',
                type: 'enum',
                required: false,
                length: '100',
                filter:'text',
                errorMsg: 'view.projects.create.enumfield.error',
                options: [
                  {label:'Option 1',value:'option1'},
                  {label:'Option 2',value:'option2'},
                  {label:'Option 3',value:'option3'},
                ]
              },
              multienumfield:{
                fieldName: 'multienumfield',
                binding: 'model.multienumfield',
                label: 'view.projects.create.multienumfield',
                size: 'col-xs-6',
                type: 'multienum',
                required: false,
                length: '100',
                filter:'text',
                errorMsg: 'view.projects.create.multienumfield.error',
                options: [
                  {label:'Option 1',value:'option1'},
                  {label:'Option 2',value:'option2'},
                  {label:'Option 3',value:'option3'},
                ]
              },
              phonefield:{
                fieldName: 'phonefield',
                binding: 'model.phonefield',
                label: 'view.projects.create.phonefield',
                size: 'col-xs-6',
                type: 'phone',
                required: false,
                length: '100',
                errorMsg: 'view.projects.create.phonefield.error',
                mask: "000 000-0000",
                tagName: 'input'
              },
              radiofield:{
                fieldName: 'radiofield',
                binding: 'model.radiofield',
                label: 'view.projects.create.radiofield',
                size: 'col-xs-6',
                type: 'radio',
                required: false,
                length: '100',
                filter:'text',
                errorMsg: 'view.projects.create.radiofield.error',
                options: [
                  {label:'Option 1',value:'option1'},
                  {label:'Option 2',value:'option2'},
                  {label:'Option 3',value:'option3'},
                ]
              },
              datefield:{
                fieldName: 'datefield',
                binding: 'model.datefield',
                label: 'view.projects.create.datefield',
                size: 'col-xs-6',
                type: 'date',
                required: false,
                length: '100',
                errorMsg: 'view.projects.create.datefield.error',
              },
              datetimefield:{
                fieldName: 'datetimefield',
                binding: 'model.datetimefield',
                label: 'view.projects.create.datetimefield',
                size: 'col-xs-6',
                type: 'datetime',
                required: false,
                length: '100',
                errorMsg: 'view.projects.create.datetimefield.error',
              },
              addressfield:{
                fieldName: 'addressfield',
                binding: 'model.addressfield',
                label: 'view.projects.create.addressfield',
                size: 'col-xs-6',
                type: 'address',
                required: false,
                length: '100',
                filter:'text',
                errorMsg: 'view.projects.create.addressfield.error',
              },
              emailfield:{
                fieldName: 'emailfield',
                binding: 'model.emailfield',
                label: 'view.projects.create.emailfield',
                size: 'col-xs-6',
                type: 'email',
                required: false,
                length: '100',
                errorMsg: 'view.projects.create.emailfield.error',
              },
              urlfield:{
                fieldName: 'urlfield',
                binding: 'model.urlfield',
                label: 'view.projects.create.urlfield',
                size: 'col-xs-6',
                type: 'url',
                required: false,
                length: '100',
                filter:'text',
                errorMsg: 'view.projects.create.urlfield.error',
              },
              lookupfield:{
                fieldName: 'lookupfield',
                binding: 'model.lookupfield',
                label: 'view.projects.create.lookupfield',
                size: 'col-xs-6',
                type: 'lookup',
                required: false,
                length: '100',
                filter:'text',
                errorMsg: 'view.projects.create.lookupfield.error',
              },
              multilookupfield:{
                fieldName: 'multilookupfield',
                binding: 'model.multilookupfield',
                label: 'view.projects.create.multilookupfield',
                size: 'col-xs-6',
                type: 'multilookup',
                required: false,
                length: '100',
                filter:'text',
                errorMsg: 'view.projects.create.multilookupfield.error',
              },
              textareafield:{
                fieldName: 'textareafield',
                binding: 'model.textareafield',
                label: 'view.projects.create.textareafield',
                size: 'col-xs-12',
                type: 'textarea',
                required: false,
                length: '100',
                filter:'text',
                errorMsg: 'view.projects.create.textareafield.error',
              },
              linkfield:{
                fieldName: 'linkfield',
                binding: 'model.linkfield',
                label: 'view.projects.create.linkfield',
                size: 'col-xs-6',
                type: 'link',
                required: false,
                length: '100',
                filter:'text',
                errorMsg: 'view.projects.create.linkfield.error',
              },
              imagefield:{
                fieldName: 'imagefield',
                binding: 'model.imagefield',
                label: 'view.projects.create.imagefield',
                size: 'col-xs-6',
                type: 'image',
                required: false,
                length: '100',
                filter:'text',
                errorMsg: 'view.projects.create.imagefield.error',
              },
              integerfield:{
                fieldName: 'integerfield',
                binding: 'model.integerfield',
                label: 'view.projects.create.integerfield',
                size: 'col-xs-6',
                type: 'integer',
                required: false,
                length: '100',
                errorMsg: 'view.projects.create.integerfield.error',
                mask: 'i',
                tagName: 'input',
                maskTranslation: {
                  "i": { pattern: /[0-9]/, recursive: true }
                }
              },
              decimalfield:{
                fieldName: 'decimalfield',
                binding: 'model.decimalfield',
                label: 'view.projects.create.decimalfield',
                size: 'col-xs-6',
                type: 'decimal',
                required: false,
                length: '100',
                errorMsg: 'view.projects.create.decimalfield.error',
                mask: 'd',
                tagName: 'input',
                maskTranslation: {
                  "d": { pattern: /[0-9|.|,]/, recursive: true }
                }
              },
              passwordfield:{
                fieldName: 'passwordfield',
                binding: 'model.passwordfield',
                label: 'view.projects.create.passwordfield',
                size: 'col-xs-6',
                type: 'password',
                required: false,
                length: '100',
                errorMsg: 'view.projects.create.passwordfield.error',
              },
              checkboxfield:{
                fieldName: 'checkboxfield',
                binding: 'model.checkboxfield',
                label: 'view.projects.create.checkboxfield',
                size: 'col-xs-6',
                type: 'checkbox',
                required: false,
                length: '100',
                errorMsg: 'view.projects.create.checkboxfield.error',
              },
            }
          }
        }
      },
      detail:{
        buttons:{
          inline: {
            save:{
              name:"save",
              event:"onSave",
              label:"global.form.save"
            },
            cancel:{
              name:"cancel",
              event:"onCancel",
              label:"global.form.cancel"
            }
          },
          dropdown: {
            group1:{
              findDuplicate:{
                name:"findDuplicate",
                event:"onFindDuplicate",
                label:"global.form.findDuplicate"
              },
              findDuplicate2:{
                name:"findDuplicate",
                event:"onFindDuplicate",
                label:"global.form.findDuplicate"
              }

            },
            group2:{
              findDuplicate:{
                name:"findDuplicate",
                event:"onFindDuplicate",
                label:"global.form.findDuplicate"
              }
            }
          }
        },
        sections:{
          section1:{
            label: 'view.projects.create.section1',
            style: 'grid',
            fields:{
              name : {
                fieldName: "name",
                label: "view.projects.create.name",
                size: 'col-xs-6',
                type: 'text',
                errorMsg: 'view.projects.create.name.error',
              },
              shortCode:{
                  fieldName: "shortCode",
                  label: "view.projects.create.shortcode",
                  size: 'col-xs-6',
                  type: 'text',
                  help: 'view.projects.create.shortcode.help',
                  errorMsg: 'view.projects.create.shortcode.error',
              },
              type:{
                  fieldName: "type",
                  label: "view.projects.create.type",
                  size: 'col-xs-6',
                  type: 'text',
                  errorMsg: 'view.projects.create.type.error',
              },
              dateCreated:{
                  fieldName: "dateCreated",
                  label: "view.projects.create.dateCreated",
                  size: 'col-xs-6',
                  type: 'text',
                  errorMsg: 'view.projects.create.dateCreated.error',
              },
              dateModified:{
                  fieldName: "dateModified",
                  label: "view.projects.create.dateModified",
                  size: 'col-xs-6',
                  type: 'text',
                  errorMsg: 'view.projects.create.dateModified.error',
              },
              startDate:{
                  fieldName: "startDate",
                  label: "view.projects.create.startDate",
                  size: 'col-xs-6',
                  type: 'text',
                  errorMsg: 'view.projects.create.startDate.error',
              },
              endDate:{
                  fieldName: "endDate",
                  label: "view.projects.create.endDate",
                  size: 'col-xs-6',
                  type: 'text',
                  errorMsg: 'view.projects.create.endDate.error',
              },
              modifiedUser:{
                  fieldName: "modifiedUser",
                  label: "view.projects.create.modifiedUser",
                  size: 'col-xs-6',
                  type: 'text',
                  errorMsg: 'view.projects.create.modifiedUser.error',
              },
              createdUser:{
                  fieldName: "createdUser",
                  label: "view.projects.create.createdUser",
                  size: 'col-xs-6',
                  type: 'text',
                  errorMsg: 'view.projects.create.createdUser.error',
              },
              assignee:{
                  fieldName: "assignee",
                  label: "view.projects.create.assignee",
                  size: 'col-xs-6',
                  type: 'text',
                  errorMsg: 'view.projects.create.assignee.error',
              },
              description:{
                  fieldName: "description",
                  label: "view.projects.create.description",
                  size: 'col-xs-6',
                  type: 'textarea',
                  errorMsg: 'view.projects.create.description.error',
              },
              status:{
                  fieldName: "status",
                  label: "view.projects.create.status",
                  size: 'col-xs-6',
                  type: 'text',
                  errorMsg: 'view.projects.create.status.error',
              },
              scope:{
                  fieldName: "scope",
                  label: "view.projects.create.scope",
                  size: 'col-xs-6',
                  type: 'textarea',
                  errorMsg: 'view.projects.create.scope.error',
              },
              vision:{
                  fieldName: "vision",
                  label: "view.projects.create.vision",
                  size: 'col-xs-6',
                  type: 'textarea',
                  errorMsg: 'view.projects.create.vision.error',
              },
            }
          }
        }
      },
      filters:{
        enabledFilters:[
          {
            id: 'Projects.name',
            label: "view.projects.filter.name",
            type: 'string'
          },
          {
            id: 'Projects.shortCode',
            label: "view.projects.filter.shortCode",
            type: 'string',
            operators: ['equal', 'not_equal', 'in', 'not_in', 'is_null', 'is_not_null','contains']
          },
          {
            id: 'Projects.type',
            label: "view.projects.filter.type",
            type: 'integer',
            input: 'select',
            values: {
              'software': 'Software',
              'civil': 'Civil',
            },
            operators: ['equal']
          },
          {
            id: 'Projects.phoneField',
            label: "view.projects.filter.phoneField",
            type: 'string',
            placeholder: '____-____-____',
            operators: ['equal', 'not_equal'],
            validation: {
              format: /^.\({3}\).{3}-.{3}$/
            }
          }
        ]
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
