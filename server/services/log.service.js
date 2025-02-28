const logQueue = require("../queues/logQueue");

const saveUserLogToQueue = async (userId, targetId, action, details, req) => {
    await logQueue.add({
        userId,
        targetId,
        action,
        details,
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"]
    });
};

module.exports = { saveUserLogToQueue };
