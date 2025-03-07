const { UserLog } = require("../models");

const getLogs = async (req, res) => {
    try {
         const logs = await UserLog.find({}).sort({createdAt: -1}).limit(300);

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
    getLogs
}