export default {
    aclSettings: {
        permissionFlags: JSON.stringify(['readF', 'createF', 'updateF', 'deleteF', 'importF', 'exportF']),
        apiOptions: JSON.stringify({
            "field": {
                "allow": "1",
                "none": "0"
            },
            "model": {
                "allow": "1",
                "none": "0"
            }
        }),
        modelGroups: JSON.stringify({
            "Issue": []
        })
    }
}