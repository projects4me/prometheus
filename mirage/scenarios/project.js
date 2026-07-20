import _ from 'lodash';
import createFullAcl from '../helpers/create-full-acl';

export default function (server) {
    server.createList('dashboard', 10);
    server.createList('issuetype', 5);
    server.createList('issuestatus', 5);
    server.createList('user', 10);
    createFullAcl(server);

    //setting up relationship for user
    const USER = server.schema.users.all();
    USER.models.forEach((model) => {
        model.update({
            dashboard: server.schema.dashboards.find(_.random(1, 10))
        })
    });

}