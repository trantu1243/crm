const xlsx = require('xlsx');
const path = require('path');
const { BankApi, FeeTransaction } = require('../models');

// Đọc dữ liệu từ file Excel
const excelFilePath = path.resolve(__dirname, '../xlsx/fee_transaction.xlsx'); // Đường dẫn đến file Excel

async function feeTransactionToMongo() {
    try {
        const workbook = xlsx.readFile(excelFilePath);
        const sheetName = workbook.SheetNames[0]; // Chọn sheet đầu tiên
        const sheet = workbook.Sheets[sheetName];

        // Chuyển đổi sheet thành mảng dữ liệu JSON
        const data = xlsx.utils.sheet_to_json(sheet);

        for (const item of data) {
            const existingAccount = await FeeTransaction.findOne({ initialId: item.id });

            const createdAt = item.created_at ? new Date(item.created_at * 1000) : new Date();
            const updatedAt = item.updated_at ? new Date(item.updated_at * 1000) : new Date();

            if (!existingAccount) {
                const newItem = await FeeTransaction.create({
                    initialId: item.id,
                    min: Number(item.min),
                    max: Number(item.max),
                    feeDefault: Number(item.fee_default),
                    status: 'active',
                    createdAt: createdAt.toISOString(),
                    updatedAt: updatedAt.toISOString(),
                });
            }
        }
        console.log('Hoàn tất cập nhật FeeTransaction dữ liệu vào MongoDB');
         

    } catch (error) {
        console.error('Lỗi:', error);
    }
}

module.exports = {
    feeTransactionToMongo
}