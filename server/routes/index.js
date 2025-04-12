const express = require('express');
const bankAccountRoute = require('./bankAccount.route');
const authRoute = require('./auth.route');
const transactionRoute = require('./transaction.route');
const billRoute = require('./bill.route');
const boxTransactionRoute = require('./boxTransaction.route');
const staffRoute = require('./staff.route');
const bankApiRoute = require('./bankApi.route');
const feeRoute = require('./fee.route');
const roleRoute = require('./role.route');
const permissionRoute = require('./permission.route');
const statisticRoutes = require('./statistic.route');
const settingRoutes = require('./setting.route');
const userLogRoutes = require('./userLog.route');
const getInfoRoutes = require('./getInfo.route');
const quickAnswerRoutes = require('./quickAnswer.route');
const tagRoutes = require('./tag.route');
const customerRoute = require('./customer.route');

const router = express.Router();

const defaultRoutes = [
    {
        path: '/bank-account',
        route: bankAccountRoute,
    },
    {
        path: '/auth',
        route: authRoute,
    },
    {
        path: '/transaction',
        route: transactionRoute
    },
    {
        path: '/bill',
        route: billRoute
    },
    {
        path: '/box-transaction',
        route: boxTransactionRoute
    },
    {
        path: '/staff',
        route: staffRoute
    },
    {
        path: '/bank-api',
        route: bankApiRoute
    },
    {
        path: '/fee',
        route: feeRoute
    },
    {
        path: '/permission',
        route: permissionRoute
    },
    {
        path: '/role',
        route: roleRoute
    },
    {
        path: '/statistic',
        route: statisticRoutes
    },
    {
        path: '/setting',
        route: settingRoutes
    },
    {
        path: '/logs',
        route: userLogRoutes
    },
    {
        path: '/get',
        route: getInfoRoutes
    },
    {
        path: '/quick-answer',
        route: quickAnswerRoutes
    },
    {
        path: '/tag',
        route: tagRoutes
    },
    {
        path: '/customer',
        route: customerRoute
    }
];

defaultRoutes.forEach((route) => {
    router.use(route.path, route.route);
});

module.exports = router;