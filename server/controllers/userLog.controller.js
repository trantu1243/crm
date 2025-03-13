const { default: mongoose } = require("mongoose");
const { UserLog, Bill } = require("../models");

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
        const logs = await UserLog.find({action: 'CONFIRM_BILL'}).sort({createdAt: -1}).limit(3000);

        let data = [];
        let log2 = [];
        for (const log of logs) {
            const bill =  await Bill.findById(log.targetId);
            if (!bill) {
                data.push(log.targetId);
                log2.push(log);
            }
        }
        res.status(200).json({
            message: 'Logs fetched successfully',
            data,
            log: log2
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