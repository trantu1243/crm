const { Transaction, BoxTransaction, BankAccount, Customer, Staff, Bill } = require("../models");
const { getPermissions } = require("../services/permission.service");
const mongoose = require('mongoose');
const { getSocket } = require("../socket/socketHandler");
const { saveUserLogToQueue } = require("../services/log.service");

const getTransactions = async (req, res) => {
    try {
        const {
            search,
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
            hasNotes,
            isLocked
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
          
            if (startDate) {                
                filter.createdAt.$gte = startDate;
            }
            if (endDate) {
                filter.createdAt.$lte = endDate;
            }
            
        }
        if (content) filter.content = { $regex: content, $options: 'i' };

        if (search) {
            const boxMatches = await BoxTransaction.find({
                messengerId: { $regex: search, $options: "i" }
            }).select("_id");

            const boxIds = boxMatches.map(box => box._id);

            filter.$or = [
                { messengerId: { $regex: search, $options: 'i' } },
                { content: { $regex: search, $options: 'i' } },
                { boxId: { $in: boxIds } }
            ];
        }

        if (hasNotes === 'true') {
            const boxWithNotes = await BoxTransaction.find({
                $and: [
                  { notes: { $exists: true } },
                  { notes: { $type: 'array' } },
                  { notes: { $not: { $size: 0 } } }
                ]
            });          
            const boxIdsWithNotes = boxWithNotes.map(box => box._id);
            filter.boxId = { $in: boxIdsWithNotes };
        }

        if (isLocked === 'true') {
            const lockedBoxes = await BoxTransaction.find({
                status: 'lock'
            }).select('_id');
            const lockedBoxIds = lockedBoxes.map(box => box._id);
            filter.boxId = { $in: lockedBoxIds };
        }

        // Sử dụng mongoose-paginate-v2 để phân trang
        const transactions = await Transaction.paginate(filter, {
            page: Number(page),
            limit: Number(limit),
            populate: [
                { path: 'staffId', select: 'name_staff email uid_facebook avatar' },
                { path: 'bankId', select: 'bankName bankCode bankAccount bankAccountName binBank' },
                { path: 'boxId', select: 'amount messengerId notes status' }
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
        return res.status(200).json({
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
        const permissions = await getPermissions(req.user.id);

        if (!permissions.some(permission => permission.slug === 'create-transaction')) {
            return res.status(400).json({ message: `Không đủ quyền` });
        }

        const requiredFields = ['bankId', 'typeBox', 'content', 'messengerId', 'typeFee', 'fee'];
        for (const field of requiredFields) {
            if (!req.body[field]) {
                return res.status(400).json({ message: `${field} is required` });
            }
        }
        const {
            bankId,
            typeBox,
            amount = 0,
            content,
            messengerId,
            typeFee,
            fee,
            bonus = 0
        } = req.body;

        if (amount === 0 && bonus === 0) {
            return res.status(400).json({ message: `Amount is required` });
        }

        let oriAmount = Number(amount);
        let totalAmount = Number(amount);

        if (typeFee === "buyer") {
            totalAmount += Number(fee);
        } else if (typeFee === "seller") {
            oriAmount -= Number(fee);
        } else if (typeFee === "split") {
            oriAmount -= Number(fee) / 2;
            totalAmount += Number(fee) / 2;
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
            
            // const buyerCustomer = await Customer.create({
            //     nameCustomer: "",
            //     facebookId: "",
            //     boxId: [box._id],
            //     type: "buyer"
            // });
            // const sellerCustomer = await Customer.create({
            //     nameCustomer: "",
            //     facebookId: "",
            //     boxId: [box._id],
            //     type: "seller"
            // });
        } else {
            if (box.status === 'active') {
                const tran = await Transaction.findOne({ boxId: box._id }).sort({ createdAt: -1 }).populate(
                    [
                        { path: 'bankId', select: 'bankName bankCode bankAccount bankAccountName binBank' }
                    ]);
                if (tran && tran.bankId.bankCode !== bank.bankCode) {

                    return res.status(400).json({ message: `Box đang hoạt động trên ngân hàng ${tran.bankId.bankName}` });
                }
            } else {
                box.status = 'active';
                box.flag += 1;

                await box.save();
            }
        }
        
        const newTransaction = await Transaction.create({
            boxId: box._id,
            bankId: bank._id,
            amount: oriAmount,
            content,
            fee,
            totalAmount,
            linkQr: `https://img.vietqr.io/image/${bank.binBank}-${bank.bankAccount}-nCr4dtn.png?amount=${totalAmount + Number(bonus)}&addInfo=${content}&accountName=${bank.bankAccountName}`,
            messengerId,
            staffId: user._id,
            typeFee,
            bonus: Number(bonus),
            flag: box.flag ? box.flag : 1
        });

        await saveUserLogToQueue(user._id, newTransaction._id, "CREATE_TRANSACTION", "Tạo GDTG", req);

        const io = getSocket();

        io.emit('create_transaction', {
            transaction: newTransaction
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
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const permissions = await getPermissions(req.user.id);
        if (!permissions.some(permission => permission.slug === 'create-transaction')) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ message: `Không đủ quyền` });
        }

        const requiredFields = ['bankId', 'amount', 'typeBox', 'content', 'messengerId', 'typeFee', 'fee', 'bonus'];
        for (const field of requiredFields) {
            if (!req.body[field]) {
                await session.abortTransaction();
                session.endSession();
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
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ message: 'ID is required' });
        }

        const tran = await Transaction.findById(id).session(session);
        if (!tran) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ message: 'Transaction not found' });
        }

        if (tran.status !== 1 && tran.status !== 6) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ message: 'Bad request' });
        }

        let oriAmount = Number(amount);
        let totalAmount = Number(amount);
        if (typeFee === "buyer") {
            totalAmount += Number(fee);
        } else if (typeFee === "seller") {
            oriAmount -= Number(fee);
        } else if (typeFee === "split") {
            oriAmount -= Number(fee) / 2;
            totalAmount += Number(fee) / 2;
        }

        const user = await Staff.findById(req.user.id).session(session);
        const bank = await BankAccount.findById(bankId).session(session);
        if (!bank) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ message: 'Bank not found' });
        }

        // 6. Lấy (hoặc tạo) box
        let box = await BoxTransaction.findOne({ messengerId }).session(session);
        if (box && box.status === 'lock') {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ message: 'Box is locked' })
        }

        if (!box) {
            box = await BoxTransaction.create([{
                name: '',
                messengerId: messengerId,
                staffId: user._id,
                typeBox: typeBox
            }], { session });
            // Khi dùng .create() với session, cần truyền mảng + object session
            // Kết quả trả về cũng là mảng, ta destruct để lấy doc
            box = box[0];
        } else {
            if (box.status === 'active') {
                const tran = await Transaction.findOne({ boxId: box._id }).sort({ createdAt: -1 }).populate(
                    [
                        { path: 'bankId', select: 'bankName bankCode bankAccount bankAccountName binBank' }
                    ]);
                // if (tran && tran.bankId.bankCode !== bank.bankCode) {

                //     await session.abortTransaction();
                //     session.endSession();
                //     return res.status(400).json({ message: `Box đang hoạt động trên ngân hàng ${tran.bankId.bankName}` });
                // }
            } else {
                box.status = 'active';
                box.flag += 1;
                await box.save();
            }
        }

        if (tran.status === 6 && tran.amount !== oriAmount) {
            if (box.amount > 0) {
                box.amount -= tran.amount;
            }
            box.amount += oriAmount;
            await box.save({ session });
        }

        // 8. Update transaction
        const updatedTran = await Transaction.findByIdAndUpdate(
            id,
            {
                boxId: box._id,
                bankId: bank._id,
                amount: oriAmount,
                content,
                fee,
                totalAmount,
                linkQr: `https://img.vietqr.io/image/${bank.binBank}-${bank.bankAccount}-nCr4dtn.png?amount=${totalAmount}&addInfo=${content}&accountName=${bank.bankAccountName}`,
                messengerId,
                typeFee,
                bonus: Number(bonus),
                flag: box.flag ? box.flag : 1
            },
            { new: true, session }
        ).populate([
            { path: 'staffId', select: 'name_staff email uid_facebook avatar' },
            { path: 'bankId', select: 'bankName bankCode bankAccount bankAccountName binBank' }
        ]);

        // 9. Commit transaction
        await session.commitTransaction();
        session.endSession();

        await saveUserLogToQueue(user._id, updatedTran._id, "UPDATE_TRANSACTION", "Chỉnh sửa GDTG", req);

        // 10. Socket thông báo
        const io = getSocket();
        io.emit('update_transaction', {
            transaction: updatedTran
        });

        return res.status(200).json({
            message: 'Transaction updated successfully',
            transaction: updatedTran,
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};


const confirmTransaction = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {

        const permissions = await getPermissions(req.user.id);
        if (!permissions.some(permission => permission.slug === 'create-transaction')) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ message: `Không đủ quyền` });
        }

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
        let box = await BoxTransaction.findById(transaction.boxId).session(session);
        
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
        
        // ✅ Commit transaction (lưu tất cả thay đổi)
        await session.commitTransaction();
        session.endSession();

        const user = await Staff.findById(req.user.id);
        await saveUserLogToQueue(user._id, transaction._id, "CONFIRM_TRANSACTION", "Tạo GDTG", req);

        const io = getSocket();

        io.emit('confirm_transaction', {
            transaction,
        });

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
        const permissions = await getPermissions(req.user.id);

        if (!permissions.some(permission => permission.slug === 'create-transaction')) {
            return res.status(400).json({ message: `Không đủ quyền` });
        }

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

        const user = await Staff.findById(req.user.id);
        await saveUserLogToQueue(user._id, transaction._id, "CANCEL_TRANSACTION", "Hủy GDTG", req);

        const io = getSocket();
        
        io.emit('cancel_transaction', {
            transaction
        });

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
  
