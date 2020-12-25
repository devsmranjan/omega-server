const { google } = require('googleapis');
const apiEndpoints = require('../utils/apiEndpoints');

let oAuth2Client = {
    redirectURL: `${process.env.CLIENT_URL}${apiEndpoints.SUBSCRIPTIONS_ENDPOINT}${apiEndpoints.SUBSCRIPTIONS_ADD_GOOGLE_CALLBACK}`,
};

oAuth2Client.auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    oAuth2Client.redirectURL
);

module.exports = oAuth2Client;
