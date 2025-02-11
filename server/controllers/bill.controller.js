const { Bill, BankApi, BoxTransaction, Customer, Staff, Transaction } = require("../models");
const { generateQrCode } = require("../services/qr.service");

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

module.exports = { getBills };


const createBill = async (req, res) => {
    try {
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
            return res.status(400).json({ message: 'Có gdtg chưa được thanh toán' });
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

            const qrPayload = {
                accountNo: stk,
                acqId: bank.binBank, 
                addInfo: content,
                amount: amount.toString(),
            };
        
            const qrLink = await generateQrCode(qrPayload);
        
            buyerBill = await Bill.create({
                bankCode,
                stk,
                content,
                amount: Number(amount),
                bonus: Number(bonus),
                typeTransfer: 'buyer',
                boxId: box._id,
                linkQr: `https://img.vietqr.io/image/${bank.binBank}-${stk}-nCr4dtn.png?amount=${amount}&addInfo=${content}&accountName=`,
                staffId: staff._id
            });
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
        
            sellerBill = await Bill.create({
                bankCode,
                stk,
                content,
                amount: Number(amount),
                bonus: Number(bonus),
                typeTransfer: 'seller',
                boxId: box._id,
                linkQr: `https://img.vietqr.io/image/${bank.binBank}-${stk}-nCr4dtn.png?amount=${amount}&addInfo=${content}&accountName=`,
                staffId: staff._id
            });
        }

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
    try {
        const { id } = req.params;

        // Tìm hóa đơn (Bill)
        const bill = await Bill.findById(id).populate([
            { path: 'billId'},
        ]);
        if (!bill) return res.status(404).json({ message: 'Bill not found' });

        // Kiểm tra trạng thái của hóa đơn
        if (bill.status !== 1) {
            return res.status(400).json({ message: 'Bad request' });
        }

        // Tìm box liên quan
        const box = await BoxTransaction.findById(bill.boxId);
        if (!box) return res.status(404).json({ message: 'Box not found' });

        // Tổng số tiền từ các transaction có status 2, 6, 7, 8
        const result = await Transaction.aggregate([
            { $match: { boxId: box._id, status: { $in: [2, 6, 7, 8] } } },
            { $group: { _id: null, totalAmount: { $sum: "$amount" } } },
        ]);
        const totalAmount = result.length > 0 ? result[0].totalAmount : 0;

        // Kiểm tra số dư trước khi trừ tiền
        if (box.amount < bill.amount) {
            return res.status(400).json({ message: 'Insufficient balance in box' });
        }

        // Cập nhật trạng thái của bill và giảm số dư trong box
        bill.status = 2;
        box.amount -= bill.amount;
        await Promise.all([bill.save(), box.save()]);

        let paidAmount = totalAmount - box.amount;

        // Lấy danh sách transaction có status = 7
        if (bill.billId.status === 1) {
            return res.status(200).json({ 
                status: true,
                message: 'Bill confirmed successfully' 
            });
        }
        
        const transactions = await Transaction.find({ boxId: box._id, status: 7 }).sort({ createdAt: 1 });

        if (box.amount === 0) {
            // Cập nhật toàn bộ transaction có status = 7 -> 2
            await Transaction.updateMany({ boxId: box._id, status: 7 }, { status: 2 });
        } else if (paidAmount > 0) {
            // Dùng bulkWrite để tối ưu cập nhật trạng thái giao dịch
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
                await Transaction.bulkWrite(bulkOps);
            }

            await Transaction.updateMany({ boxId: box._id, status: 7 }, { status: 6 });
        }

        return res.status(200).json({ 
            status: true,
            message: 'Bill confirmed successfully' 
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

const updateBill = async (req, res) => {
    try {
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
        const { id } = req.params;

        const bill = await Bill.findById(id);

        if (!bill || bill.status !== 1) {
            return res.status(400).json({ message: 'Bill not eligible for cancellation' });
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
        const { id } = req.params;

        const bill = await Bill.findById(id).populate([
            { path: 'billId'},
        ]);

        if (!bill || !bill.billId || bill.status !== 1 || bill.billId.status !== 1) {
            return res.status(400).json({ message: 'Bill not eligible for switch' });
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