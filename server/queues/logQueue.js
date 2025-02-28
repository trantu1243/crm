const Queue = require("bull");
const { UserLog } = require("../models");

// Kết nối đến Redis trong Docker
const logQueue = new Queue("userLogs", {
    redis: { host: "redis", port: 6379 }
});

// Xử lý log từ hàng đợi và lưu vào MongoDB
logQueue.process(async (job) => {
    const { userId, targetId, action, details, ipAddress, userAgent } = job.data;
    try {
        const log = new UserLog({ userId, targetId, action, details, ipAddress, userAgent });
        await log.save();
    } catch (error) {
        console.error("❌ Error saving user log:", error);
    }
});

module.exports = logQueue;
