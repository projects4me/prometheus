export default {
    aclSettings: {
        permissionFlags: JSON.stringify(['readF', 'createF', 'searchF', 'updateF', 'deleteF', 'importF', 'exportF']),
        apiOptions: JSON.stringify({
            "field": {
                "allow": "9",
                "none": 0
            },
            "model": {
                "all": "9",
                "assignment": "1",
                "none": "0"
            }
        }),
        modelGroups: JSON.stringify({
            "Issue": []
        })
    }
}