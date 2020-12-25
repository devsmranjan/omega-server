const express = require('express');
const router = express.Router();
const apiEndpoints = require('../utils/apiEndpoints');
const Subscriptions = require('../controllers/subscriptions');
const authenticate = require('../middlewares/authenticated');

// fetch all subscriptions data
// query - uid , for indivisual
router.get('/', authenticate, Subscriptions.fetchAllSubscriptionsData);

// add subscription -  start google sign in process for subscription
router.get(
    apiEndpoints.SUBSCRIPTIONS_ADD_GOOGLE,
    authenticate,
    Subscriptions.addSubscription
);

// google sign in callback process for subscription
router.get(
    apiEndpoints.SUBSCRIPTIONS_ADD_GOOGLE_CALLBACK,
    Subscriptions.addSubscriptionCallback
);

// update subscription data
router.put('/', authenticate, Subscriptions.updateSubscriptionData);

// fetch all subscriptions data
router.put(
    apiEndpoints.SUBSCRIPTIONS_UPDATE_SUBSCRIPTION,
    authenticate,
    Subscriptions.updateSubscriptionData
);

// remove subscription
router.delete('/:subUID', authenticate, Subscriptions.removeSubscription);

module.exports = router;
