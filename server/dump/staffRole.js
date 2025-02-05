const xlsx = require('xlsx');
const path = require('path');
const { Role, Staff } = require('../models');

// Đọc dữ liệu từ file Excel
const excelFilePath = path.resolve(__dirname, '../xlsx/staff_role.xlsx'); // Đường dẫn đến file Excel

async function staffRoleToMongo() {
    try {
        const workbook = xlsx.readFile(excelFilePath);
        const sheetName = workbook.SheetNames[0]; // Chọn sheet đầu tiên
        const sheet = workbook.Sheets[sheetName];

        // Chuyển đổi sheet thành mảng dữ liệu JSON
        const data = xlsx.utils.sheet_to_json(sheet);

        for (const item of data) {
            const role = await Role.findOne({ initialId: item.roles_id });
            const staff = await Staff.findOne({ initialId: item.staffs_id });

            if (!staff.roles.includes(role._id)) {
                staff.roles.push(role._id);
                await staff.save();
            }
        }
        console.log('Hoàn tất cập nhật staff_role dữ liệu vào MongoDB');
         

    } catch (error) {
        console.error('Lỗi:', error);
    }
}

module.exports = {
    staffRoleToMongo
}