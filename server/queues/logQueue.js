const Queue = require("bull");
const { UserLog } = require("../models");

const redisHost = process.env.NODE_ENV === "production" ? "redis" : "127.0.0.1";
const redisPort = 6379;

const logQueue = new Queue("userLogs", {
    redis: { host: redisHost, port: redisPort }
});

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
