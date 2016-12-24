/* Licensing : http://legal.projects4.me/LICENSE.txt, please don't remove :) */
/**
  This is the english language tranlations for the project. For now they are
  hard coded but in future we would want to load them from the server and
  we would like to allow people to include their own translations.

  This should also be possible for plugins to have their own translations.

  Need to see if we can support rtl

  @class en
  @module i18n
  @submodule Application
  @namespace Prometheus
  @todo Support customizations
*/
export default {
  /*
    -- Application
    These are the application level translations and they must be included in
    every translation file
 */
  "application": "Projects4Me",
  "company": "Projects4Me Inc.",
  "author": "Hammad Hassan",
  "repository": "https://github.com/gollomer/prometheus",
  "website": "http://projects4.me",
  "copyright": "Copyright © {{year}}",
  "rights": "All rights reserved.",

  /*
    -- Errors
    These are the application level translations and they must be included in
    every translation file
 */
  "errors": {
    "inclusion": "is not included in the list",
    "exclusion": "is reserved",
    "invalid": "is invalid",
    "confirmation": "doesn't match {{attribute}}",
    "accepted": "must be accepted",
    "empty": "can't be empty",
    "blank": "can't be blank",
    "present": "must be blank",
    "tooLong": "is too long (maximum is {{count}} characters)",
    "tooShort": "is too short (minimum is {{count}} characters)",
    "wrongLength": "is the wrong length (should be {{count}} characters)",
    "notANumber": "is not a number",
    "notAnInteger": "must be an integer",
    "greaterThan": "must be greater than {{count}}",
    "greaterThanOrEqualTo": "must be greater than or equal to {{count}}",
    "equalTo": "must be equal to {{count}}",
    "lessThan": "must be less than {{count}}",
    "lessThanOrEqualTo": "must be less than or equal to {{count}}",
    "otherThan": "must be other than {{count}}",
    "odd": "must be odd",
    "even": "must be even"
  },
  /*
    -- Global form labels
    These are the global translations for the forms that we are using. These are
    being declared under the global name so that we don't have to delcare these
    translations individually.
  */
  "global" : {
    "form" : {
      "save" : "Save",
      "cancel" : "Cancel",
      "delete" : "Delete",
      "search" : "Search",
      "edit" : "Edit",
      "findDuplicate" : "Find Duplicate",
      "signin" : "Sign In",
      "signout" : "Sign Out",
      "signup" : "Sign Up",
      "modified" : "Modified by <strong>{{user}}</strong> on <strong>{{date}}<strong>",
    },
    "list": {
      "selectAll": "Select All",
      "deleteAll": "Deleted Selected",
      "exportAll": "Export Selected",
      "updateAll": "Updated Selected",
      "select": "Select",
      "delete": "Deleted",
      "export": "Export",
      "edit": "Edit",
      "detail": "Detail",
      "toggleDropdown": "Toggle Dropdown",
    },
    "noentry": "No entry found..",
    "blank": "<span class='disabled-text'>-- blank --</em>",
  },

  /*
    These labels are related to the views in the system
  */
  "view":{

    /*
      The labels for the signin view
    */
    "signin":{
      "message":"Please sign in to proceed",
      "username": "Username",
      "password": "Password",
      "facebook": "Sign in using Facebook",
      "google": "Sign in using Google+",
      "remember": "Remember Me",
      "or": "- OR -",
      "forgot": "I forgot my password",
    },

    /*
      The labels for the app view
    */
    "app":{
      "member": "Member since ",
      "profile": "Profile",
      "online": "Online",
      "offline": "Offline",
      "away": "away",
      "busy": "busy",
      "activity": "Activity",
      "today": "Today",
      "history": "History",
      "tasks": "You have {{count}} tasks",
      "notifications": "You have {{count}} notifications",
      "messages": "You have {{count}} messages",
      "alltasks": "View all tasks",
      "allnotifications": "View all",
      "allmessages": "View all messages",
      "togglenav": "Toggle Navigation",
      "support": "Support",
      "reportissue": "Report Issue",
      "theme": "Theme <a href='https://github.com/almasaeed2010/AdminLTE'>AdminLTE</a> made with ♥ by <a href='https://almsaeedstudio.com/'>Almsaeed</a>",

      "project":{
          "label":"Project",
          "noproject" : "No project selected",
          "select":"This section is dependant on a project. Please select a project first from the sidebar on right.",
      },

      "wiki":{
          "welcome": "Welcome to Projects4Me documentation tool.",
          "nohome" : "No wiki page found by the name of <strong>Home</strong>, please create one by clicking on the button below",
          "notfound" : "Not found",
          "list":"Wiki List",
          "create":{
            "page" : "Create Page",
            "new" : "Create New Page",
            "name" : "Page Name",
            "parent" : "Parent Page",
          },
          "created" : "Wiki page <strong>{{name}}</strong> has been created successfully",
          "tags" : "Tags",
          "upvote" : "Click to upvote",
          "voted" : "Your vote has been registered",
          "lock" : "Lock",
          "unlock" : "Unlock",
          "page":{
            "edit" : "Edit {{page}} Page",
            "lock" : "Wiki page was {{action}}",
            "unlocked" : "locked",
            "locked" : "unlocked",
            "islocked" : "This page is locked",
            "lockedhead" : "Locked",
            "empty" : "The page you are looking for does not exists or has been deleted, please check the name.",
          },
          "tag":{
            "select" : "Select tags",
            "add" : "Add a tag",
            "create" : "Create a tag",
            "created" : "Tag by the name <strong>{{name}}</strong> saved",
            "removed" : "Tag by the name <strong>{{name}}</strong> was removed",
            "associated" : "Tag by the name <strong>{{name}}</strong> was associated",
          },
      },

    },

    /*
      The labels for the sidebar navigation menu
    */
    "nav":{
      "mainnav": "Main Navigation",
      "selectproject":"Select a project..",
      "menu":{
        "app": {
          "label": "Dashboard",
        },
        "create": {
          "label": "Create",
        },
        "dashboard":{
          "label":"Dashboard",
        },
        "project": {
          "label": "Projects",
          "create": "Create Project",
          "list": "List Projects",
          "import": "Import Projects",
          "export": "Export Projects",
        },
        "issue":{
          "label": "Issues",
          "list": "List Issues",
          "create": "Create Issue",
          "import": "Import Issues",
          "export": "Export Issues",
        },
        "conversation": {
          "label":"Conversations",
        },
        "workflow": {
          "label":"Workflows",
          "create": "Create Workflow",
          "list": "List Workflows",
          "import": "Import Workflows",
          "export": "Export Workflows",
        },
        "report": {
          "label":"Reports",
          "create": "Create Report",
          "list": "List Reports",
          "export": "Export Reports",
        },
        "timelog": {
          "label":"Time Logs",
          "create": "Create Time Log",
          "list": "List Time Logs",
          "import": "Import Time Logs",
          "export": "Export Time Logs",
        },
        "calendar":{
          "label": "Calendar",
        },
        "wiki": {
          "label":"Wiki",
        },
      },
    },

    "wiki":{
        "label": "Wiki",

    },

  },
};
