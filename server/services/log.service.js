const logQueue = require("../queues/logQueue");

const saveUserLogToQueue = async (userId, action, details, req) => {
    await logQueue.add({
        userId,
        action,
        details,
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"]
    });
};

module.exports = { saveUserLogToQueue };
