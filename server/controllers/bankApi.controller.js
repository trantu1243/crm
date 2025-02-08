const { BankApi } = require('../models');
  
const getBankApis = async (req, res) => {
    try {
        const bankApis = await BankApi.find({}).select('bankName bankCode binBank');

        res.status(200).json({
            message: 'Banks fetched successfully',
            data: bankApis,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = { 
    getBankApis,
};
