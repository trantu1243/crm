const xlsx = require('xlsx');
const path = require('path');
const { BankAccount } = require('../models');

// Đọc dữ liệu từ file Excel
const excelFilePath = path.resolve(__dirname, '../xlsx/bank_account.xlsx'); // Đường dẫn đến file Excel

async function bankAccountToMongo() {
    try {
        const workbook = xlsx.readFile(excelFilePath);
        const sheetName = workbook.SheetNames[0]; // Chọn sheet đầu tiên
        const sheet = workbook.Sheets[sheetName];

        // Chuyển đổi sheet thành mảng dữ liệu JSON
        const data = xlsx.utils.sheet_to_json(sheet);

        for (const item of data) {
            const existingAccount = await BankAccount.findOne({ initialId: item.id });

            if (!existingAccount) {
                const createdAt = item.created_at ? new Date(item.created_at * 1000) : new Date();
                const updatedAt = item.updated_at ? new Date(item.updated_at * 1000) : new Date();
                const newItem = await BankAccount.create({
                    initialId: item.id,
                    bankName: item.bank_name,
                    bankCode: item.bank_code,
                    bankAccount: item.bank_account,
                    bankAccountName: item.bank_account_name,
                    binBank: item.bin_bank,
                    totalAmount: item.total_amount,
                    isDeleted: item.is_deleted,
                    createdBy: item.created_by,
                    createdAt: createdAt.toISOString(),
                    updatedAt: updatedAt.toISOString(),
                });
            }
        }
        console.log('Hoàn tất cập nhật BankAccount dữ liệu vào MongoDB');
         

    } catch (error) {
        console.error('Lỗi:', error);
    }
}

module.exports = {
    bankAccountToMongo
}