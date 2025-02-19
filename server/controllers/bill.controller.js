const { Bill, BankApi, BoxTransaction, Customer, Staff, Transaction } = require("../models");
const { getPermissions } = require("../services/permission.service");
const { generateQrCode } = require("../services/qr.service");
const mongoose = require('mongoose');

const getBills = async (req, res) => {
    try {
        const {
            staffId,
            status,
            bankCode,
            minAmount,
            maxAmount,
            startDate,
            endDate,
            content,
            page = 1,
            limit = 10,
        } = req.query;
        
        const filter = {};

        if (staffId) filter.staffId = { $in: Array.isArray(staffId) ? staffId : [staffId] };
        if (status) filter.status = { $in: Array.isArray(status) ? status : [status] };
        if (bankCode) filter.bankCode = { $in: Array.isArray(bankCode) ? bankCode : [bankCode] };

        if (minAmount || maxAmount) {
            filter.amount = {};
            if (minAmount) filter.amount.$gte = Number(minAmount);
            if (maxAmount) filter.amount.$lte = Number(maxAmount);
        }
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = new Date(startDate);
            if (endDate) filter.createdAt.$lte = new Date(endDate);
        }
        if (content) filter.content = { $regex: content, $options: 'i' };

        const bills = await Bill.paginate(filter, {
            page: Number(page),
            limit: Number(limit),
            populate: [
                { path: 'staffId', select: 'name_staff email uid_facebook avatar' },
            ],
            sort: { createdAt: -1 },
        });

        res.status(200).json({
            message: 'Bills fetched successfully',
            data: bills,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const createBill = async (req, res) => {
    try {
        const permissions = await getPermissions(req.user.id);

        if (!permissions.some(permission => permission.slug === 'create-bill')) {
            res.status(400).json({ message: `Không đủ quyền` });
        }

        const requiredFields = ['boxId'];
        for (const field of requiredFields) {
            if (!req.body[field]) {
                return res.status(400).json({ message: `${field} is required` });
            }
        }
        const { boxId, buyer, seller } = req.body;

        if ( !buyer && !seller ) {
            return res.status(400).json({ message: 'Bad request' });
        }

        const box = await BoxTransaction.findById(boxId);

        const existingBill = await Bill.findOne({boxId: box._id, status: 1});
        if (existingBill) {
            return res.status(400).json({ message: 'Có bill thanh khoản chưa được xử lý' });
        }

        const existingTransaction = await Transaction.findOne({ boxId: box._id, status: { $in: [1, 7] } });
        if (existingTransaction) {
            return res.status(400).json({ message: 'Có giao dịch chưa nhận được tiền' });
        }

        let boxAmount = box.amount;
        if (buyer) boxAmount -= Number(buyer.amount);
        if (seller) boxAmount -= Number(seller.amount);
        if (boxAmount <= 0) {
            return res.status(400).json({ message: 'Bad request' });
        }

        const staff = await Staff.findById(req.user.id);

        let buyerBill = null;
        if ( buyer ) {
            const requiredBuyerFields = ['bankCode', 'stk', 'content', 'amount'];
            for (const field of requiredBuyerFields) {
                if (!buyer[field]) {
                    return res.status(400).json({ message: `${field} is required` });
                }
            }
            const { bankCode, stk, content, amount, bonus = 0} = buyer;

            const bank = await BankApi.findOne({ bankCode: bankCode});
            console.log(boxId)
            const customer = await Customer.findOne({
                boxId: { $in: [boxId] },
                type: 'buyer',
                isDeleted: false,
            });
            const exists = customer.bankAccounts.some(
                (account) => account.bankCode === bankCode && account.stk === stk
            );

            if (!exists) {
                customer.bankAccounts.push({ bankCode, stk });
                await customer.save();
            }

            buyerBill = {
                bankCode,
                stk,
                content,
                amount: Number(amount),
                bonus: Number(bonus),
                typeTransfer: 'buyer',
                boxId: box._id,
                linkQr: `https://img.vietqr.io/image/${bank.binBank}-${stk}-nCr4dtn.png?amount=${(Number(amount) - Number(bonus)) > 0 ? (Number(amount) - Number(bonus)) : 0 }&addInfo=${content}&accountName=`,
                staffId: staff._id
            };
        }

        let sellerBill = null;
        if ( seller ) {
            const requiredSellerFields = ['bankCode', 'stk', 'content', 'amount'];
            for (const field of requiredSellerFields) {
                if (!seller[field]) {
                    return res.status(400).json({ message: `${field} is required` });
                }
            }
            const { bankCode, stk, content, amount, bonus = 0 } = seller;
            const bank = await BankApi.findOne({ bankCode: bankCode});
            const customer = await Customer.findOne({
                boxId: { $in: [boxId] },
                type: 'seller',
                isDeleted: false,
            });

            const exists = customer.bankAccounts.some(
                (account) => account.bankCode === bankCode && account.stk === stk
            );

            if (!exists) {
                customer.bankAccounts.push({ bankCode, stk });
                await customer.save();
            }
        
            sellerBill = {
                bankCode,
                stk,
                content,
                amount: Number(amount),
                bonus: Number(bonus),
                typeTransfer: 'seller',
                boxId: box._id,
                linkQr: `https://img.vietqr.io/image/${bank.binBank}-${stk}-nCr4dtn.png?amount=${(Number(amount) - Number(bonus)) > 0 ? (Number(amount) - Number(bonus)) : 0 }&addInfo=${content}&accountName=`,
                staffId: staff._id
            };
        }

        if (buyer) buyerBill = await Bill.create(buyerBill);
        if (seller) sellerBill = await Bill.create(sellerBill);

        if (buyer && seller) {
            buyerBill.billId = sellerBill._id;
            sellerBill.billId = buyerBill._id;
            await buyerBill.save();
            await sellerBill.save();
        }

        const bills = await Transaction.updateMany({ boxId: boxId, status: { $in: [2, 6, 8] }}, {status: 7});
        
        return res.status(201).json({
            message: 'Bill created successfully',
            buyerBill,
            sellerBill
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}


const confirmBill = async (req, res) => {
    const permissions = await getPermissions(req.user.id);

    if (!permissions.some(permission => permission.slug === 'create-bill')) {
        res.status(400).json({ message: `Không đủ quyền` });
    }
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { id } = req.params;

        // 🔍 Tìm bill với status = 1 (chỉ xác nhận nếu bill chưa được xác nhận)
        const bill = await Bill.findOneAndUpdate(
            { _id: id, status: 1 },
            { status: 2 },
            { new: true, session }
        );

        if (!bill) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ message: "Bill not eligible for confirmation" });
        }

        // 🔍 Lấy box liên quan
        let box = await BoxTransaction.findById(bill.boxId).session(session);
        if (box && box.status === 'lock') {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ message: 'Box is locked' })
        }

        if (!box) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ message: "Box not found" });
        }

        // 📌 Tính tổng tiền có thể sử dụng từ các transaction có status 2, 6, 7, 8
        const result = await Transaction.aggregate([
            { $match: { boxId: box._id, status: { $in: [2, 6, 7, 8] } } },
            { $group: { _id: null, totalAmount: { $sum: "$amount" } } },
        ]).session(session);

        const totalAmount = result.length > 0 ? result[0].totalAmount : 0;

        // ❌ Kiểm tra số dư trước khi trừ tiền
        if (box.amount < bill.amount) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ message: "Insufficient balance in box" });
        }

        // ✅ Cập nhật số dư trong BoxTransaction
        await BoxTransaction.updateOne(
            { _id: box._id },
            { $inc: { amount: -bill.amount } },
            { session }
        );

        let paidAmount = totalAmount - ( box.amount - bill.amount);

        // 🔍 Kiểm tra bill có billId liên quan không
        if (bill.billId?.status === 1) {
            await session.commitTransaction();
            session.endSession();
            return res.status(200).json({ status: true, message: "Bill confirmed successfully" });
        }

        // 🔍 Lấy danh sách transaction có status = 7
        const transactions = await Transaction.find({ boxId: box._id, status: 7 })
            .sort({ createdAt: 1 })
            .session(session);
        
        if (box.amount - bill.amount === 0) {
            // ✅ Cập nhật toàn bộ transaction có status = 7 -> 2 (đã thanh toán)
            await Transaction.updateMany({ boxId: box._id, status: 7 }, { status: 2 }, { session });
        } else if (paidAmount > 0) {
            // ✅ Dùng bulkWrite để tối ưu cập nhật trạng thái giao dịch
            const bulkOps = [];
            for (const transaction of transactions) {
                paidAmount -= transaction.amount;
                bulkOps.push({
                    updateOne: {
                        filter: { _id: transaction._id },
                        update: { status: 8 },
                    },
                });
                if (paidAmount <= 0) break;
            }

            if (bulkOps.length > 0) {
                await Transaction.bulkWrite(bulkOps, { session });
            }

            await Transaction.updateMany({ boxId: box._id, status: 7 }, { status: 6 }, { session });
        }

        // ✅ Commit transaction nếu mọi thứ thành công
        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({ status: true, message: "Bill confirmed successfully" });
    } catch (error) {
        await session.abortTransaction(); // ❌ Hoàn tác nếu có lỗi
        session.endSession();
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};


const updateBill = async (req, res) => {
    try {
        const permissions = await getPermissions(req.user.id);

        if (!permissions.some(permission => permission.slug === 'create-bill')) {
            res.status(400).json({ message: `Không đủ quyền` });
        }

        const requiredFields = ['bankCode', 'stk', 'content', 'amount', 'bonus'];
        for (const field of requiredFields) {
            if (!req.body[field]) {
                return res.status(400).json({ message: `${field} is required` });
            }
        }

        const { id } = req.params;

        const bill = await Bill.findById(id);

        if (!bill) {
            return res.status(404).json({ message: 'Bill not found' });
        }

        const box = await BoxTransaction.findById(bill.boxId);
        
        if (box && box.status === 'lock') {
            return res.status(404).json({ message: 'Box is locked' })
        }

        if (bill.status !== 1) {
            return res.status(400).json({ message: 'Bad request' });
        }

        const bank = await BankApi.findOne({ bankCode: bankCode});
        const customer = await Customer.findOne({
            boxId: { $in: [boxId] },
            type: 'seller',
            isDeleted: false,
        });

        const exists = customer.bankAccounts.some(
            (account) => account.bankCode === bankCode && account.stk === stk
        );

        if (!exists) {
            customer.bankAccounts.push({ bankCode, stk });
            await customer.save();
        }

        const qrPayload = {
            accountNo: stk,
            acqId: bank.binBank, 
            addInfo: content,
            amount: amount.toString(),
        };
    
        const qrLink = await generateQrCode(qrPayload);

        bill.bankCode = bankCode;
        bill.stk = stk;
        bill.content = content;
        bill.amount = amount;
        bill.bonus = bonus;
        bill.linkQr = qrLink;

        await bill.save();

        return res.status(200).json({
            status: true,
            message: 'Bill updated successfully',
            bill
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

const cancelBill = async (req, res) => {
    try {
        const permissions = await getPermissions(req.user.id);

        if (!permissions.some(permission => permission.slug === 'create-bill')) {
            res.status(400).json({ message: `Không đủ quyền` });
        }

        const { id } = req.params;

        const bill = await Bill.findById(id);

        if (!bill || bill.status !== 1) {
            return res.status(400).json({ message: 'Bill not eligible for cancellation' });
        }
        let box = await BoxTransaction.findById(bill.boxId);
        
        if (box && box.status === 'lock') {
            return res.status(404).json({ message: 'Box is locked' })
        }
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

        bill.status = 3;
        await bill.save();

        return res.status(200).json({
            status: true,
            message: 'Bill canceled successfully',
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

const getById = async (req, res) => {
    try {
        const { id } = req.params;
        const bill = await Bill.findById(id).populate([
            { path: 'billId', select: 'bankCode stk content amount bonus typeTransfer boxId linkQr status staffId billId' },
            { path: 'boxId', select: 'name status messengerId staffId typeBox amount notes' },
        ]);
        if (!bill) {
            return res.status(404).json({ message: 'Bill not found' });
        }
        res.status(200).json({
            status: true,
            message: 'Bill fetched successfully',
            data: bill,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const switchBills = async (req, res) => {
    try {
        const permissions = await getPermissions(req.user.id);

        if (!permissions.some(permission => permission.slug === 'create-bill')) {
            res.status(400).json({ message: `Không đủ quyền` });
        }
        const { id } = req.params;

        const bill = await Bill.findById(id).populate([
            { path: 'billId'},
        ]);
        
        if (!bill || !bill.billId || bill.status !== 1 || bill.billId.status !== 1) {
            return res.status(400).json({ message: 'Bill not eligible for switch' });
        }

        const box = await BoxTransaction.findById(bill.boxId);
        
        if (box && box.status === 'lock') {
            return res.status(404).json({ message: 'Box is locked' })
        }
        
        const typeTranfer = bill.typeTransfer;
        bill.typeTransfer = bill.billId.typeTransfer;
        const sideBill = await Bill.findById(bill.billId._id);
        sideBill.typeTransfer = typeTranfer;
        await sideBill.save();
        await bill.save();

        return res.status(200).json({
            status: true,
            message: 'Bill canceled successfully',
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = {
    createBill,
    confirmBill,
    updateBill,
    cancelBill,
    getById,
    getBills,
    switchBills
}