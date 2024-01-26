export default {
    aclSettings: {
        permissionFlags: JSON.stringify(['readF', 'createF', 'searchF', 'updateF', 'deleteF', 'importF', 'exportF']),
        apiOptions: JSON.stringify({
            'all': '9',
            'group': '2',
            'assignment': '1',
            'none': '0'
        })
    }
}