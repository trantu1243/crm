const xlsx = require('xlsx');
const path = require('path');
const { BankApi, BoxTransaction, Staff } = require('../models');

// Đọc dữ liệu từ file Excel
const excelFilePath = path.resolve(__dirname, '../xlsx/box_transaction.xlsx'); // Đường dẫn đến file Excel
const noteFile = path.resolve(__dirname, '../xlsx/note_box_transactions.xlsx'); 

async function boxTransactionToMongo() {
    try {
        const workbook = xlsx.readFile(excelFilePath);
        const sheetName = workbook.SheetNames[0]; // Chọn sheet đầu tiên
        const sheet = workbook.Sheets[sheetName];

        // Chuyển đổi sheet thành mảng dữ liệu JSON
        const data = xlsx.utils.sheet_to_json(sheet);

        const noteworkbook = xlsx.readFile(noteFile);
        const noteSheetName = noteworkbook.SheetNames[0]; // Chọn sheet đầu tiên
        const noteSheet = noteworkbook.Sheets[noteSheetName];

        // Chuyển đổi sheet thành mảng dữ liệu JSON
        let noteData = xlsx.utils.sheet_to_json(noteSheet);

        for (const item of data) {
            const existingAccount = await BoxTransaction.findOne({ initialId: item.id });
            
            if (!existingAccount) {
                const staff = await Staff.findOne({ email: item.created_by });

                const note_data = noteData.filter(it => Number(it.box_id) === item.id);
                if (note_data.length > 0) {
                    console.log(item.id);
                    console.log(note_data)
                }
                noteData = noteData.filter(it => Number(it.box_id) !== item.id);

                const newArray = [];

                for (const it of note_data) {
                    const created_at = it.created_at ? new Date(it.created_at * 1000) : new Date();
                    const staff = await Staff.findOne({ email: it.created_by });
                    newArray.push({
                        note: it.note,
                        status: it.status,
                        createdAt: created_at.toISOString(),
                        createdBy: staff._id
                    });
                }

                const createdAt = item.created_at ? new Date(item.created_at * 1000) : new Date();
                const updatedAt = item.updated_at ? new Date(item.updated_at * 1000) : new Date();

                const newItem = await BoxTransaction.create({
                    initialId: item.id,
                    name: item.name ? item.name : '',
                    status: item.status,
                    messengerId: item.messenger_id,
                    isDeleted: item.is_deleted,
                    staffId: staff._id,
                    typeBox: item.type_box,
                    amount: Number(item.amount),
                    notes: newArray,
                    createdAt: createdAt.toISOString(),
                    updatedAt: updatedAt.toISOString(),
                });
            }
        }
        console.log(noteData)
        console.log('Hoàn tất cập nhật BoxTransaction dữ liệu vào MongoDB');
         

    } catch (error) {
        console.error('Lỗi:', error);
    }
}

module.exports = {
    boxTransactionToMongo
}