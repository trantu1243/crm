const { Transaction, BoxTransaction, Bill } = require("../models");

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


const undoBox = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Tìm BoxTransaction theo ID
        const box = await BoxTransaction.findById(id);
        if (!box) return res.status(404).json({ message: 'Box not found' });

        // Lấy danh sách transactions (trừ những transaction có status = 3), sắp xếp theo thời gian mới nhất
        const transactions = await Transaction.find({ boxId: box._id, status: { $ne: 3 } }).sort({ createdAt: -1 });
        if (transactions.length === 0) return res.status(400).json({ message: 'No transactions found' });

        const latestTransaction = transactions[0]; // Giao dịch mới nhất

        // Nếu transaction mới nhất có status = 2 hoặc 8 -> Cập nhật lại hóa đơn (Bill) và số dư trong box
        if ([2, 8].includes(latestTransaction.status)) {
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
            await Transaction.updateMany({ boxId: box._id, status: { $in: [2, 6, 8] } }, { status: 7 });
        }

        // Nếu transaction mới nhất có status = 7
        if (latestTransaction.status === 7) {
            // Xóa tất cả bill có status = 1 liên quan đến boxId
            await Bill.updateMany({ boxId: box._id, status: 1 }, { status: 3 });

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
            }
        }

        // Nếu transaction mới nhất có status = 6, cập nhật thành 1 và giảm số dư trong box
        if (latestTransaction.status === 6) {
            latestTransaction.status = 1;
            box.amount -= latestTransaction.amount;
            await latestTransaction.save();
            await box.save();
        }

        // Nếu transaction mới nhất có status = 1, tìm transaction tiếp theo có status = 6 để cập nhật
        if (latestTransaction.status === 1) {
            let index = 1;
            while (index < transactions.length) {
                if (transactions[index].status === 6) {
                    await transactions[index].updateOne({ status: 1 });
                    break;
                }
                index++;
            }

            // Nếu không có transaction nào có status = 6, đặt transaction mới nhất thành 3
            if (index === transactions.length) {
                await latestTransaction.updateOne({ status: 3 });
            }
        }

        return res.json({ message: 'Undo box success' });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    undoBox,
    getTransactionsByBoxId,
    getBillsByBoxId
}