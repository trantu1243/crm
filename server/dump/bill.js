const xlsx = require('xlsx');
const path = require('path');
const { BankApi, Permission, Staff, Bill, BoxTransaction } = require('../models');

// Đọc dữ liệu từ file Excel
const excelFilePath = path.resolve(__dirname, '../xlsx/bill_thanh_khoan.xlsx'); // Đường dẫn đến file Excel

async function billToMongo() {
    try {
        const workbook = xlsx.readFile(excelFilePath);
        const sheetName = workbook.SheetNames[0]; // Chọn sheet đầu tiên
        const sheet = workbook.Sheets[sheetName];

        // Chuyển đổi sheet thành mảng dữ liệu JSON
        const data = xlsx.utils.sheet_to_json(sheet);

        for (const item of data) {
            if (Number(item.id) > 75000) {
                const existingAccount = await Bill.findOne({ initialId: item.id });

                if (item.id % 100 === 0) console.log(item.id);
                const createdAt = item.created_at ? new Date(item.created_at * 1000) : new Date();
                const updatedAt = item.updated_at ? new Date(item.updated_at * 1000) : new Date();

                if (!existingAccount) {
                    const staff = await Staff.findOne({ email: item.created_by });
                    const box = await BoxTransaction.findOne({ initialId: Number(item.box_id) });
                    if (staff) {
                        const newItem = await Bill.create({
                            initialId: item.id,
                            bankCode: item.bank_code,
                            stk: item.account_id,
                            content: item.content,
                            amount: Number(item.amount),
                            bonus: Number(item.bonus),
                            typeTransfer: item.type_transfer,
                            boxId: box._id,
                            messengerId: item.messenger_id,
                            linkQr: item.link_qr ? item.link_qr : '',
                            status: Number(item.status),
                            staffId: staff?._id,
                            isCompleted: item.is_completed,
                            createdAt: createdAt.toISOString(),
                            updatedAt: updatedAt.toISOString(),
                        });
                    }
                
                }else {
                    const staff = await Staff.findOne({ email: item.created_by });
                    const box = await BoxTransaction.findOne({ initialId: Number(item.box_id) });

                    existingAccount.bankCode = item.bank_code;
                    existingAccount.stk = item.account_id;
                    existingAccount.content = item.content;
                    existingAccount.amount = Number(item.amount);
                    existingAccount.bonus = Number(item.bonus);
                    existingAccount.typeTransfer = item.type_transfer;
                    existingAccount.boxId = box._id;
                    existingAccount.messengerId = item.messenger_id;
                    existingAccount.linkQr = item.link_qr ? item.link_qr : '';
                    existingAccount.status = Number(item.status);
                    existingAccount.staffId = staff?._id;
                    existingAccount.isCompleted = item.is_completed;
                    existingAccount.createdAt = createdAt.toISOString();
                    existingAccount.updatedAt = updatedAt.toISOString();
                    await existingAccount.save()
                }
            }
            
        }
        console.log('Hoàn tất cập nhật Bill dữ liệu vào MongoDB');
         

    } catch (error) {
        console.error('Lỗi:', error);
    }
}

module.exports = {
    billToMongo
}