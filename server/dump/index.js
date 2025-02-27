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

async function deleteBoxAndRelatedData() {
    try {
        // 1️⃣ Tìm BoxTransaction có initialId = 61049
        const box = await BoxTransaction.findOne({ initialId: 61049 });

        if (!box) {
            console.log("Không tìm thấy BoxTransaction với initialId = 61049.");
            return;
        }

        // 2️⃣ Lấy `_id` của box
        const boxId = box._id;

        // 3️⃣ Xóa tất cả Transaction có boxId này
        const deleteTransactions = await Transaction.deleteMany({ boxId });

        // 4️⃣ Xóa tất cả Bill có boxId này
        const deleteBills = await Bill.deleteMany({ boxId });

        // 5️⃣ Xóa chính BoxTransaction đó
        const deleteBox = await BoxTransaction.deleteOne({ _id: boxId });

        console.log({
            deletedTransactions: deleteTransactions.deletedCount,
            deletedBills: deleteBills.deletedCount,
            deletedBox: deleteBox.deletedCount
        });

    } catch (error) {
        console.error("Lỗi khi xóa dữ liệu:", error);
    }
}

async function importExcelToMongo() {
    // await deleteDocumentsWithoutInitialId()
    await bankAccountToMongo();
    await bankApiToMongo();
    await staffToMongo();
    await boxTransactionToMongo();
    await feeTransactionToMongo();
    await billToMongo();
    await transactionToMongo();
    await deleteBoxAndRelatedData()
}

module.exports = {
    importExcelToMongo
}