const { Transaction, Setting, BankAccount, BoxTransaction } = require("../models");
const { generateQr } = require("../services/genQr.service");


const checkTransaction = async (req, res) => {
    try {
        const { code } = req.params;
        
        const transaction = await Transaction.findOne({ checkCode: code })
            .select("amount content fee totalAmount status boxId bankId")
            .populate([
                { path: 'bankId', select: 'bankName bankCode bankAccount bankAccountName binBank name' },
                {
                    path: 'boxId', 
                    select: 'amount messengerId buyer seller isEncrypted senders',
                    populate: [
                        { path: 'buyer', select: 'facebookId nameCustomer avatar' },
                        { path: 'seller', select: 'facebookId nameCustomer avatar' }
                    ] 
                }
            ]);
        
        if (!transaction) return res.status(400).json({ status: false, message: 'Not found' });
        
        const setting = await Setting.findOne({uniqueId: 1}).populate(
            [
                { path: 'uuidFbs', select: 'nameCustomer facebookId avatar' },
            ]
        );

        const gdtgAccounts = setting.uuidFbs.filter(item => transaction.boxId.senders.includes(item.facebookId));

        return res.status(200).json({
            status: true,
            transaction,
            gdtgAccounts,
            numOfAccount: transaction.boxId.senders.length,
        });

        
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
        const banks = await BankAccount.find().select('bankName bankCode bankAccount bankAccountName binBank name');
       
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
        );

        const setting = await Setting.findOne({uniqueId: 1}).populate(
            [
                { path: 'uuidFbs', select: 'nameCustomer facebookId avatar' },
            ]
        );

        if (!boxTransaction) {
            return res.status(404).json({ status: false, message: 'BoxTransaction not found' });
        }

        const gdtgAccounts = setting.uuidFbs.filter(item => boxTransaction.senders.includes(item.facebookId));

        const transactions = await Transaction.find({
            boxId: boxTransaction._id,
        }).select("amount content fee totalAmount status boxId bankId").populate([
            { path: 'bankId', select: 'bankName bankCode bankAccount bankAccountName binBank name' }
        ]);

        res.json({ 
            status: true,
            amount: boxTransaction.amount,
            buyer: boxTransaction.buyer,
            seller: boxTransaction.seller,
            gdtgAccounts,
            numOfAccount: boxTransaction.senders.length,
            transactions
        });

    } catch (error) {
        console.log(error)
        res.status(500).json({ status: false, message: 'Internal server error' });
    }
}

const genQr = async (req, res) => {
    try {
        const { bankCode, amount, content, checkCode, mode = 'lite' } = req.body;

        const bank = await BankAccount.findOne({bankCode});

        let data = {
            binBank: bank.binBank,
            logo: bank.logo,
            bankAccount: bank.bankAccount,
            bankAccountName: bank.bankAccountName,
            mode: mode ? mode : 'lite'
        }

        if (amount) data.amount = Number(amount);
        if (content) data.content = content;
        if (checkCode) data.content = content;

        const base64 = await generateQr(data);
       
        return res.status(200).json({
            base64
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
    getTransactions,
    genQr
}