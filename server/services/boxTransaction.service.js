const { BoxTransaction, Transaction } = require("../models");

const lockInactiveBoxes = async (daysInactive = 45) => {
    try {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysInactive);

        const inactiveBoxIds = await Transaction.aggregate([
            { $match: { status: { $in: [6, 8] } } },
            { $sort: { createdAt: -1 } },
            { $group: { _id: "$boxId", lastTransaction: { $first: "$createdAt" } } },
            { $match: { lastTransaction: { $lt: cutoffDate } } },
            { $project: { _id: 1 } }
        ]);

        await BoxTransaction.updateMany(
            { _id: { $in: inactiveBoxIds.map(t => t._id) }, status: 'active', isDeleted: false },
            { status: 'lock' }
        );
    } catch (error) {
        console.error('Lỗi khi khóa các box:', error);
    }
};

module.exports = {
    lockInactiveBoxes
}