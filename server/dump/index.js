const xlsx = require('xlsx');
const path = require('path');
const { BankAccount } = require('../models');
const { bankAccountToMongo } = require('./bankAccount');
const { staffToMongo } = require('./staff');
const { bankApiToMongo } = require('./bankApi');
const { permissionToMongo } = require('./permission');
const { roleToMongo } = require('./role');
const { rolePermissionToMongo } = require('./rolePermission');
const { staffRoleToMongo } = require('./staffRole');
const { boxTransactionToMongo } = require('./boxTransaction');
const { feeTransactionToMongo } = require('./feeTransaction');
const { billToMongo } = require('./bill');
const { transactionToMongo } = require('./transaction');

async function importExcelToMongo() {
    // await bankAccountToMongo();
    // await bankApiToMongo();
    // await staffToMongo();
    // await permissionToMongo();
    // await roleToMongo();
    // await rolePermissionToMongo();
    // await staffRoleToMongo();
    // await boxTransactionToMongo();
    // await feeTransactionToMongo();
    // await billToMongo();
    // await transactionToMongo();
}

module.exports = {
    importExcelToMongo
}