import { createServer } from 'miragejs';
import { discoverEmberDataModels } from "ember-cli-mirage";
import Context from './yadda-context/context';
import ENV from "prometheus/config/environment";
import * as Activity from './route-handlers/activity';
import * as Chatroom from './route-handlers/chatroom';
import * as Comment from './route-handlers/comment';
import * as Conversationroom from './route-handlers/conversationroom';
import * as Converser from './route-handlers/converser';
import * as Dashboard from './route-handlers/dashboard';
import * as Issue from './route-handlers/issue';
import * as Issuestatus from './route-handlers/issuestatus';
import * as Issuetype from './route-handlers/issuetype';
import * as Membership from './route-handlers/membership';
import * as Milestone from './route-handlers/milestone';
import * as Project from './route-handlers/project';
import * as Role from './route-handlers/role';
import * as Savedsearch from './route-handlers/savedsearch';
import * as Tag from './route-handlers/tag';
import * as Tagged from './route-handlers/tagged';
import * as Timelog from './route-handlers/timelog';
import * as Token from './route-handlers/token';
import * as Upload from './route-handlers/upload';
import * as User from './route-handlers/user';
import * as Vote from './route-handlers/vote';
import * as Wiki from './route-handlers/wiki';
import * as Permission from './route-handlers/permission';

export function makeServer(config) {
    let finalConfig = {
        ...config,
        models: { ...discoverEmberDataModels(), ...config.models },
        routes,
    };
    let server = createServer(finalConfig);
    return server;
}

function routes() {
    const ctx = new Context();
    this.urlPrefix = ENV.api.host;
    this.namespace = 'api/v' + ENV.api.version;
    this.environment = ENV.environment;

    /**Register routes */
    Activity.register(this, ctx);
    Chatroom.register(this, ctx);
    Comment.register(this, ctx);
    Conversationroom.register(this, ctx);
    Converser.register(this, ctx);
    Dashboard.register(this, ctx);
    Issue.register(this, ctx);
    Issuestatus.register(this, ctx);
    Issuetype.register(this, ctx);
    Membership.register(this, ctx);
    Milestone.register(this, ctx);
    Project.register(this, ctx);
    Role.register(this, ctx);
    Savedsearch.register(this, ctx);
    Tag.register(this, ctx);
    Tagged.register(this, ctx);
    Timelog.register(this, ctx);
    Token.register(this, ctx);
    Upload.register(this, ctx);
    User.register(this, ctx);
    Vote.register(this, ctx);
    Wiki.register(this, ctx);
    Permission.register(this, ctx);
}