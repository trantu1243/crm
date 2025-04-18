const { Transaction, Setting, BankAccount, BoxTransaction } = require("../models");
const { generateQr } = require("../services/genQr.service");
const axios = require('axios');
const qs = require('qs');

function formatDate(isoString) {
    let date = new Date(isoString);
    date.setHours(date.getHours() + 7);

    let day = String(date.getDate()).padStart(2, '0');
    let month = String(date.getMonth() + 1).padStart(2, '0');
    let year = date.getFullYear();

    let hours = String(date.getHours()).padStart(2, '0');
    let minutes = String(date.getMinutes()).padStart(2, '0');
    let seconds = String(date.getSeconds()).padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}


const checkTransaction = async (req, res) => {
    try {
        const { code } = req.params;
        
        const transaction = await Transaction.findOne({ checkCode: code })
            .select("amount content fee totalAmount status boxId bankId checkCode createdAt created_at")
            .populate([
                { path: 'bankId', select: 'bankName bankCode bankAccount bankAccountName binBank name' },
                {
                    path: 'boxId', 
                    select: 'amount messengerId buyer seller isEncrypted senders',
                    populate: [
                        { 
                            path: 'buyer', 
                            select: 'facebookId nameCustomer avatar bankAccounts tags',
                            populate: [{ path: 'tags', select: 'slug name color' }]
                        },
                        { 
                            path: 'seller', 
                            select: 'facebookId nameCustomer avatar bankAccounts tags',
                            populate: [{ path: 'tags', select: 'slug name color' }]
                        },
                        { path: 'tags', select: 'slug name color' }
                    ] 
                }
            ]).lean();
        
        if (!transaction) return res.status(400).json({ status: false, message: 'Not found' });
        
        const setting = await Setting.findOne({uniqueId: 1}).populate(
            [
                { path: 'uuidFbs', select: 'nameCustomer facebookId avatar username' },
            ]
        );

        const gdtgAccounts = setting.uuidFbs.filter(item => transaction.boxId.senders.includes(item.facebookId));

        transaction.createdAt = formatDate(transaction.createdAt);
        if (!transaction.checkCode) transaction.checkCode = null;

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
                { path: 'uuidFbs', select: 'nameCustomer facebookId avatar username' },
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
                { 
                    path: 'buyer', 
                    select: 'facebookId nameCustomer avatar bankAccounts tags',
                    populate: [{ path: 'tags', select: 'slug name color' }]
                },
                { 
                    path: 'seller', 
                    select: 'facebookId nameCustomer avatar bankAccounts tags',
                    populate: [{ path: 'tags', select: 'slug name color' }]
                },
                { path: 'tags', select: 'slug name color' }
            ]
        );

        const setting = await Setting.findOne({uniqueId: 1}).populate(
            [
                { path: 'uuidFbs', select: 'nameCustomer facebookId avatar username' },
            ]
        );

        if (!boxTransaction) {
            return res.status(404).json({ status: false, message: 'BoxTransaction not found' });
        }

        const gdtgAccounts = setting.uuidFbs.filter(item => boxTransaction.senders.includes(item.facebookId));

        const transactions = await Transaction.find({
            boxId: boxTransaction._id,
            status: { $nin: [3] }
        }).sort({ createdAt: -1 }).select("amount content fee totalAmount status boxId bankId checkCode createdAt created_at").populate([
            { path: 'bankId', select: 'bankName bankCode bankAccount bankAccountName binBank name' }
        ]).lean(); ;

        const transaction = await Transaction.findOne({ boxId: boxTransaction._id }).sort({ createdAt: -1 })
            .select("amount content fee totalAmount status boxId bankId checkCode createdAt created_at")
            .populate([
                { path: 'bankId', select: 'bankName bankCode bankAccount bankAccountName binBank name' },
                {
                    path: 'boxId', 
                    select: 'amount messengerId buyer seller isEncrypted senders',
                    populate: [
                        { 
                            path: 'buyer', 
                            select: 'facebookId nameCustomer avatar bankAccounts tags',
                            populate: [{ path: 'tags', select: 'slug name color' }]
                        },
                        { 
                            path: 'seller', 
                            select: 'facebookId nameCustomer avatar bankAccounts tags',
                            populate: [{ path: 'tags', select: 'slug name color' }]
                        },
                        { path: 'tags', select: 'slug name color' }
                    ] 
                }
            ]).lean();
        transaction.createdAt = formatDate(transaction.createdAt)
        if (!transaction.checkCode) transaction.checkCode = null;

        transactions.map((item)=>{
            item.createdAt = formatDate(item.createdAt);
            if (!item.checkCode) item.checkCode = null;
            return item
        })
        res.json({ 
            status: true,
            transaction,
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

const checkUIDFacebook = async (req, res) => {
    try {
        const { link } = req.body;
        
        if (!link) {
            return res.status(400).json({ message: 'Vui lòng nhập link' });
        }
        let data = qs.stringify({
            'link': link
        });
          
        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://api.tathanhan.com/getUID_V2.php',
            headers: { 
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data : data
        };
          
        const response = await axios.request(config);
               
        return res.status(200).json({
            data: response.data
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
    genQr,
    checkUIDFacebook
}