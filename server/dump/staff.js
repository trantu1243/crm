const xlsx = require('xlsx');
const path = require('path');
const { Staff, BankAccount } = require('../models');

// Đọc dữ liệu từ file Excel
const excelFilePath = path.resolve(__dirname, '../xlsx/staffs.xlsx'); // Đường dẫn đến file Excel

async function staffToMongo() {
    try {
        const workbook = xlsx.readFile(excelFilePath);
        const sheetName = workbook.SheetNames[0]; // Chọn sheet đầu tiên
        const sheet = workbook.Sheets[sheetName];

        // Chuyển đổi sheet thành mảng dữ liệu JSON
        const data = xlsx.utils.sheet_to_json(sheet);

        for (const item of data) {
            const existingAccount = await Staff.findOne({ initialId: item.id });

            if (!existingAccount) {

                const strArray = item.permission_bank.split(",");;

                const objectIdArray = [];

                for (const id of strArray) {
                    const bank = await BankAccount.findOne({ initialId: Number(id) });
                    if (bank) {
                        objectIdArray.push(bank._id); 
                    }
                }
                const createdAt = item.created_at ? new Date(item.created_at * 1000) : new Date();
                const updatedAt = item.updated_at ? new Date(item.updated_at * 1000) : new Date();

                const newItem = await Staff.create({
                    initialId: item.id,
                    name_staff: item.name_staff,
                    phone_staff: item.phone_staff,
                    address_staff: item.address_staff,
                    birthday_staff: item.birthday_staff,
                    gender_staff: item.gender_staff,
                    cccd_staff: item.cccd_staff,
                    email: item.email,
                    password: item.password,
                    uid_facebook: item.uid_facebook,
                    status: item.status,
                    is_admin: item.is_admin,
                    avatar: item.avatar,
                    permission_bank: objectIdArray,
                    createdAt: createdAt.toISOString(),
                    updatedAt: updatedAt.toISOString(),
                });
            }
        }
        console.log('Hoàn tất cập nhật staff dữ liệu vào MongoDB');
         

    } catch (error) {
        console.error('Lỗi:', error);
    }
}

module.exports = {
    staffToMongo
}