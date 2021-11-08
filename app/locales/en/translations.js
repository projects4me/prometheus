/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

/**
 * This is the english language tranlations for the project. For now they are
 * hard coded but in future we would want to load them from the server and
 * we would like to allow people to include their own translations.
 *
 * This should also be possible for plugins to have their own translations.
 *
 * Need to see if we can support rtl
 *
 * @class en
 * @module i18n
 * @namespace Prometheus.Locales
 * @todo Support customizations
 * @author Hammad Hassan <gollomer@gmail.com>
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
        "file" : {
            "units" : {
                "b" : "b",
                "B" : "B",
                "KB" : "KB",
                "Kb" : "Kb",
                "MB" : "MB",
                "Mb" : "Mb",
                "TB" : "TB",
                "Tb" : "Tb",
                "PB" : "PB",
                "Pb" : "Pb",
                "EB" : "EB",
                "Eb" : "Eb",
                "ZB" : "ZB",
                "Zb" : "Zb",
                "YB" : "YB",
                "Yb" : "Yb"
            }
        },
        "form" : {
            "save" : "Save",
            "refresh" : "Refresh",
            "massupdate" : "Mass Update",
            "share" : "Share",
            "discuss" : "Discuss",
            "create" : "Create",
            "cancel" : "Cancel",
            "close" : "Close",
            "delete" : "Delete",
            "search" : "Search",
            "searchPlaceholder" : "Search ...",
            "loading" : "Loading ...",
            "clear" : "Clear",
            "more" : "More",
            "image" : "Image",
            "createnew": "Create New",
            "savesearch" : "Save This Search",
            "toggledd" : "Toggle Dropdown",
            "edit" : "Edit",
            "findDuplicate" : "Find Duplicate",
            "signin" : "Sign In",
            "signout" : "Sign Out",
            "signup" : "Sign Up",
            "deleted" : "The record has been deleted.",
            "modified" : "Modified by <strong>{{user}}</strong> on <strong>{{date}}<strong>",
            "cancelcicked" : "You have made changes, canceling will discard them. Are you sure?",
            "deletecicked" : "You are you about to delete this record, the record cannot be recovered. Are you sure?",
            "confirmcancel" : "Yes",
            "onsecondthought" : "Take me back",
            "upload" : {
                "drop" : "Drop to upload",
                "invalid" : "Invalid file, cannot upload",
                "uploading" : "Uploading {{length}} files. ({{progress}}%)",
                "drag" : "Drag and drop a file or ",
                "dash" : "-"
            },
            "fields" :{
                "required" : "This field cannot be empty",
            }
        },
        "list": {
            "selectAll": "Select All",
            "selected": "Selected :",
            "deleteAll": "Deleted Selected",
            "exportAll": "Export Selected",
            "updateAll": "Updated Selected",
            "select": "Select",
            "delete": "Deleted",
            "export": "Export",
            "edit": "Edit",
            "detail": "Detail",
            "toggleDropdown": "Toggle Dropdown",
            "nextPage": "Next Page",
            "prevPage": "Previous Page",
            "firstPage": "First Page",
            "last": "Last Page",
            "searchbox" : "Toggle search box",
            "selectedCount" : "(Selected : {{count}}) "
        },
        "noentry": "No entry found..",
        "blank": "<span class='disabled-text'>-- blank --</em>",
        "oops": "Oops! Something went wrong, please contact the system administrator",
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

    /*
     * These are the emoji translations
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
    "views":{

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
            "title" : "<b>Projects</b>4<b>Me</b>",
            "error" : "Invalid username or password"
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
                "created" : "Project <strong>{{name}}</strong> has been created successfully",
                "updated" : "Project <strong>{{name}}</strong> has been updated successfully",
                "fields" : {
                    "name" : "Name",
                    "shortCode" : "Short Code",
                    "description" : "Project Summary",
                    "type" : "Type",
                    "assignee" : "Owner",
                    "status" : "Status",
                    "scope" : "Scope",
                    "vision" : "Vision",
                    "startdate" : "Start Date",
                    "enddate" : "End Date",
                    "issuetypes" : "Issue Types",
                    "hasIssuetypes" : "Issue Types"
                },
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
                    "membership" : {
                        "add" : "Add a new member",
                        "selectrole" : "Select a role",
                        "role" : "Role of the new member",
                        "selectuser" : "Select a new member",
                        "user" : "Member",
                        "added" : "<strong>{{user}}</strong> has been added to the project as <strong>{{role}}</strong>",
                        "missing" : "Both the user and role selection is required"
                    },
                    "charts" : {
                        "estimatedspent" : "Estimated vs Spent (Time in %)",
                        "efficiency" : "Efficiency"
                    },
                    "milestone" : {
                        "overdue" : "overdue",
                        "progress" : "{{closed}} out of {{total}} issues complete",
                        "noentry" : "No milestone found for the project, please create one",
                        "add" : "Add a Milestone",
                        "manage" : "Manage Milestone",
                        "inputname" : "Please specify the name of the milestone",
                        "name" : "Name",
                        "inputdescription" : "Please specify the description of the milestone",
                        "description" : "Description",
                        "inputenddate" : "Please specify the end date of the milestone",
                        "enddate" : "End Date",
                        "inputstartdate" : "Please specify the start date of the milestone",
                        "startdate" : "Start Date",
                        "inputtype" : "Please specify the type of the milestone",
                        "type" : "Type",
                        "inputstatus" : "Please specify the status of the milestone",
                        "status" : "Status",
                        "added" : "Milestone with name <strong>{{name}}</strong> has been added",
                        "missing" : "Name, Start Date, End Date, Type and Status are all required",
                    }
                },
                "filter" : {
                    "name" : "Name",
                    "type" : "Type",
                    "status" : "Status",
                    "shortCode" : "Short Code",
                },
                "edit" : {
                    "header" : "Edit Project"
                },
                "create" : {
                    "header" : "Create Project",
                    "project" : "Project Information",
                    "name" : "Name",
                    "shortcode" : "Short Code",
                    "description" : "Project Summary",
                    "type" : "Type",
                    "assignee" : "Owner",
                    "selectassignee" : "Select the owner of the project",
                    "status" : "Status",
                    "scope" : "Scope",
                    "vision" : "Vision",
                    "startdate" : "Start Date",
                    "enddate" : "End Date",
                    "people" : "People",
                    "nameplaceholder" : "Enter a name",
                    "descriptionplaceholder" : "Enter project summary",
                    "enddateplaceholder" : "Enter the target end date",
                    "startdateplaceholder" : "Enter the project start date",
                    "typeplaceholder" : "Select the type of project",
                    "statusplaceholder" : "Which status is the project in?",
                    "visionholder" : "What is the project vision",
                    "scopeplaceholder" : "What is the project scope",
                    "created" : "<strong>{{name}}</strong> created successfully",
                    "issuetypes" : "Issue Types",
                    "selectissuetypes" : "Select issue type this project will support"
                },
                "list" : {
                    "savedsearch": {
                        "name": "Name of the search",
                        "public": "Public",
                        "missing": "Information missing",
                        "label": "Saved Searches",
                        "shared": "Shared Searches",
                        "apply": "Apply the search",
                        "import": "Import this search",
                        "copied": "The search <strong>{{name}}</strong> has been copied",
                        "added": "The search <strong>{{name}}</strong> has been saved",
                        "updated": "The search <strong>{{name}}</strong> has been updated",
                        "delete": "You are about to delete the saved search <strong>{{name}}</strong>, once deleted it <strong>cannot be recovered</strong>.",
                        "confirmdelete": "<strong>Yes, delete the search!</strong>",
                        "deletecancel": "Phew!! close one.",
                        "onsecondthought": "Hmm, I will just keep it.",
                        "deleted": "The search <strong>{{name}}</strong> has been deleted",
                        "query": "Query : "
                    },
                    "name" : "Name",
                    "type" : "Type",
                    "owner" : "Owner",
                    "description" : "Description",
                    "status" : "Status",
                    "date" : "Date"
                },
                "lists" : {
                    "status." : "Loading ..",
                    "status" : {
                        "new" : "New",
                        "in_progress" : "In Progress",
                        "completed" : "Complete",
                        "closed" : "Closed",
                        "pending" : "Pending",
                        "deferred" : "Deferred",
                    },
                    "type." : "Loading ..",
                    "type" : {
                        "scrum" : "Scrum",
                        "kanban" : "Kanban",
                        "civil" : "Civil",
                        "software" : "Software",
                        "business" : "Business",
                        "architecture" : "Architecture",
                        "government" : "Government",
                        "other" : "Other",
                    },
                },
            },

            "conversation" : {
                "fields" : {
                    "subject" : "Subject",
                    "description" : "Topic",
                    "roomType" : "Type",
                    "projectId" : "Project"
                },
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
                "fields":{
                    "name" : "Page Name",
                    "markUp" : "Wiki",
                },
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
                    "files" : "Files",
                    "selectfile" : "select a file to upload",
                    "file" : {
                        "delete" : "You are about to delete the file <strong>{{name}}</strong>, once deleted it <strong>cannot be recovered</strong>.",
                        "confirmdelete" : "<strong>Yes, delete the file!</strong>",
                        "deletecancel" : "Deletion cancelled",
                        "onsecondthought" : "Hmm, I will just keep it.",
                        "deleted" : "File has been deleted",
                        'preview' : "Preview File",
                    }
                },
                "tag":{
                    "select" : "Select tags",
                    "add" : "Add a tag",
                    "create" : "Create a tag",
                    "created" : "Tag by the name <strong>{{name}}</strong> saved",
                    "removed" : "Tag by the name <strong>{{name}}</strong> was removed",
                    "associated" : "Tag by the name <strong>{{name}}</strong> was associated",
                },
                "edit": {
                    "name" : "Name"
                }
            },

            "issue" : {
                "priority" : "priority",
                "status" : "Status",
                "created" : "Issue <strong>{{issueNumber}} : {{name}}</strong> has been created successfully",
                "updated" : "Issue <strong>{{issueNumber}} : {{name}}</strong> has been updated successfully",
                "fields" : {
                    "issueNumber" : "Issue Number",
                    "subject" : "Subject",
                    "description" : "Description",
                    "status" : "Status",
                    "typeId" : "Type",
                    "priority" : "Priority",
                    "milestone" : "Milestone",
                    "owner" : "Owner",
                    "createdBy" : "Created By",
                    "modifiedBy" : "Modified By",
                    "endDate" : "End Date",
                    "startDate" : "Start Date",
                    "dateCreated" : "Date Created",
                    "dateModified" : "Date Modified",
                    "assignee" : "Assignee",
                    "reportedBy" : "Reported User",
                    "parent" : "Parent"
                },
                "list" : {
                    "create" : "Create New",
                    "savedsearch" : {
                        "name" : "Name of the search",
                        "public" : "Public",
                        "missing" : "Information missing",
                        "label" : "Saved Searches",
                        "shared" : "Shared Searches",
                        "apply" : "Apply the search",
                        "import" : "Import this search",
                        "copied" : "The search <strong>{{name}}</strong> has been copied",
                        "added" : "The search <strong>{{name}}</strong> has been saved",
                        "updated" : "The search <strong>{{name}}</strong> has been updated",
                        "delete" : "You are about to delete the saved search <strong>{{name}}</strong>, once deleted it <strong>cannot be recovered</strong>.",
                        "confirmdelete" : "<strong>Yes, delete the search!</strong>",
                        "deletecancel" : "Phew!! close one.",
                        "onsecondthought" : "Hmm, I will just keep it.",
                        "deleted" : "The search <strong>{{name}}</strong> has been deleted",
                        "query" : "Query : "
                    },
                    "sr" : "#",
                    "subject" : "Subject",
                    "status" : "Status",
                    "issuetype" : "Type",
                    "priority" : "Priority",
                    "milestone" : "Milestone",
                    "startDate" : "Start Date",
                    "endDate" : "End Date",
                    "selectedCount" : "(Selected : {{count}}) "
                },
                "detail" : {
                    "issueNumber" : "Issue Number",
                    "subject" : "Subject",
                    "description" : "Description",
                    "status" : "Status",
                    "type" : "Type",
                    "priority" : "Priority",
                    "milestone" : "Milestone",
                    "ownedBy" : "Owner",
                    "createdBy" : "Created By",
                    "duration" : "Duration",
                    "modifiedBy" : "Modified By",
                    "endDate" : "End Date",
                    "startDate" : "Start Date",
                    "dateCreated" : "Date Created",
                    "dateModified" : "Date Modified",
                    "assignedTo" : "Assignee",
                    "reportedBy" : "Reported User",
                    "parent" : "Parent",
                    "files" : "Files",
                    "conversation" : "Conversation",
                    "hierarchy" : "Issue Hierarchy",
                    "estimates" : "Estimates",
                    "selectfile" : "select a file to upload",
                    "issueactivities" : "Issue Activities",
                    "file" : {
                        "delete" : "You are about to delete the file <strong>{{name}}</strong>, once deleted it <strong>cannot be recovered</strong>.",
                        "confirmdelete" : "<strong>Yes, delete the file!</strong>",
                        "deletecancel" : "Deletion cancelled",
                        "onsecondthought" : "Hmm, I will just keep it.",
                        "deleted" : "File has been deleted",
                        'preview' : "Preview File",
                    },
                    "childissues" : {
                        "noentry" : "No child issue found for this issue"
                    },
                    "timelogs" : "Time Logs",
                    "estimate" : {
                        "edit" : "Edit estimate"
                    },
                    "est" : {
                        "edited" : "Time estimated has been updated",
                    },
                    "spent" : {
                        "edited" : "Time log has been updated",
                    },
                    "timelog" : {
                        "log" : "Log Time",
                        "estimate" : "Estimate the issue",
                        "inputspenton" : "Which date was the time spent on",
                        "spenton" : "Spent On",
                        "inputdescription" : "What was the time spent on",
                        "description" : "Description",
                        "added" : "Time logged",
                        "estimated" : "Estimate added",
                        "missing" : "Both time and spent date is required to log the time",
                        "estmissing" : "Both time and description is required to log the time",
                        "on" : " logged time on ",
                        "noentry" : "No time logged against this issue",
                        "noestimates" : "No time estimated for this issue",
                        "estimatedon" : " estimated on ",
                        "d" : "d",
                        "h" : "h",
                        "m" : "m",
                        "edit" : "Edit time log",
                        "delete" : "Delete time log",
                        "estimates" : "Estimates",
                    }
                },
                "edit" : {
                    "page" : "Edit Issue : <strong>#{{issueNumber}} - {{name}}</strong>",
                    "files" : "Files",
                    "people" : "People"
                },
                "create" : {
                    "title" : "Create Issue",
                    "issueNumber" : "Issue Number",
                    "subject" : "Subject",
                    "description" : "Description",
                    "status" : "Status",
                    "type" : "Type",
                    "placeholder" : {
                        "subject" : "Enter the issue subject ..",
                        "startDate" : "Select start date",
                        "endDate" : "Select end date"
                    },
                    "textlabel" : "Issue Subject",
                    "typeId" : "Type",
                    "priority" : "Priority",
                    "milestone" : "Milestone",
                    "selectmilestone" : "Select a milestone",
                    "ownedBy" : "Owner",
                    "owner" : "Owner",
                    "selectowner" : "Select the owner",
                    "createdBy" : "Created By",
                    "duration" : "Duration",
                    "modifiedBy" : "Modified By",
                    "endDate" : "End Date",
                    "startDate" : "Start Date",
                    "dateCreated" : "Date Created",
                    "dateModified" : "Date Modified",
                    "assignedTo" : "Assignee",
                    "assignee" : "Assignee",
                    "selectassignee" : "Select an assignee",
                    "reportedBy" : "Reported User",
                    "parentId" : "Parent Issue",
                    "parent" : "Parent",
                    "selectparent" : "Select the issue parent",
                    "people" : "People",
                    "estimates" : "Estimates"
                },
                "filter" : {
                    "issueNumber" : "Issue Number",
                    "subject" : "Subject",
                    "description" : "Description",
                    "status" : "Status",
                    "type" : "Type",
                    "priority" : "Priority",
                    "milestone" : "Milestone",
                    "owner" : "Owner",
                    "endDate" : "End Date",
                    "startDate" : "Start Date",
                    "dateCreated" : "Date Created",
                    "dateModified" : "Date Modified",
                    "assignee" : "Assignee",
                    "reportedUser" : "Reported User",
                },
                "lists" : {
                    "priority" : {
                        "medium" : "Medium",
                        "high" : "High",
                        "low" : "Low",
                        "critical" : "Critical",
                        "blocker" : "Blocker"
                    },
                    "status" : {
                        "new" : "New",
                        "in_progress" : "In Progress",
                        "pending" : "Pending",
                        "done" : "Done",
                        "wont_fix" : "Wont't Fix",
                        "feedback" : "Feedback",
                        "deferred" : "Deferred"
                    },
                },
            },

            "tag" : {
                "fields" : {
                    "tag" : "Tag Name"
                },
            },

            "user" : {
              "page" : {
                  "aboutme" : "About Me",
                  "education" : "Education",
                  "skills" : "Skills"
              },
            },

            "chat" : {
                "messagebox" : "Type a message ..",
                "send" : "Send",
            },

            "activity" : {
                "performedActivity" : " performed an activity",
                "created" : "created the",
                "closed" : "closed the",
                "updated" : "updated the",
                "related" : {
                    "created" : "created a",
                    "updated" : "updated a",
                    "completed" : "marked completed a",
                    "attached" : "added a",
                    "overdue" : "is overdue",
                    "deleted" : "deleted a",
                }
            },

            "widgets" : {
                "issuesToday" : {
                    "title" : "Issues Today",
                },
                "weeklyMilestones" : {
                    "title" : "Weekly Milestones",
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

            "board" : {
                "backlog" : "Backlog"
            },

            "components" : {
                "intervalselector" : {
                    "days" : "Days",
                    "hours" : "Hours",
                    "minutes" : "Minutes"
                },
                "modal" : {
                    "times" : "&times;",
                },
                "chatBox" : {
                    "newMessages" : "{{count}} New Messages",
                    "three" : "3"
                },
                "navBar" : {
                    "admin" : "Admin",
                    "information" : "Information",
                    "warning" : "Warning",
                    "important" : "Important"
                }
            },
            /**
             * Most of these are going to be obsolete
             * @todo after control bar fixing we need to remove the redundant entries
             */
            "application" : {
                "controlBar" : {
                    "onlineUser" : "Online Users",
                    "tasksProgress" : "Tasks Progress",
                    "customTemplate" : "Custom Template Design",
                    "seventy" : "70%",
                    "statsTab" : "Stats Tab Content",
                    "generalSettings" : "General Settings",
                    "reportPanel" : "Report panel usage",
                    "settingsInfo" : "Some information about this general settings option",

                },
                "header" : {
                    "title" : "<b>Projects</b>4<b>Me</b>",
                    "supportTeam" : "Support Team",
                    "fiveMins" : " 5 mins",
                    "buyTheme" : "Why not buy a new awesome theme?",
                    "thirteen" : "13",
                    "fiveMembers" : "5 new members joined today",
                    "ten" : "10",
                    "designButtons" : "Design some buttons",
                    "twenty" : "20",
                    "twentyComplete" : "20% Complete",
                    "four" : "4",

                }
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
                "projects": {
                    "label": "Projects",
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
                "board": {
                    "label":"Task Board",
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
                "edit": {
                    "label":"Edit",
                },
            },
        },

        "wiki":{
            "label": "Wiki",

        },

    },
};
