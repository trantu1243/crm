const xlsx = require('xlsx');
const path = require('path');
const { BankAccount, BoxTransaction, Transaction, Bill } = require('../models');
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


async function deleteDocumentsWithoutInitialId() {
    try {
        const boxResult = await BoxTransaction.deleteMany({
            $or: [{ initialId: { $exists: false } }, { initialId: null }]
        });
        console.log(`Deleted ${boxResult.deletedCount} BoxTransaction documents.`);
        const transactionResult = await Transaction.deleteMany({
            $or: [{ initialId: { $exists: false } }, { initialId: null }]
        });
        console.log(`Deleted ${transactionResult.deletedCount} Transaction documents.`);
        const billResult = await Bill.deleteMany({
            $or: [{ initialId: { $exists: false } }, { initialId: null }]
        });

        
        
        console.log(`Deleted ${billResult.deletedCount} Bill documents.`);
    } catch (error) {
        console.error("Error deleting documents:", error);
    }
}

async function importExcelToMongo() {
    // await deleteDocumentsWithoutInitialId()
    // await bankAccountToMongo();
    // await bankApiToMongo();
    // await staffToMongo();
    await boxTransactionToMongo();
    // await feeTransactionToMongo();
    await billToMongo();
    await transactionToMongo();
}

module.exports = {
    importExcelToMongo
}