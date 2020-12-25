const { google } = require('googleapis');
const httpStatusCodes = require('../utils/httpStatusCodes');
const messages = require('../utils/messages');
const User = require('../models/User.model');
const oAuth2Client = require('../config/oAuthClient');
const { CLIENT_SUBSCRIPTIONS_ROUTE } = require('../utils/constants');

const SCOPES = [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/drive.metadata.readonly',
    'https://www.googleapis.com/auth/spreadsheets.readonly',
];

// start google sign in process for subscription
exports.addSubscription = async (req, res) => {
    try {
        const authUrl = oAuth2Client.auth.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES,
        });

        res.status(200).json({
            success: true,
            message: '',
            data: {
                authURL: authUrl,
            },
        });
    } catch (error) {
        res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: messages.INTERNAL_SERVER_ERROR,
            error: error,
        });
    }
};

// google sign in callback process for subscription
exports.addSubscriptionCallback = async (req, res) => {
    try {
        if (req.query.code) {
            const code = req.query.code;

            const { tokens } = await oAuth2Client.auth.getToken(code);
            oAuth2Client.auth.setCredentials(tokens);

            var oauth2 = google.oauth2({
                auth: oAuth2Client.auth,
                version: 'v2',
            });

            const subscribedUserInfo = await oauth2.userinfo.get();

            res.redirect(
                `${CLIENT_SUBSCRIPTIONS_ROUTE}?success=true&uid=${subscribedUserInfo.data.id}&email=${subscribedUserInfo.data.email}&accessToken=${tokens.access_token}&refreshToken=${tokens.refresh_token}&scope=${tokens.scope}&idToken=${tokens.id_token}&tokenType=${tokens.token_type}&expiryDate=${tokens.expiry_date}`
            );
        }
    } catch (error) {
        res.redirect(`${CLIENT_SUBSCRIPTIONS_ROUTE}?success=false`);
    }
};

// Update subscription data
exports.updateSubscriptionData = async (req, res) => {
    try {
        const { _id } = req.user;

        const {
            uid,
            email,
            accessToken,
            refreshToken,
            scope,
            idToken,
            tokenType,
            expiryDate,
        } = req.body;

        const userById = await User.findById({ _id });

        if (!userById) {
            return res.status(httpStatusCodes.UNAUTHORIZED).json({
                success: false,
                message: messages.USER_NOT_AVAILABLE,
            });
        }

        let subscriptions = userById.subscriptions;

        // check if already subscribed
        if (subscriptions.filter((sub) => sub.uid === uid).length > 0) {
            return res.status(httpStatusCodes.BAD_REQUEST).json({
                success: false,
                message: 'Already Subscribed',
            });
        }

        const subscriptionData = {
            uid,
            email,
            accessToken,
            refreshToken,
            scope,
            idToken,
            tokenType,
            expiryDate: Number(expiryDate),
        };

        userById.subscriptions = [...subscriptions, subscriptionData];

        await userById.save();

        return res.status(httpStatusCodes.OK).json({
            success: true,
            message: 'Success',
        });
    } catch (error) {
        res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: messages.INTERNAL_SERVER_ERROR,
            error: error,
        });
    }
};

// Fetch all subscriptions data
exports.fetchAllSubscriptionsData = async (req, res) => {
    try {
        const { _id } = req.user;

        const userById = await User.findById({ _id });

        if (!userById) {
            return res.status(httpStatusCodes.UNAUTHORIZED).json({
                success: false,
                message: messages.USER_NOT_AVAILABLE,
            });
        }

        let subscriptions = userById.subscriptions;

        if (!req.query.uid) {
            return res.status(200).json({
                success: true,
                message: 'Fetched',
                data: {
                    subscriptions,
                },
            });
        }

        let subscriptionByUID = subscriptions.filter(
            (sub) => sub.uid === req.query.uid
        );

        res.status(httpStatusCodes.OK).json({
            success: true,
            message: 'Fetched',
            data: {
                subscriptions: subscriptionByUID,
            },
        });
    } catch (error) {
        res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: messages.INTERNAL_SERVER_ERROR,
            error: error,
        });
    }
};

exports.removeSubscription = async (req, res) => {
    try {
        const { _id } = req.user;

        const userById = await User.findById({ _id });

        if (!userById) {
            return res.status(httpStatusCodes.UNAUTHORIZED).json({
                success: false,
                message: messages.USER_NOT_AVAILABLE,
            });
        }

        const subUID = req.params.subUID;

        userById.subscribedSheets = userById.subscribedSheets.filter(
            (sheet) => sheet.uid !== subUID
        );

        userById.subscriptions = userById.subscriptions.filter(
            (sub) => sub.uid !== subUID
        );

        await userById.save();

        return res.status(httpStatusCodes.OK).json({
            success: true,
            message: 'Successfully deleted',
        });
    } catch (error) {
        res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: messages.INTERNAL_SERVER_ERROR,
            error: error,
        });
    }
};
