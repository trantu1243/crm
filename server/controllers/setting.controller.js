const { Setting, FeeTransaction } = require("../models");

  
const getSetting = async (req, res) => {
    try {
        const setting = await Setting.findOne({uniqueId: 1}).select('fee');

        res.status(200).json({
            message: 'setting fetched successfully',
            data: setting,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const toggleFeeSetting = async (req, res) => {
    try {
        const { amount } = req.body;
        if (!amount) {
            return res.status(400).json({ message: 'Amount is required' });
        }

        const setting = await Setting.findOne({uniqueId: 1});

        if (setting.fee.isOn) {
            await FeeTransaction.updateMany({}, { $inc: { feeDefault: -1 * setting.fee.amount } });
        } else {
            await FeeTransaction.updateMany({}, { $inc: { feeDefault: Number(amount) } });
        }
        
        setting.fee.amount = Number(amount);
        setting.fee.isOn = ! setting.fee.isOn;
        await setting.save();

        res.status(200).json({
            message: 'setting updated successfully',
            data: setting,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = { 
    getSetting,
    toggleFeeSetting,
};
