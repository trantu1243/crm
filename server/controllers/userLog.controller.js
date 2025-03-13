const { default: mongoose } = require("mongoose");
const { UserLog } = require("../models");

const getLogs = async (req, res) => {
    try {
         const logs = await UserLog.find({}).sort({createdAt: -1}).limit(3000);

        res.status(200).json({
            message: 'Logs fetched successfully',
            data: logs,
        });
    } catch {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const getBillLogs = async (req, res) => {
    try {
        const targetId = new mongoose.Types.ObjectId('67cab4e51e53f873cca99e69');
        const logs = await UserLog.find({targetId: targetId}).sort({createdAt: -1}).limit(3000);

        res.status(200).json({
            message: 'Logs fetched successfully',
            data: logs,
        });
    } catch {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = {
    getLogs,
    getBillLogs
}