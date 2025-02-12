const { Transaction, BoxTransaction, BankAccount, Customer, Staff, Bill } = require("../models");
const { generateQrCode } = require("../services/qr.service");

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

        const bank = await BankAccount.findById(bankId);

        let box = await BoxTransaction.findOne({messengerId: messengerId});
    
        if (!box) {
            box = await BoxTransaction.create({
                name: '',
                messengerId: messengerId,
                staffId: user._id,
                typeBox: typeBox
            });    
        }

        const qrPayload = {
            accountNo: bank.bankAccount,
            accountName: bank.bankAccountName,
            acqId: bank.binBank, 
            addInfo: content,
            amount: totalAmount.toString(),
        };
    
        const qrLink = await generateQrCode(qrPayload);

        const transaction = await Transaction.findByIdAndUpdate(id, {
            boxId: box._id,
            bankId: bank._id,
            amount: oriAmount,
            content,
            fee,
            totalAmount,
            linkQr: qrLink,
            messengerId,
            typeFee,
            bonus: Number(bonus)
        }, { new: true });
        
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
    try {
        const { id } = req.params;

        const transaction = await Transaction.findById(id);

        if (!transaction || transaction.status !== 1) {
            return res.status(400).json({ message: 'Transaction not eligible for confirmation' });
        }

        const box = await BoxTransaction.findById(transaction.boxId);
        box.amount += transaction.amount;
        transaction.status = 6;

        const existingBill = await Bill.findOne({boxId: box._id, status: 1});
        if (existingBill) transaction.status = 7;
        
        await box.save();
        await transaction.save();

        await Transaction.updateMany({ boxId: box._id, status: 2 }, { status: 8 });
        
        return res.status(200).json({
            status: true,
            message: 'Transaction confirmed successfully',
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

const cancelTransaction = async (req, res) => {
    try {
        const { id } = req.params;

        const transaction = await Transaction.findById(id);

        if (!transaction || transaction.status !== 1) {
            return res.status(400).json({ message: 'Transaction not eligible for cancellation' });
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
  
