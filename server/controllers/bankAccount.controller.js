const bcrypt = require('bcrypt');
const { BankAccount } = require('../models');
  
const getBankAccounts = async (req, res) => {
    try {
        const bankAccounts = await BankAccount.find({ isDeleted: false }).select('bankName bankCode bankAccount bankAccountName binBank');

        res.status(200).json({
            message: 'Bank Accounts fetched successfully',
            data: bankAccounts,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = { 
    getBankAccounts,
};
