import _ from 'lodash';

export default function (server) {
    server.createList('dashboard', 10);
    server.createList('issuetype', 5);
    server.createList('issuestatus', 5);
    server.createList('user', 10);

    //setting up relationship for user
    const user = server.schema.users.all();
    user.models.forEach((model) => {
        model.update({
            dashboard: server.schema.dashboards.find(_.random(1, 10))
        })
    });

}