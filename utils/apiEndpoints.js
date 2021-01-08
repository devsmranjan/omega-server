module.exports = {
    API_ENDPOINT: process.env.API_ENDPOINT,
    API_DOCS: `${process.env.API_ENDPOINT}/docs`,
    AUTH_ENDPOINT: `${process.env.API_ENDPOINT}/auth`,
    AUTH_SIGNUP: '/signup',
    AUTH_LOGIN: '/login',
    AUTH_VERIFY_EMAIL: '/verify/:token',
    AUTH_VERIFY_FULL: `${process.env.SERVER_ROUTE}${process.env.API_ENDPOINT}/auth/verify/`,
    AUTH_VERIFY_EMAIL_RESEND: '/resend',
    AUTH_RECOVER: '/recover',
    AUTH_CHECK_RESET_LINK: '/reset/:token',
    AUTH_RESET: '/reset/:token',
    AUTH_RESET_FULL: `${process.env.SERVER_ROUTE}${process.env.API_ENDPOINT}/auth/reset/`,

    // user
    USER_ENDPOINT: `${process.env.API_ENDPOINT}/user`,
    USER_UPDATE: '/update',
    USER_UPDATE_PASSWORD: '/updatePassword',
    USER_DELETE_ACCOUNT: '/deleteAccount',

    // Client
    CLIENT_RESET_PASSWORD_PATH: '/resetPassword',
    CLIENT_EMAIL_VERIFICATION_PATH: '/verifyEmail',

    // subscriptions
    SUBSCRIPTIONS_ENDPOINT: `${process.env.API_ENDPOINT}/subscriptions`,
    SUBSCRIPTIONS_ADD_GOOGLE: '/add/google',
    SUBSCRIPTIONS_ADD_GOOGLE_CALLBACK: '/add/google/callback',
    SUBSCRIPTIONS_UPDATE_SUBSCRIPTION: '/updateSubscription',

    // spreedsheets
    SPREADSHEETS_ENDPOINT: `${process.env.API_ENDPOINT}/spreadsheets`,
};
