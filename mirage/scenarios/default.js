import _ from 'lodash';

export default function (server) {
    // server.createList('activity', 5);
    // server.createList('chatroom', 5);
    // server.createList('comment', 10);
    // server.createList('conversationroom', 5);
    // server.createList('converser', 5);
    server.createList('dashboard', 10);
    // server.createList('issue', 10);
    // server.createList('issuetype', 5);
    // server.createList('membership', 5);
    // server.createList('milestone', 4);
    // server.createList('project', 10);
    // server.createList('role', 5);
    // server.createList('savedsearch', 5);
    // server.createList('tag', 5);
    // server.createList('tagged', 5);
    // server.createList('timelog', 5);
    // server.createList('token', 1);
    // server.createList('upload', 5);
    server.createList('user', 10);
    server.createList('userpermission', 1);
    // server.createList('vote', 5);
    // server.createList('wiki', 5);

    // //setting up relationship for activity model
    // const activity = server.schema.activities.all();
    // activity.models.forEach((model) => {
    //     model.update({
    //         createdBy: server.schema.users.find(model.createdUser),
    //         project: server.schema.projects.find(model.relatedId)
    //     });
    // });

    // //setting up relationship for chatroom model
    // const chatroom = server.schema.chatrooms.all();
    // chatroom.models.forEach((model) => {
    //     model.update({
    //         conversers: server.schema.users.find([_.random(1, 5), _.random(6, 10)]),
    //         ownedBy: server.schema.users.find([_.random(6, 10), _.random(1, 5)]),
    //         comments: server.schema.comments.all()
    //     })
    // });

    // //setting up relationship for comment model
    // const comment = server.schema.comments.all();
    // comment.models.forEach((model) => {
    //     model.update({
    //         createdby: server.schema.users.find(model.createdUser),
    //         modifiedBy: server.schema.users.find(model.modifiedUser),
    //         conversationroom: server.schema.conversationrooms.find(_.random(1, 5)),
    //         chatRoom: server.schema.chatrooms.find(_.random(1, 5)),
    //         issue: server.schema.issues.find(1, 10)
    //     });
    // });

    // //setting up relationship for conversationroom model
    // const conversationroom = server.schema.conversationrooms.all();
    // conversationroom.models.forEach((model) => {
    //     model.update({
    //         createdBy: server.schema.users.find(model.createdUser),
    //         modifiedBy: server.schema.users.find(model.modifiedUser),
    //         project: server.schema.projects.find(_.random(1, 10)),
    //         issue: server.schema.issues.find(_.random(1, 10)),
    //         comments: server.schema.comments.all(),
    //         votes: server.schema.votes.all()
    //     });
    // });

    // const converser = server.schema.conversers.all();
    // converser.models.forEach((model) => {
    //     model.update({
    //         chatroom: server.schema.chatrooms.find(_.random(1, 5)),
    //         users: server.schema.users.all()
    //     })
    // })
    // //setting up relationship for issue model
    // const issue = server.schema.issues.all();
    // issue.models.forEach((model) => {
    //     model.update({
    //         assignedTo: server.schema.users.find(_.random(1, 10)),
    //         createdBy: server.schema.users.find(model.createdUser),
    //         modifiedBy: server.schema.users.find(model.modifiedUser),
    //         ownedBy: server.schema.users.find(model.owner),
    //         reportedBy: server.schema.users.find(model.reportedUser),
    //         project: server.schema.projects.find(10),
    //         milestone: server.schema.milestones.find(_.random(1, 4)),
    //         parentissue: server.schema.issues.find(_.random(1, 10)),
    //         issuetype: server.schema.issuetypes.find(_.random(1, 5)),
    //         estimated: server.schema.timelogs.all(),
    //         spent: server.schema.timelogs.all(),
    //         childissues: server.schema.issues.find([_.random(1, 4), _.random(5, 8), _.random(9, 10)]),
    //         comments: server.schema.comments.all(),
    //         activities: server.schema.activities.all(),
    //         files: server.schema.uploads.all()
    //     });
    // });

    // const milestone = server.schema.milestones.all();
    // milestone.models.forEach((model) => {
    //     model.update({
    //         createdBy: server.schema.users.find(model.createdUser),
    //         modifiedBy: server.schema.users.find(model.modifiedUser),
    //     })
    // })

    // //setting up relationship for project model
    // const project = server.schema.projects.all();
    // project.models.forEach((model) => {
    //     model.update({
    //         owner: server.schema.users.find(_.random(1, 10)),
    //         createdBy: server.schema.users.find(_.random(1, 10)),
    //         modifiedBy: server.schema.users.find(_.random(1, 10)),
    //         members: server.schema.users.all(),
    //         conversations: server.schema.conversationrooms.all(),
    //         roles: server.schema.roles.all(),
    //         memberships: server.schema.memberships.all(),
    //         milestones: server.schema.milestones.all(),
    //         issuetypes: server.schema.issuetypes.all(),
    //     });
    // });

    // //setting up relationship for savedsearch model
    // const savedsearch = server.schema.savedsearches.all();
    // savedsearch.models.forEach((model) => {
    //     model.update({
    //         createdBy: server.schema.users.find(model.createdUser)
    //     });
    // });

    // // setting up relationship for tag model
    // const tag = server.schema.tags.all();
    // tag.models.forEach((model) => {
    //     model.update({
    //         createdBy: server.schema.users.find(model.createdUser),
    //         modifiedBy: server.schema.users.find(model.modifiedUser),
    //         wiki: server.schema.wikis.all(),
    //         issue: server.schema.issues.all(),
    //         project: server.schema.projects.all()
    //     })
    // })

    // //setting up relationship for tagged model
    // const tagged = server.schema.taggeds.all();
    // tagged.models.forEach((model) => {
    //     model.update({
    //         tag: server.schema.tags.all(),
    //         project: server.schema.projects.all(),
    //         issue: server.schema.issues.all(),
    //         wiki: server.schema.wikis.all()
    //     })
    // })
    // //setting up relationship for timelog
    // const timelog = server.schema.timelogs.all();
    // timelog.models.forEach((model) => {
    //     model.update({
    //         createdBy: server.schema.users.find(model.createdUser),
    //         modifiedBy: server.schema.users.find(model.modifiedUser)
    //     });
    // });

    // //setting up relationship for upload
    // const upload = server.schema.uploads.all();
    // upload.models.forEach((model) => {
    //     model.update({
    //         createdBy: server.schema.users.find(model.createdUser),
    //         modifiedBy: server.schema.users.find(model.modifiedUser)
    //     });
    // });

    //setting up relationship for user
    const user = server.schema.users.all();
    user.models.forEach((model) => {
        model.update({
            dashboard: server.schema.dashboards.find(_.random(1, 10))
        })
    });

    // //setting up relationship for vote
    // const vote = server.schema.votes.all();
    // vote.models.forEach((model) => {
    //     model.update({
    //         createdBy: server.schema.users.find(model.createdUser),
    //         modifiedBy: server.schema.users.find(model.modifiedUser),
    //         wiki: server.schema.wikis.all(),
    //         comment: server.schema.comments.find([1, 2, 3, 4, 5]),
    //         conversationroom: server.schema.conversationrooms.all()
    //     });
    // });

    // //setting up relationship for wiki
    // const wiki = server.schema.wikis.all();
    // wiki.models.forEach((model) => {
    //     model.update({
    //         createdBy: server.schema.users.find(model.createdUser),
    //         modifiedBy: server.schema.users.find(model.modifiedUser),
    //         tag: server.schema.tags.all(),
    //         tagged: server.schema.taggeds.all(),
    //         vote: server.schema.votes.all(),
    //         files: server.schema.uploads.all()
    //     })
    // })
}