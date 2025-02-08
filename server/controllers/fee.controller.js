const { FeeTransaction } = require('../models');
  
const getFeeTransactions = async (req, res) => {
    try {
        const feeTransactions = await FeeTransaction.find({}).select('min max feeDefault feeFlexible');

        res.status(200).json({
            message: 'fees fetched successfully',
            data: feeTransactions,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = { 
    getFeeTransactions,
};
