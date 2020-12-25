const { google } = require('googleapis');
const oAuth2Client = require('../config/oAuthClient');
const httpStatusCodes = require('../utils/httpStatusCodes');
const messages = require('../utils/messages');
const User = require('../models/User.model');

// get all spreadsheets from API
exports.getAllSpreadsheetsFromAPI = async (req, res) => {
    const auth = oAuth2Client.auth;

    auth.setCredentials(req.body);

    try {
        const drive = google.drive({ version: 'v3', auth });

        // fetch spreadsheet files from drive
        const response = await drive.files.list({
            q: "mimeType='application/vnd.google-apps.spreadsheet'",
        });

        const files = response.data.files;

        res.status(httpStatusCodes.OK).json({
            success: true,
            message: 'Fetch spreadsheets from account',
            data: {
                spreadsheets: files,
            },
        });
    } catch (error) {
        console.log('getAllSpreadsheetsFromAPI -- error', error);

        res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: messages.INTERNAL_SERVER_ERROR,
            error: error,
        });
    }
};

// get spreadsheet tabs
exports.getSpreadsheetTabsFromAPI = async (req, res) => {
    const auth = oAuth2Client.auth;

    auth.setCredentials(req.body);

    try {
        const sheets = google.sheets({ version: 'v4', auth });

        // get spreadsheets by spreadsheet ID
        const response = await sheets.spreadsheets.get({
            spreadsheetId: req.body.spreadsheetId,
        });

        let tabs = [];

        response.data.sheets.forEach((sheet) => {
            tabs.push(sheet.properties.title);
        });

        res.status(httpStatusCodes.OK).json({
            success: true,
            message: 'Fetch tabs from spreadsheet',
            data: {
                spreadsheetTabs: tabs,
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

// get spreadsheet
exports.getSpreadsheetFromAPI = async (req, res) => {
    const auth = oAuth2Client.auth;

    auth.setCredentials(req.body);

    try {
        const sheets = google.sheets({ version: 'v4', auth });

        // get spreadsheets by spreadsheet id and sheet tab
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: req.body.spreadsheetId,
            range: req.body.tab,
        });

        const rows = response.data.values;

        res.status(httpStatusCodes.OK).json({
            success: true,
            message: 'Fetched',
            data: {
                sheetDetails: {
                    id: req.body.spreadsheetId,
                    title: req.body.spreadsheetTitle,
                    tab: req.body.tab,
                },
                sheetRows: rows,
            },
        });
    } catch (error) {
        console.log('getSpreadsheetFromAPI---error', error);
        res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: messages.INTERNAL_SERVER_ERROR,
            error: error,
        });
    }
};

// add new subscribed spreadsheet
exports.addSubscribedSpreadsheet = async (req, res) => {
    try {
        const { uid, sheetTitle, sheetId, sheetTab } = req.body;

        const { _id } = req.user;

        const userById = await User.findById({ _id });

        if (!userById) {
            return res.status(httpStatusCodes.UNAUTHORIZED).json({
                success: false,
                message: messages.USER_NOT_AVAILABLE,
            });
        }

        let subscribedSheets = userById.subscribedSheets;

        if (
            subscribedSheets.find(
                (sheet) =>
                    sheet.uid === uid &&
                    sheet.sheetId === sheetId &&
                    sheet.sheetTab === sheetTab
            )
        ) {
            return res.status(httpStatusCodes.BAD_REQUEST).json({
                success: false,
                message: 'Already Subscribed Sheet',
            });
        }

        const subscribedSheetData = {
            uid,
            sheetTitle,
            sheetId,
            sheetTab,
        };

        userById.subscribedSheets = [...subscribedSheets, subscribedSheetData];

        await userById.save();

        res.status(httpStatusCodes.OK).json({
            success: true,
            message: 'Added Successfully',
        });
    } catch (error) {
        res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: messages.INTERNAL_SERVER_ERROR,
            error: error,
        });
    }
};

// get all subscribed spreadsheets
exports.getAllSubscribedSpreadsheets = async (req, res) => {
    try {
        const { _id } = req.user;

        const userById = await User.findById({ _id });

        if (!userById) {
            return res.status(httpStatusCodes.UNAUTHORIZED).json({
                success: false,
                message: messages.USER_NOT_AVAILABLE,
            });
        }

        let subscribedSheets = userById.subscribedSheets;

        if (!req.query.uid) {
            return res.status(httpStatusCodes.OK).json({
                success: true,
                message: 'Fetched',
                data: {
                    spreadsheets: subscribedSheets,
                },
            });
        }

        // sheets by uid
        let sheets = subscribedSheets.filter(
            (sub) => sub.uid === req.query.uid
        );

        res.status(httpStatusCodes.OK).json({
            success: true,
            message: 'Got data',
            data: {
                spreadsheets: sheets,
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

// get a subscribed spreadsheets
exports.getSubscribedSpreadsheet = async (req, res) => {
    try {
        const { _id } = req.user;

        const userById = await User.findById({ _id });

        if (!userById) {
            return res.status(httpStatusCodes.UNAUTHORIZED).json({
                success: false,
                message: messages.USER_NOT_AVAILABLE,
            });
        }

        let subscribedSheets = userById.subscribedSheets;

        let sheets = subscribedSheets.filter((sub) =>
            sub.sheets.filter((sheet) => {
                sheet.sheetId = req.params.sheetId;
            })
        );

        res.status(httpStatusCodes.OK).json({
            success: true,
            message: 'Found',
            data: {
                sheet: sheets[0],
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

exports.removeSubscribedSpreadsheet = async (req, res) => {
    try {
        const { _id } = req.user;

        const userById = await User.findById({ _id });

        if (!userById) {
            return res.status(httpStatusCodes.UNAUTHORIZED).json({
                success: false,
                message: messages.USER_NOT_AVAILABLE,
            });
        }

        const sheetId = req.params.sheetId;

        userById.subscribedSheets = userById.subscribedSheets.filter(
            (sheet) => sheet.sheetId !== sheetId
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
