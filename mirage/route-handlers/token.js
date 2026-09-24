import _ from 'lodash';
import { Response } from 'miragejs';

const INACTIVE_ACCOUNT_ERROR = 'account_inactive';

function parseTokenRequestBody(requestBody) {
    if (typeof requestBody !== 'string') {
        return requestBody || {};
    }

    return _.chain(requestBody)
        .split('&')
        .map(_.partial(_.split, _, '=', 2))
        .map(([key, value]) => [
            key,
            value === undefined ? value : decodeURIComponent(String(value).replace(/\+/g, ' ')),
        ])
        .fromPairs()
        .value();
}

function isAuthenticatableAccountStatus(accountStatus) {
    if (accountStatus === null || accountStatus === undefined || accountStatus === '') {
        return false;
    }

    const normalized = String(accountStatus).toLowerCase();
    return normalized === 'active' || normalized === 'invited';
}

function findUserByEmail(schema, email) {
    if (!email) {
        return null;
    }

    return schema.users.all().models.find(
        (user) => String(user.email).toLowerCase() === String(email).toLowerCase()
    );
}

function issueTokenResponse() {
    return {
        access_token: '8ad7fdaaf7cc550174dd7070e697404eff7e5c50',
        expires_in: 3600,
        token_type: 'Bearer',
        scope: 'application',
        refresh_token: '30b8da05c69274dbfc4a71e36927d1e5698c7a45',
    };
}

export function register(server, ctx) {
    server.post('/token', (schema, request) => {
        const req = parseTokenRequestBody(request.requestBody);
        const grantType = req.grant_type;

        if (grantType === 'refresh_token') {
            const refreshToken = req.refresh_token;
            const refreshRow = schema.oauthrefreshtokens?.findBy({ refresh_token: refreshToken })
                || schema.oauthRefreshTokens?.findBy({ refresh_token: refreshToken });

            if (refreshRow) {
                const user = findUserByEmail(schema, refreshRow.user_id || refreshRow.userId);
                if (user && !isAuthenticatableAccountStatus(user.accountStatus)) {
                    return new Response(401, {}, { error: INACTIVE_ACCOUNT_ERROR });
                }
            }

            return issueTokenResponse();
        }

        const email = req.email || req.username;
        const user = findUserByEmail(schema, email);

        if (user && !isAuthenticatableAccountStatus(user.accountStatus)) {
            return new Response(401, {}, { error: INACTIVE_ACCOUNT_ERROR });
        }

        if (req.username === 'hammad' && req.password === 'hammad') {
            return issueTokenResponse();
        }

        if (user && req.password) {
            return issueTokenResponse();
        }

        return new Response(401, {}, {
            error: 'invalid_grant',
            error_description: 'Invalid username and password combination',
        });
    });
}
