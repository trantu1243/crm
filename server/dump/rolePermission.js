const xlsx = require('xlsx');
const path = require('path');
const { Role, Permission } = require('../models');

// Đọc dữ liệu từ file Excel
const excelFilePath = path.resolve(__dirname, '../xlsx/role_permission.xlsx'); // Đường dẫn đến file Excel

async function rolePermissionToMongo() {
    try {
        const workbook = xlsx.readFile(excelFilePath);
        const sheetName = workbook.SheetNames[0]; // Chọn sheet đầu tiên
        const sheet = workbook.Sheets[sheetName];

        // Chuyển đổi sheet thành mảng dữ liệu JSON
        const data = xlsx.utils.sheet_to_json(sheet);

        for (const item of data) {
            const role = await Role.findOne({ initialId: item.roles_id });
            const permission = await Permission.findOne({ initialId: item.permission_id });

            if (!role.permissions.includes(permission._id)) {
                role.permissions.push(permission._id);
                await role.save();
            }
        }
        console.log('Hoàn tất cập nhật role_permission dữ liệu vào MongoDB');
         

    } catch (error) {
        console.error('Lỗi:', error);
    }
}

module.exports = {
    rolePermissionToMongo
}