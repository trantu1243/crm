const xlsx = require('xlsx');
const path = require('path');
const { BankApi, Permission, Staff, Transaction, BoxTransaction, BankAccount } = require('../models');

// Đọc dữ liệu từ file Excel
const excelFilePath = path.resolve(__dirname, '../xlsx/transactions.xlsx'); // Đường dẫn đến file Excel

async function transactionToMongo() {
    try {
        const workbook = xlsx.readFile(excelFilePath);
        const sheetName = workbook.SheetNames[0]; // Chọn sheet đầu tiên
        const sheet = workbook.Sheets[sheetName];

        // Chuyển đổi sheet thành mảng dữ liệu JSON
        const data = xlsx.utils.sheet_to_json(sheet);

        for (const item of data) {
            const existingAccount = await Transaction.findOne({ initialId: item.id });

            const createdAt = item.created_at ? new Date(item.created_at * 1000) : new Date();
            const updatedAt = item.updated_at ? new Date(item.updated_at * 1000) : new Date();

            if (!existingAccount) {
                const staff = await Staff.findOne({ email: item.created_by });
                const box = await BoxTransaction.findOne({ initialId: Number(item.box_transaction_id) });
                const bank = await BankAccount.findOne({ initialId: item.bank_id });

                const newItem = await Transaction.create({
                    initialId: item.id,
                    boxId: box._id,
                    bankId: bank._id,
                    amount: Number(item.amount),
                    stk: item.account_id,
                    content: item.content,
                    fee: Number(item.fee),
                    totalAmount: Number(item.total_amount),
                    status: Number(item.status),
                    linkQr: item.link_qr ? item.link_qr : '',
                    messengerId: item.messenger_id,
                    staffId: staff._id,
                    typeFee: item.type_fee,
                    bonus: Number(item.bonus),
                    decodeQr: item.decode_qr,
                    createdAt: createdAt.toISOString(),
                    updatedAt: updatedAt.toISOString(),
                });
            }
        }
        console.log('Hoàn tất cập nhật Transaction dữ liệu vào MongoDB');
         

    } catch (error) {
        console.error('Lỗi:', error);
    }
}

module.exports = {
    transactionToMongo
}