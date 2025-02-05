const xlsx = require('xlsx');
const path = require('path');
const { Role } = require('../models');

// Đọc dữ liệu từ file Excel
const excelFilePath = path.resolve(__dirname, '../xlsx/roles.xlsx'); // Đường dẫn đến file Excel

async function roleToMongo() {
    try {
        const workbook = xlsx.readFile(excelFilePath);
        const sheetName = workbook.SheetNames[0]; // Chọn sheet đầu tiên
        const sheet = workbook.Sheets[sheetName];

        // Chuyển đổi sheet thành mảng dữ liệu JSON
        const data = xlsx.utils.sheet_to_json(sheet);

        for (const item of data) {
            const existingAccount = await Role.findOne({ initialId: item.id });

            const createdAt = item.created_at ? new Date(item.created_at * 1000) : new Date();
            const updatedAt = item.updated_at ? new Date(item.updated_at * 1000) : new Date();

            if (!existingAccount) {
                const newItem = await Role.create({
                    initialId: item.id,
                    name: item.name,
                    slug: item.slug,
                    status: item.status,
                    createdAt: createdAt.toISOString(),
                    updatedAt: updatedAt.toISOString(),
                });
            }
        }
        console.log('Hoàn tất cập nhật Role dữ liệu vào MongoDB');
         

    } catch (error) {
        console.error('Lỗi:', error);
    }
}

module.exports = {
    roleToMongo
}