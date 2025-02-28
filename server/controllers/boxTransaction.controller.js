const { Transaction, BoxTransaction, Bill, Customer, Staff } = require("../models");
const { getPermissions } = require("../services/permission.service");
const { getSocket } = require("../socket/socketHandler");

const getBillsByBoxId = async (req, res) => {
    try {
        const { boxId } = req.params;

        const bills = await Bill.find({ boxId, status: { $ne: 3 } })
            .sort({ createdAt: -1 });

        return res.status(200).json({ success: true, data: bills });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const getTransactionsByBoxId = async (req, res) => {
    try {
        const { boxId } = req.params;

        const transactions = await Transaction.find({ boxId, status: { $ne: 3 } })
            .sort({ createdAt: -1 });

        return res.status(200).json({ success: true, data: transactions });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const getById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(404).json({ message: 'Bad request' });
        }
        const box = await BoxTransaction.findById(id).populate(
            [
                { path: 'staffId', select: 'name_staff email uid_facebook avatar' },
            ]
        );
        if (!box) {
            return res.status(404).json({ message: 'Box not found' });
        }
        const transactions = await Transaction.find({ boxId: id }).sort({ createdAt: -1 }).populate(
            [
                { path: 'boxId', select: 'amount messengerId notes' },
                { path: 'staffId', select: 'name_staff email uid_facebook avatar' },
                { path: 'bankId', select: 'bankName bankCode bankAccount bankAccountName binBank' }
            ]
        );
        const bills = await Bill.find({ boxId: id }).sort({ createdAt: -1 }).populate([
            { path: 'staffId', select: 'name_staff email uid_facebook avatar' },
            { path: 'boxId', select: 'amount messengerId notes' }
        ]);
        // let buyerCustomer = await Customer.findOne({
        //     boxId: { $in: [box._id] },
        //     type: 'buyer',
        //     isDeleted: false,
        // });

        // let sellerCustomer = await Customer.findOne({
        //     boxId: { $in: [box._id] },
        //     type: 'seller',
        //     isDeleted: false,
        // });
        const boxObject = box.toObject();
        boxObject.transactions = transactions;
        boxObject.bills = bills;
        // boxObject.buyerCustomer = buyerCustomer ? buyerCustomer : null;
        // boxObject.sellerCustomer = sellerCustomer ? sellerCustomer : null;
        res.status(200).json({
            message: 'Transaction fetched successfully',
            data: boxObject,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}


const undoBox = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Tìm BoxTransaction theo ID
        const box = await BoxTransaction.findById(id);
        if (!box || box.status === 'lock') return res.status(400).json({ message: 'Box không tìm thấy hoặc bị khoá' });

        const user = await Staff.findById(req.user.id);
        if (box.status === 'complete' && user.is_admin === 0) return res.status(400).json({ message: 'Box đã hoàn thành' });
        // Lấy danh sách transactions (trừ những transaction có status = 3), sắp xếp theo thời gian mới nhất
        const transactions = await Transaction.find({ boxId: box._id, status: { $ne: 1 } }).sort({ createdAt: -1 });
        if (transactions.length === 0) return res.status(400).json({ message: 'No transactions found' });

        const latestTransaction = transactions[0]; // Giao dịch mới nhất

        // Nếu transaction mới nhất có status = 2 hoặc 8 -> Cập nhật lại hóa đơn (Bill) và số dư trong box
        if ([2, 8].includes(latestTransaction.status)) {
            if (latestTransaction.status === 2) box.status = 'active';
            const lastestBill = await Bill.findOne({ boxId: box._id, status: { $ne: 3 } }).sort({ createdAt: -1 });

            if (lastestBill) {
                lastestBill.status = 1;
                box.amount += (lastestBill.amount + lastestBill.bonus);
                await lastestBill.save();

                // Nếu bill có liên kết với một bill khác, cập nhật bill đó
                if (lastestBill.billId) {
                    const includedBill = await Bill.findById(lastestBill.billId);
                    if (includedBill) {
                        includedBill.status = 1;
                        box.amount += (includedBill.amount + includedBill.bonus);
                        await includedBill.save();
                    }
                }
            }

            await box.save();

            // Đánh dấu tất cả các giao dịch thuộc box này về trạng thái 7
            await Transaction.updateMany({ boxId: box._id, status: { $in: [2, 6, 8], $ne: 3 } }, { status: 7 });
        }

        // Nếu transaction mới nhất có status = 7
        else if (latestTransaction.status === 7) {
            // Xóa tất cả bill có status = 1 liên quan đến boxId

            const bill = await Bill.findOne({boxId: box._id, status: 1}).populate([
                { path: 'billId'},
            ]);

            if (bill.billId && bill.billId.status === 2) {
                const updateBill = await Bill.findById(bill.billId._id);
                updateBill.status = 1;
                box.amount += updateBill.amount + updateBill.bonus;
                await box.save();
                await updateBill.save();
            } else {
                await Bill.deleteMany({ boxId: box._id, status: { $in: 1, $ne: 3}});

                // Tổng hợp số tiền từ tất cả transaction có trạng thái 2, 6, 7, 8
                const result = await Transaction.aggregate([
                    { $match: { boxId: box._id, status: { $in: [2, 6, 7, 8] } } },
                    { $group: { _id: null, totalAmount: { $sum: "$amount" } } },
                ]);
                const totalAmount = result.length > 0 ? result[0].totalAmount : 0;
                let paidAmount = totalAmount - box.amount; // Số tiền đã thanh toán
    
                // Lấy danh sách transaction có status = 7 theo thứ tự cũ nhất trước
                const transactionsToUpdate = await Transaction.find({ boxId: box._id, status: 7 }).sort({ createdAt: 1 });
    
                if (box.amount === 0) {
                    // Nếu số dư trong box là 0, tất cả giao dịch trạng thái 7 chuyển thành 2
                    await Transaction.updateMany({ boxId: box._id, status: 7 }, { status: 2 });
                } else if (paidAmount > 0) {
                    // Nếu đã thanh toán nhiều hơn số dư hiện tại, cập nhật trạng thái giao dịch
                    const bulkOps = [];
                    for (const transaction of transactionsToUpdate) {
                        paidAmount -= transaction.amount;
                        bulkOps.push({
                            updateOne: {
                                filter: { _id: transaction._id },
                                update: { status: 8 },
                            },
                        });
                        if (paidAmount <= 0) break; // Dừng khi số tiền còn lại không đủ để trừ tiếp
                    }
    
                    if (bulkOps.length > 0) {
                        await Transaction.bulkWrite(bulkOps);
                    }
    
                    // Đổi trạng thái tất cả các transaction còn lại từ 7 sang 6
                    await Transaction.updateMany({ boxId: box._id, status: 7 }, { status: 6 });
                } else if (paidAmount === 0) {
                    await Transaction.updateMany({ boxId: box._id, status: 7 }, { status: 6 });
                }
            }
           
        }

        // Nếu transaction mới nhất có status = 6, cập nhật thành 1 và giảm số dư trong box
        else if (latestTransaction.status === 6) {
            const hasStatus8 = transactions.some(transaction => transaction.status === 8);
            if (hasStatus8) {
                const lastestBill = await Bill.findOne({ boxId: box._id, status: { $ne: 3 } }).sort({ createdAt: -1 });

                if (lastestBill) {
                    lastestBill.status = 1;
                    box.amount += lastestBill.amount;
                    await lastestBill.save();
    
                    // Nếu bill có liên kết với một bill khác, cập nhật bill đó
                    if (lastestBill.billId) {
                        const includedBill = await Bill.findById(lastestBill.billId);
                        if (includedBill) {
                            includedBill.status = 1;
                            box.amount += includedBill.amount;
                            await includedBill.save();
                        }
                    }
                }
    
                await box.save();
    
                // Đánh dấu tất cả các giao dịch thuộc box này về trạng thái 7
                await Transaction.updateMany({ boxId: box._id, status: { $in: [2, 6, 8], $ne: 3 } }, { status: 7 });
            } else {
                latestTransaction.status = 1;
                box.amount -= latestTransaction.amount;
                await latestTransaction.save();
                await box.save();
            }
        } 
        
        else if (latestTransaction.status === 3) {
            latestTransaction.status = 1;
            latestTransaction.createdAt =  new Date().toISOString();
            await latestTransaction.save();
        }
        // Nếu transaction mới nhất có status = 1, tìm transaction tiếp theo có status = 6 để cập nhật
        else if (latestTransaction.status === 1) {
            const hasStatus8 = transactions.some(transaction => transaction.status === 8);
            const hasStatus7 = transactions.some(transaction => transaction.status === 7);

            if (hasStatus8) {
                const lastestBill = await Bill.findOne({ boxId: box._id, status: { $ne: 3 } }).sort({ createdAt: -1 });

                if (lastestBill) {
                    lastestBill.status = 1;
                    box.amount += lastestBill.amount;
                    await lastestBill.save();
    
                    // Nếu bill có liên kết với một bill khác, cập nhật bill đó
                    if (lastestBill.billId) {
                        const includedBill = await Bill.findById(lastestBill.billId);
                        if (includedBill) {
                            includedBill.status = 1;
                            box.amount += includedBill.amount;
                            await includedBill.save();
                        }
                    }
                }
    
                await box.save();
    
                // Đánh dấu tất cả các giao dịch thuộc box này về trạng thái 7
                await Transaction.updateMany({ boxId: box._id, status: { $in: [2, 6, 8], $ne: 3 } }, { status: 7 });
            } else if (hasStatus7) {
                  // Xóa tất cả bill có status = 1 liên quan đến boxId
                await Bill.deleteMany({ boxId: box._id, status: 1});

                // Tổng hợp số tiền từ tất cả transaction có trạng thái 2, 6, 7, 8
                const result = await Transaction.aggregate([
                    { $match: { boxId: box._id, status: { $in: [2, 6, 7, 8] } } },
                    { $group: { _id: null, totalAmount: { $sum: "$amount" } } },
                ]);
                const totalAmount = result.length > 0 ? result[0].totalAmount : 0;
                let paidAmount = totalAmount - box.amount; // Số tiền đã thanh toán

                // Lấy danh sách transaction có status = 7 theo thứ tự cũ nhất trước
                const transactionsToUpdate = await Transaction.find({ boxId: box._id, status: 7 }).sort({ createdAt: 1 });

                if (box.amount === 0) {
                    // Nếu số dư trong box là 0, tất cả giao dịch trạng thái 7 chuyển thành 2
                    await Transaction.updateMany({ boxId: box._id, status: 7 }, { status: 2 });
                } else if (paidAmount > 0) {
                    // Nếu đã thanh toán nhiều hơn số dư hiện tại, cập nhật trạng thái giao dịch
                    const bulkOps = [];
                    for (const transaction of transactionsToUpdate) {
                        paidAmount -= transaction.amount;
                        bulkOps.push({
                            updateOne: {
                                filter: { _id: transaction._id },
                                update: { status: 8 },
                            },
                        });
                        if (paidAmount <= 0) break; // Dừng khi số tiền còn lại không đủ để trừ tiếp
                    }

                    if (bulkOps.length > 0) {
                        await Transaction.bulkWrite(bulkOps);
                    }

                    // Đổi trạng thái tất cả các transaction còn lại từ 7 sang 6
                    await Transaction.updateMany({ boxId: box._id, status: 7 }, { status: 6 });
                } else if (paidAmount === 0) {
                    await Transaction.updateMany({ boxId: box._id, status: 7 }, { status: 6 });
                }
            }
            else {
                let index = 1;
                while (index < transactions.length) {
                    if (transactions[index].status === 6 || transactions[index].status === 3) {
                        await transactions[index].updateOne({ status: 1 });
                        box.amount -= transactions[index].amount;
                        await box.save();
                        break;
                    }
                    index++;
                }
            }
        }
        const io = getSocket();

        io.emit('undo_box', {
            box
        });
        
        return res.json({ 
            status: true,
            message: 'Undo box success',
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

const addNote = async (req, res) => {
    try {
        const { id } = req.params;

        const permissions = await getPermissions(req.user.id);

        if (!permissions.some(permission => permission.slug === 'note')) {
            return res.status(400).json({ message: `Không đủ quyền` });
        }
        
        const box = await BoxTransaction.findById(id);
        if (!box || box === 'lock') return res.status(404).json({ message: 'Box không tìm thấy hoặc bị khoá' });

        const { note } = req.body;
        if (!note) return res.status(400).json({ message: `Chưa nhập note` });

        box.notes.push(note);
        await box.save();

        const io = getSocket();

        io.emit('add_note', {
            box
        });

        return res.json({ 
            status: true,
            message: 'Add note success',
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

const deleteNote = async (req, res) => {
    try {
        const { id } = req.params;
        const permissions = await getPermissions(req.user.id);

        if (!permissions.some(permission => permission.slug === 'note')) {
            return res.status(400).json({ message: `Không đủ quyền` });
        }

        const box = await BoxTransaction.findById(id);
        if (!box || box === 'lock') return res.status(404).json({ message: 'Box không tìm thấy hoặc bị khoá' });

        const { note } = req.body;
        if (!note) return res.status(400).json({ message: `Chưa nhập note` });

        if (!box.notes || !box.notes.includes(note)) {
            return res.status(400).json({ message: 'Note không tồn tại' });
        }

        const index = box.notes.indexOf(note);
        if (index !== -1) {
            box.notes.splice(index, 1);
        }

        await box.save();

        const io = getSocket();

        io.emit('delete_note', {
            box
        });

        return res.json({ 
            status: true,
            message: 'Delete note success',
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

const updateBox = async (req, res) => {
    try {
        const { id } = req.params;
        
        const box = await BoxTransaction.findById(id);
        if (!box || box.status === "lock") return res.status(404).json({ message: 'Box không tìm thấy hoặc bị khoá' });

        const name = req.body.name ? req.body.name : '';
        let messengerId = req.body.messengerId ? req.body.messengerId : '';
        const buyerName = req.body.buyerName ? req.body.buyerName : '';
        const buyerFb = req.body.buyerFb ? req.body.buyerFb : '';
        const sellerName = req.body.sellerName ? req.body.sellerName : '';
        const sellerFb = req.body.sellerFb ? req.body.sellerFb : '';

        if (box.messengerId === messengerId) messengerId = '';
        
        const transaction = await Transaction.findOne({ boxId: id, status: { $in: [2, 6, 7, 8]}});
        const user = await Staff.findById(req.user.id);

        // let buyerCustomer = await Customer.findOne({
        //     boxId: { $in: [box._id] },
        //     type: 'buyer',
        //     isDeleted: false,
        // });

        // let sellerCustomer = await Customer.findOne({
        //     boxId: { $in: [box._id] },
        //     type: 'seller',
        //     isDeleted: false,
        // });

        // if (buyerFb) {
        //     const customer = await Customer.findOne({
        //         facebookId: buyerFb
        //     });
        //     if (customer) buyerCustomer = customer;
        //     else buyerCustomer.facebookId = buyerFb;
        //     if (buyerName) buyerCustomer.nameCustomer = buyerName;
        //     await buyerCustomer.save();
        // }

        // if (sellerFb) {
        //     const customer = await Customer.findOne({
        //         facebookId: sellerFb
        //     });
        //     if (customer) sellerCustomer = customer;
        //     else sellerCustomer.facebookId = sellerFb;
        //     if (sellerName) sellerCustomer.nameCustomer = sellerName;
        //     await sellerCustomer.await();
        // }
        
        if (!transaction && messengerId) {
            const oldBox = await BoxTransaction.findOne({ messengerId: messengerId });
            if (!oldBox) {
                const newbox = await BoxTransaction.create({
                    name,
                    messengerId,
                    staffId: user._id,
                    typeBox: box.typeBox
                });
                // buyerCustomer.boxId.push(newbox._id);
                // sellerCustomer.boxId.push(newbox._id);
                // await buyerCustomer.save();
                // await sellerCustomer.save();
                await Transaction.updateMany({boxId: box._id}, {boxId: newbox._id});
                await BoxTransaction.findByIdAndDelete(box._id);
                return res.json({ 
                    status: true,
                    message: 'Edit box success',
                    box: newbox
                });
            } else {
                // buyerCustomer.boxId.push(oldBox._id);
                // buyerCustomer.nameCustomer = buyerName;
                // sellerCustomer.boxId.push(oldBox._id);
                // sellerCustomer.nameCustomer = sellerName;
                // await buyerCustomer.save();
                // await sellerCustomer.save();
                await Transaction.updateMany({boxId: box._id}, {boxId: oldBox._id});
                await BoxTransaction.findByIdAndDelete(box._id);
                oldBox.name = name;
                await oldBox.save();
                return res.json({ 
                    status: true,
                    message: 'Edit box success',
                    box: oldBox
                });
            }
        } else if (transaction && messengerId) {
            return res.status(400).json({ message: `Không thể sửa messenger ID` });
        }

        if (name) box.name = name;
        await box.save();

        const io = getSocket();

        io.emit('update_box', {
            box
        });

        return res.json({ 
            status: true,
            message: 'Edit box success',
            box: box
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}


const switchLock = async (req, res) => {
    try {
        const permissions = await getPermissions(req.user.id);

        const { id } = req.params;
        
        // Tìm BoxTransaction theo ID
        const box = await BoxTransaction.findById(id);
        if (!box) return res.status(404).json({ message: 'Box not found' });

        if (box.status === 'lock') {
            if (!permissions.some(permission => permission.slug === 'unlock-box')) {
                return res.status(400).json({ message: `Không đủ quyền` });
            }
            box.status = 'active';
        }
        else {
            if (!permissions.some(permission => permission.slug === 'lock-box')) {
                return res.status(400).json({ message: `Không đủ quyền` });
            }
            box.status = 'lock';
        }

        await box.save();

        const io = getSocket();

        io.emit('switch_box', {
            box
        });

        return res.json({ 
            status: true,
            message: 'Switch box success',
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = {
    undoBox,
    getTransactionsByBoxId,
    getBillsByBoxId,
    getById,
    addNote,
    updateBox,
    switchLock,
    deleteNote
}