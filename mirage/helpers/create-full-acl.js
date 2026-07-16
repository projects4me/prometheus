/**
 * ACL resources used by the frontend (Model.action contexts).
 * Each gets every action flag set to allow (1) for tests.
 */
export const ACL_RESOURCES = [
    'Project',
    'Issue',
    'Wiki',
    'User',
    'Role',
    'Membership',
    'Conversationroom',
    'Comment',
    'Milestone',
    'Tag',
    'Savedsearch',
    'Upload',
    'Activity',
    'Timelog',
    'Chatroom',
    'Issuetype',
    'Issuestatus'
];

const FULL_ACCESS = {
    readF: '1',
    createF: '1',
    updateF: '1',
    deleteF: '1',
    importF: '1',
    exportF: '1'
};

/**
 * Create full-access userpermissions for every ACL resource.
 *
 * @param {Object} server Mirage server
 * @param {string|number} [userId='1'] User id to attach permissions to
 * @returns {Object[]} Created userpermission models
 */
export default function createFullAcl(server, userId = '1') {
    return ACL_RESOURCES.map((entity) => {
        return server.create('userpermission', {
            userId: String(userId),
            entity,
            ...FULL_ACCESS
        });
    });
}
