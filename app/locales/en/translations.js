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
      "create" : "Create",
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
    "ago" : "ago",
    "outof" : "out of",
    "module" : {
      "singular" : {
        "project" : "Project",
        "issue" : "Issue",
        "wiki" : "Wiki",
        "conversation" : "Conversation",
        "report" : "Report",
        "timelog" : "Time Log",
        "activity" : "Activity",
        "tag" : "Tag",
        "user" : "User",
        "member" : "Member",
        "vote" : "Vote",
        "comment" : "Comment",
        "role" : "Role",
        "milestone" : "Milestone",
        "file" : "File",
      },
      "plural" : {
        "project" : "Projects",
        "issue" : "Issues",
        "wiki" : "Wiki",
        "conversation" : "Conversations",
        "report" : "Reports",
        "timelog" : "Time Logs",
        "activity" : "Activities",
        "tag" : "Tags",
        "user" : "Users",
        "member" : "Members",
        "vote" : "Votes",
        "comment" : "Comments",
        "role" : "Roles",
        "milestone" : "Milestones",
        "file" : "Files",
      }
    }
  },

  /**
    These are the emoji translations
  */
  "emoji" : {
    'grinning' : 'grin',
    'joy' : 'joy',
    'rolling-on-the-floor-laughing' : 'rofl',
    'smile' : 'smile',
    'sweat-smile' : 'sweat smile',
    'laughing' : 'laughing',
    'wink' : 'wink',
    'blush' : 'blush',
    'yum' : 'yum',
    'smiling-face-with-sunglasses' : 'cool',
    'heart-eyes' : 'heart eyes',
    'slightly-smiling-face' : 'slight smile',
    'thinking-face' : 'thinking',
    'neutral-face' : 'neutral',
    'expressionless' : 'expressionless',
    'no-mouth' : 'no mouth',
    'face-with-rolling-eyes' : 'rolling eyes',
    'smirk' : 'smirk',
    'persevere' : 'persevere',
    'disappointed-but-relieved-face' : 'disappointed relieved',
    'open-mouth' : 'open mouth',
    'zipper-mouth-face' : 'zipper mouth',
    'hushed' : 'hushed',
    'sleepy' : 'sleepy',
    'tired-face' : 'tired face',
    'sleeping' : 'sleeping',
    'nerd-face' : 'nerd',
    'stuck-out-tongue' : 'stuck out tongue',
    'stuck-out-tongue-winking-eye' : 'stuck out tongue winking',
    'drooling-face' : 'drooling',
    'unamused' : 'unamused',
    'sweat' : 'sweat',
    'pensive' : 'pensive',
    'confused' : 'confused',
    'upside-down-face' : 'upside down',
    'money-mouth-face' : 'moneyn mouth',
    'astonished' : 'astonished',
    'slightly-frowning-face' : 'frowning',
    'confounded' : 'confounded',
    'disappointed' : 'disappointed',
    'worried' : 'worried',
    'triumph' : 'triumph',
    'cry' : 'cry',
    'sob' : 'sob',
    'frowning-face' : 'frown',
    'fearful' : 'fearful',
    'weary' : 'weary',
    'grimacing' : 'grimacing',
    'cold-sweat' : 'cold sweat',
    'scream' : 'scream',
    'dizzy-face' : 'dizzy face',
    'rage' : 'rage',
    'angry' : 'angry',
    'innocent' : 'innocent',
    'face-with-cowboy-hat' : 'cowboy',
    'clown-face' : 'clown',
    'mask' : 'mask',
    'face-with-thermometer' : 'thermometer',
    'face-with-head-bandage' : 'head bandage',
    'nauseated-face' : 'nauseated',
    'sneezing-face' : 'sneezing',
    'smiling-imp' : 'imp',
    'skull' : 'skull',
    'alien' : 'alien',
    'v' : 'victory',
    'hand-with-index-and-middle-fingers-crossed-type-1-2' : 'fingers crossed',
    'ok-hand' : 'OK',
    'thumbsup' : 'thumbsup',
    'thumbsdown' : 'thumbsdown',
    'clap' : 'clap',
    'zzz' : 'zzz',
    'sunglasses' : 'sunglasses',
    'ant' : 'bug',
    'hamburger' : 'burger',
    'pizza' : 'pizza',
    'fries' : 'fries',
    'popcorn' : 'popcorn',
    'coffee' : 'coffee',
    'first-place-medal' : 'first',
    'second-place-medal' : 'second',
    'third-place-medal' : 'third',
    'military-medal' : 'medal',
    'checkered-flag' : 'finish',
    'skull-and-crossbones' : 'skull crossbones',
    'alarm-clock' : 'alarm',
    'watch' : 'time',
    'tada' : 'tada',
    'ribbon' : 'ribbon',
    'stopwatch' : 'stopwatch',
    'bulb' : 'bulb',
    'moneybag' : 'moneybag',
    'money-with-wings' : 'money with wings',
    'date' : 'calendar',
    'chart-with-upwards-trend' : 'rise',
    'chart-with-downwards-trend' : 'fall',
    'anger' : 'anger',
    'no-entry' : 'no entry',
    'no-entry-sign' : 'ban',
    'radioactive' : 'nuclear',
    'heavy-check-mark' : 'checkmark',
    'x' : 'cross',
    'bangbang' : 'double exclamation',
    'interrobang' : 'interrobang',
    'question' : 'question',
    'exclamation' : 'exclamation',
    '100' : '100',
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
      //"activity": "Activity",
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
        "detail" : {
          "status." : "Loading ..",
          "members" : "Members",
          "viewallmembers" : "View all members",
          "description" : "Project description",
          "startdate" : "Start date",
          "enddate" : "End date",
          "status" : "Status",
          "type" : "Type",
          "duration" : "Duration",
          "owner" : "Project Owner",
          "vision" : "Project Vision",
          "estimatedBudget" : "Budget Estimated",
          "spentBudget" : "Budget Spent",
          "issueratio" : "Issue Distribution Ratio",
          "conversations" : "Conversations",
          "viewallconversations" : "View all conversations",
          "latestissues" : "Latest Issues",
          "viewallissues" : "View all issues",
          "estimatedspent" : "Estimated Time vs Spent Time",
          "summary" : "Project Summary",
          "teamsize" : "Team Size",
          "openissues" : "Open Issues",
          "closedissues" : "Closed Issues",
          "estimatedtime" : "Total Estimated Time",
          "spenttime" : "Total Time Spent",
          "projectactivities" : "Project Activities",
          "milestones" : "Project Milestones",
          "managemilestones" : "Manage Milestones",
          "managemembers" : "Manage Members",
          "lists" : {
            "status." : "Loading ..",
            "status" : {
              "in_progress" : "In Progress",
              "new" : "New",
              "closed" : "Closed",
              "completed" : "Complete",
              "pending" : "Pending",
              "deferred" : "Deferred",
            },
            "type." : "Loading ..",
            "type" : {
              "civil" : "Civil",
              "software" : "Software",
              "business" : "Business",
              "architecture" : "Architecture",
              "government" : "Government",
              "other" : "Other",
            },
          },
          "charts" : {
            "estimatedspent" : "Estimated vs Spent (Time in %)",
            "efficiency" : "Efficiency"
          },
          "milestone" : {
            "overdue" : "overdue",
            "progress" : "{{closed}} out of {{total}} issues complete",
          }
        },
        "filter":{
          "name" : "Name",
          "type" : "Type",
          "status" : "Status",
          "shortCode" : "Short Code",
        },
      },

      "conversation" : {
        "label" : "Conversations",
        "create" : "Start a new conversation ..",
        "start" : "Start a new conversation",
        "messagebox" : "Write a comment ..",
        "created" : "A new conversation by the name {{name}} has been added",
        "comments" : "comments",
        "upvote" : "Upvote",
        "post" : "Post",
        "votes": "votes",
        "voted" : "Your vote has been registered",
        "you" : "You ",
        "vote" : {
          "upvote" : "Upvotes",
          "downvote" : "Downvotes",
          "agree" : " are in agreement",
          "disagree" : " are in disagreement",
          "clickup" : "click to upvote",
          "clickdown" : "Click to downvote",
          "voted" : "Your vote has been registered",
        },
        "new" : {
          "subject" : "Subject",
          "description" : "Topic",
          "type" : "Type",
          "roomType" : [
            {"value": "discussion", "label": "Discussion"},
            {"value": "vote", "label": "Vote"},
          ]
        },
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

      "issue" : {
        "priority" : "priority",
        "status" : "Status",
        "lists" : {
          "priority" : {
            "blocker" : "Blocker",
            "critical" : "Critical",
            "high" : "High",
            "medium" : "Medium",
            "low" : "Low",
            "lowest" : "Lowest",
          },
          "status" : {
            "done" : "Done",
            "complete" : "Complete",
            "new" : "New",
            "in_progress" : "In Progress",
            "pending" : "Pending",
            "closed" : "Closed",
            "deferred" : "Deferred",
            "feedback" : "Feedback",
          },
        },
      },

      "chat" : {
        "messagebox" : "Type a message ..",
        "send" : "Send",
      },

      "activity" : {
        "created" : "created the",
        "closed" : "closed the",
        "updated" : "updated the",
        "related" : {
          "created" : "created a",
          "updated" : "updated a",
          "completed" : "marked completed a",
          "attached" : "added a",
          "overdue" : "is overdue",
        }
      },

      "milestone" : {
        "lists" : {
          "status." : "Loading ..",
          "status" : {
            "complete" : "Complete",
            "closed" : "Closed",
            "in_progress" : "In Progress",
            "planned" : "Planned",
            "overdue" : "Overdue",
            "deferred" : "Deferred",
            "failed" : "Failed",
          },
          "type." : "Loading ..",
          "type" : {
            "version" : "Version",
            "sprint" : "Sprint",
            "patch" : "Patch",
            "release" : "Release",
            "milestone" : "Milestone",
          },
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
