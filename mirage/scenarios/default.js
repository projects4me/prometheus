export default function (server) {
    server.createList('activity', 5);
    server.createList('chatroom', 5);
    server.createList('comment', 10);
    server.createList('conversationroom', 5);
    server.createList('converser', 5);
    server.createList('dashboard', 10);
    server.createList('issue', 10);
    server.createList('issuetype', 5);
    server.createList('membership', 5);
    server.createList('milestone', 4);
    server.createList('project', 10);
    server.createList('role', 5);
    server.createList('savedsearch', 5);
    server.createList('tag', 5);
    server.createList('tagged', 5);
    server.createList('timelog', 5);
    server.createList('token', 1);
    server.createList('upload', 5);
    server.createList('user', 10);
    server.createList('vote', 5);

    //setting up relationship for activity model
    const activity = server.schema.activities.all();
    activity.models.forEach((model) => {
        model.update({
            createdBy: server.schema.users.find(model.createdUser),
            project: server.schema.projects.find(model.relatedId)
        })
    });

    //setting up relationship for chatroom model
    const chatroom = server.schema.chatrooms.all();
    chatroom.models.forEach((model) => {
        model.update({
            conversers: server.schema.users.find([_.random(1, 5), _.random(6, 10)]),
            ownedBy: server.schema.users.find([_.random(6, 10), _.random(1, 5)]),
            comments: server.schema.comments.all()
        })
    })

    //setting up relationship for comment model
    const comment = server.schema.comments.all();
    comment.models.forEach((model) => {
        model.update({
            createdby: server.schema.users.find(model.createdUser),
            conversationroom: server.schema.conversationrooms.find(1)
        })
    })

    //setting up relationship for conversationroom model
    const conversationroom = server.schema.conversationrooms.all();
    conversationroom.models.forEach((model) => {
        model.update({
            createdBy: server.schema.users.find(model.createdUser),
            modifiedBy: server.schema.users.find(model.modifiedUser),
            project: server.schema.projects.find(_.random(1, 10)),
            comments: server.schema.comments.all(),
            votes: server.schema.votes.all()
        })
    })

    //setting up relationship for issue model
    const issue = server.schema.issues.all();
    issue.models.forEach((model) => {
        model.update({
            assignedTo: server.schema.users.find(_.random(1, 10)),
            createdBy: server.schema.users.find(model.createdUser),
            modifiedBy: server.schema.users.find(model.modifiedUser),
            ownedBy: server.schema.users.find(model.owner),
            reportedBy: server.schema.users.find(model.reportedUser),
            project: server.schema.projects.find(_.random(1, 10)),
            milestone: server.schema.milestones.find(_.random(1, 4)),
            parentissue: server.schema.issues.find(_.random(1, 10)),
            issuetype: server.schema.issuetypes.find(_.random(1, 5)),
            // estimated: hasMany timelog,
            // spent : hasMany timelog,
            childissues: server.schema.issues.find([_.random(1, 4), _.random(5, 8), _.random(9, 10)]),
            comments: server.schema.comments.all(),
            activities: server.schema.activities.all(),
            // files: hasMany upload
        })
    })


    //setting up relationship for project model
    const project = server.schema.projects.all();
    project.models.forEach((model) => {
        model.update({
            owner: server.schema.users.find(_.random(1, 10)),
            createdBy: server.schema.users.find(_.random(1, 10)),
            modifiedBy: server.schema.users.find(_.random(1, 10)),
            members: server.schema.users.all(),
            // conversations
            // issues: server.schema.issues.all(),
            roles: server.schema.roles.all(),
            memberships: server.schema.memberships.all(),
            milestones: server.schema.milestones.all(),
            issuetypes: server.schema.issuetypes.all(),
        })
    });

    //setting up relationship for timelog
    const timelog = server.schema.timelogs.all();
    timelog.models.forEach((model) => {
        model.update({
            // createdBy: 
            // modifiedBy:
        })
    })
    debugger;
}