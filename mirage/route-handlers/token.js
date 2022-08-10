export function register(server, ctx) {
    server.post('/token', (schema, request) => {
        let req = _.chain(request.requestBody).split('&').map(_.partial(_.split, _, '=', 2)).fromPairs().value();

        if (req.username === "hammad" && req.password === "hammad") {
            return {
                "access_token": "8ad7fdaaf7cc550174dd7070e697404eff7e5c50",
                "expires_in": 3600,
                "token_type": "Bearer",
                "scope": "application",
                "refresh_token": "30b8da05c69274dbfc4a71e36927d1e5698c7a45"
            }
        } else {
            return {
                "error": "invalid_grant",
                "error_description": "Invalid username and password combination"
            }
        }
    });
}