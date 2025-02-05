const xlsx = require('xlsx');
const path = require('path');
const { BankApi } = require('../models');

// Đọc dữ liệu từ file Excel
const excelFilePath = path.resolve(__dirname, '../xlsx/bank_api.xlsx'); // Đường dẫn đến file Excel

async function bankApiToMongo() {
    try {
        const workbook = xlsx.readFile(excelFilePath);
        const sheetName = workbook.SheetNames[0]; // Chọn sheet đầu tiên
        const sheet = workbook.Sheets[sheetName];

        // Chuyển đổi sheet thành mảng dữ liệu JSON
        const data = xlsx.utils.sheet_to_json(sheet);

        for (const item of data) {
            const existingAccount = await BankApi.findOne({ initialId: item.id });

            if (!existingAccount) {
                const newItem = await BankApi.create({
                    initialId: item.id,
                    bankName: item.bank_name,
                    bankCode: item.bank_code,
                    binBank: item.bin_bank,
                });
            }
        }
        console.log('Hoàn tất cập nhật BankApi dữ liệu vào MongoDB');
         

    } catch (error) {
        console.error('Lỗi:', error);
    }
}

module.exports = {
    bankApiToMongo
}