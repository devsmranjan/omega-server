const express = require('express');
const router = express.Router();
const Spreadsheets = require('../controllers/spreadsheets');

// get all subscribed spreadsheets from database
// query: uid, to get sheets by uid
router.get('/', Spreadsheets.getAllSubscribedSpreadsheets);

// get a subscribed spreadsheet from database
// param: sheetId
router.get('/:sheetId', Spreadsheets.getSubscribedSpreadsheet);

// all spreadsheets from API
// access_token, refresh_token, scope, token_type, expiry_date
router.post('/sheetsFromAPI', Spreadsheets.getAllSpreadsheetsFromAPI);

// all spreadsheets tab from API
// access_token, refresh_token, scope, token_type, expiry_date
// spreadsheetId
router.post('/sheetTabsFromAPI', Spreadsheets.getSpreadsheetTabsFromAPI);

// spreadsheet from API
// access_token, refresh_token, scope, token_type, expiry_date
// spreadsheetId, spreadsheetTitle, tab
router.post('/spreadsheetFromAPI', Spreadsheets.getSpreadsheetFromAPI);

// add subscribed spreadsheet in database
// uid, sheetTitle, sheetId, sheetTab
router.put('/', Spreadsheets.addSubscribedSpreadsheet);

router.delete('/:sheetId', Spreadsheets.removeSubscribedSpreadsheet);

module.exports = router;
