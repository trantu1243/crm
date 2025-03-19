const { Transaction, Setting, BankAccount, BoxTransaction } = require("../models");


const checkTransaction = async (req, res) => {
    try {
        const { code } = req.params;

        const transaction = await Transaction.findOne({ checkCode: code })
            .select("amount content fee totalAmount status boxId bankId")
            .populate([
                { path: 'bankId', select: 'bankName bankCode bankAccount bankAccountName binBank' },
                {
                    path: 'boxId', 
                    select: 'amount messengerId buyer seller isEncrypted',
                    populate: [
                        { path: 'buyer', select: 'facebookId nameCustomer avatar' },
                        { path: 'seller', select: 'facebookId nameCustomer avatar' }
                    ] 
                }
            ]);
            if (transaction) return res.status(200).json({
                status: true,
                transaction
            });

            return res.status(400).json({ status: false, message: 'Not found' });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Internal server error' });
    }
}


const getGDAccount = async (req, res) => {
    try {
        const setting = await Setting.findOne({uniqueId: 1}).populate(
            [
                { path: 'uuidFbs', select: 'nameCustomer facebookId avatar' },
            ]
        );
       
        return res.status(200).json({
                data: setting.uuidFbs
            });

    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
}

const getBanks = async (req, res) => {
    try {
        const banks = await BankAccount.find().select('bankName bankCode bankAccount bankAccountName binBank');
       
        return res.status(200).json({
                data: banks
            });

    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
}

const getTransactions = async (req, res) => {
    try {
        const { id } = req.params;

        const boxTransaction = await BoxTransaction.findOne({ messengerId: id }).populate(
            [
                { path: 'buyer', select: 'nameCustomer facebookId avatar' },
                { path: 'seller', select: 'nameCustomer facebookId avatar' },
            ]
        );;

        if (!boxTransaction) {
            return res.status(404).json({ message: 'BoxTransaction not found' });
        }

        const transactions = await Transaction.find({
            boxId: boxTransaction._id,
            flag: boxTransaction.flag
        }).select("amount content fee totalAmount status boxId bankId");

        res.json({ 
            amount: boxTransaction.amount,
            buyer: boxTransaction.buyer,
            seller: boxTransaction.seller,
            transactions
        });

    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = {
    checkTransaction,
    getGDAccount,
    getBanks,
    getTransactions
}