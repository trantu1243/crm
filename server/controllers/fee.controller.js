const { FeeTransaction } = require('../models');
  
const getFeeTransactions = async (req, res) => {
    try {
        const feeTransactions = await FeeTransaction.find({}).select('min max feeDefault feeFlexible').sort({ min: 1 });

        res.status(200).json({
            message: 'fees fetched successfully',
            data: feeTransactions,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const createFeeTransaction = async (req, res) => {
    try {
        const { min, max, feeDefault } = req.body;
        if (min === undefined || max === undefined || feeDefault === undefined) {
            return res.status(400).json({ message: 'Fields min, max, and feeDefault are required' });
        }
        const feeTransaction = await FeeTransaction.create(req.body);
        res.status(201).json(feeTransaction);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const updateFeeTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        const { min, max, feeDefault } = req.body;
        if (min === undefined || max === undefined || feeDefault === undefined) {
            return res.status(400).json({ message: 'Fields min, max, and feeDefault are required' });
        }
        const updatedFeeTransaction = await FeeTransaction.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedFeeTransaction) {
            return res.status(404).json({ message: 'FeeTransaction not found' });
        }
        res.json(updatedFeeTransaction);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const deleteFeeTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedFeeTransaction = await FeeTransaction.findByIdAndDelete(id);
        if (!deletedFeeTransaction) {
            return res.status(404).json({ message: 'FeeTransaction not found' });
        }
        res.json({ message: 'Deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = { 
    getFeeTransactions,
    createFeeTransaction,
    updateFeeTransaction,
    deleteFeeTransaction
};
