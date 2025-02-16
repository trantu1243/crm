const { Transaction, BoxTransaction, BankAccount, Customer, Staff, Bill } = require("../models");
const { generateQrCode } = require("../services/qr.service");
const mongoose = require('mongoose');

const getTransactions = async (req, res) => {
    try {
        const {
            staffId,
            status,
            bankId,
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
        if (bankId) filter.bankId = { $in: Array.isArray(bankId) ? bankId : [bankId] };

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

        const transactions = await Transaction.paginate(filter, {
            page: Number(page),
            limit: Number(limit),
            populate: [
                { path: 'staffId', select: 'name_staff email uid_facebook avatar' },
                { path: 'bankId', select: 'bankName bankCode bankAccount bankAccountName binBank' }
            ],
            sort: { createdAt: -1 },
        });

        res.status(200).json({
            message: 'Transactions fetched successfully',
            data: transactions,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getById = async (req, res) => {
    try {
        const { id } = req.params;
        const transaction = await Transaction.findById(id).populate(
            [
                { path: 'staffId', select: 'name_staff email uid_facebook avatar' },
                { path: 'bankId', select: 'bankName bankCode bankAccount bankAccountName binBank' }
            ]
        );
        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }
        res.status(200).json({
            message: 'Transaction fetched successfully',
            data: transaction,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const createTransaction = async (req, res) => {
    try {
        const requiredFields = ['bankId', 'amount', 'typeBox', 'content', 'messengerId', 'typeFee', 'fee', 'bonus'];
        for (const field of requiredFields) {
            if (!req.body[field]) {
                return res.status(400).json({ message: `${field} is required` });
            }
        }

        const {
            bankId,
            typeBox,
            amount,
            content,
            messengerId,
            typeFee,
            fee,
            bonus
        } = req.body;

        let oriAmount = Number(amount);
        let totalAmount = Number(amount);

        if (typeFee === "buyer") {
            totalAmount += fee;
        } else if (typeFee === "seller") {
            oriAmount -= fee;
        } else if (typeFee === "split") {
            oriAmount -= fee / 2;
            totalAmount += fee / 2;
        }

        const user = await Staff.findById(req.user.id);
        const bank = await BankAccount.findById(bankId);

        let box = await BoxTransaction.findOne({messengerId: messengerId});

        if (!box) {
            box = await BoxTransaction.create({
                name: '',
                messengerId: messengerId,
                staffId: user._id,
                typeBox: typeBox
            });
            
            const buyerCustomer = await Customer.create({
                nameCustomer: "",
                facebookId: "",
                boxId: [box._id],
                type: "buyer"
            });
            const sellerCustomer = await Customer.create({
                nameCustomer: "",
                facebookId: "",
                boxId: [box._id],
                type: "seller"
            });
        }
        
        const newTransaction = await Transaction.create({
            boxId: box._id,
            bankId: bank._id,
            amount: oriAmount,
            content,
            fee,
            totalAmount,
            linkQr: `https://img.vietqr.io/image/${bank.binBank}-${bank.bankAccount}-nCr4dtn.png?amount=${totalAmount}&addInfo=${content}&accountName=${bank.bankAccountName}`,
            messengerId,
            staffId: user._id,
            typeFee,
            bonus: Number(bonus)
        });
        
        return res.status(201).json({
            message: 'Transaction created successfully',
            transaction: newTransaction,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

const updateTransaction = async (req, res) => {
    try {
        const requiredFields = ['bankId', 'amount', 'typeBox', 'content', 'messengerId', 'typeFee', 'fee', 'bonus'];
        for (const field of requiredFields) {
            if (!req.body[field]) {
                return res.status(400).json({ message: `${field} is required` });
            }
        }
    
        const {
            bankId,
            typeBox,
            amount,
            content,
            messengerId,
            typeFee,
            fee,
            bonus
        } = req.body;

        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: 'ID is required' });
        }

        const tran = await Transaction.findById(id);
        if (tran.status !== 1) {
            return res.status(400).json({ message: 'Bad request' });
        }

        let oriAmount = Number(amount);
        let totalAmount = Number(amount);

        if (typeFee === "buyer") {
            totalAmount += fee;
        } else if (typeFee === "seller") {
            oriAmount -= fee;
        } else if (typeFee === "split") {
            oriAmount -= fee / 2;
            totalAmount += fee / 2;
        }
        const user = await Staff.findById(req.user.id);
        const bank = await BankAccount.findById(bankId);

        let box = await BoxTransaction.findOne({messengerId: messengerId});
        
        if (box && box.status === 'lock') {
            return res.status(404).json({ message: 'Box is locked' })
        }

        if (!box) {
            box = await BoxTransaction.create({
                name: '',
                messengerId: messengerId,
                staffId: user._id,
                typeBox: typeBox
            });    
        }

        const transaction = await Transaction.findByIdAndUpdate(id, {
            boxId: box._id,
            bankId: bank._id,
            amount: oriAmount,
            content,
            fee,
            totalAmount,
            linkQr: `https://img.vietqr.io/image/${bank.binBank}-${bank.bankAccount}-nCr4dtn.png?amount=${totalAmount}&addInfo=${content}&accountName=${bank.bankAccountName}`,
            messengerId,
            typeFee,
            bonus: Number(bonus)
        }, { new: true })
        .populate([
            { path: 'staffId', select: 'name_staff email uid_facebook avatar' },
            { path: 'bankId', select: 'bankName bankCode bankAccount bankAccountName binBank' }
        ]);
        
        return res.status(200).json({
            message: 'Transaction updated successfully',
            transaction: transaction,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

const confirmTransaction = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { id } = req.params;

        // 🔍 Tìm và cập nhật transaction (chỉ cập nhật nếu status === 1)
        const transaction = await Transaction.findOneAndUpdate(
            { _id: id, status: 1 }, 
            { status: 6 }, 
            { new: true, session }
        );

        if (!transaction) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ message: "Transaction not eligible for confirmation" });
        }

        // 🔍 Lấy box và cập nhật số tiền
        const box = await BoxTransaction.findById(transaction.boxId).session(session);
        
        if (box && box.status === 'lock') {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ message: 'Box is locked' })
        }

        if (!box) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ message: "Box not found" });
        }

        // 🔥 Cộng tiền vào BoxTransaction
        await BoxTransaction.updateOne(
            { _id: box._id },
            { $inc: { amount: transaction.amount } },
            { session }
        );

        // 🔍 Kiểm tra xem đã có Bill chưa
        const existingBill = await Bill.findOne({ boxId: box._id, status: 1 }).session(session);
        if (existingBill) {
            await Transaction.updateOne({ _id: transaction._id }, { status: 7 }, { session });
        }

        // 🔥 Cập nhật tất cả giao dịch có status = 2 thành status = 8
        await Transaction.updateMany({ boxId: box._id, status: 2 }, { status: 8 }, { session });

        // ✅ Commit transaction (lưu tất cả thay đổi)
        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({
            status: true,
            message: "Transaction confirmed successfully",
        });
    } catch (error) {
        await session.abortTransaction(); // ❌ Hoàn tác nếu có lỗi
        session.endSession();
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};


const cancelTransaction = async (req, res) => {
    try {
        const { id } = req.params;

        const transaction = await Transaction.findById(id);

        if (!transaction || transaction.status !== 1) {
            return res.status(400).json({ message: 'Transaction not eligible for cancellation' });
        }

        const box = await BoxTransaction.findById(transaction.boxId);
        
        if (box && box.status === 'lock') {
            return res.status(404).json({ message: 'Box is locked' })
        }

        transaction.status = 3;
        await transaction.save();

        return res.status(200).json({
            message: 'Transaction canceled successfully',
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = {
    getTransactions,
    getById,
    createTransaction,
    updateTransaction,
    confirmTransaction,
    cancelTransaction
}
  
