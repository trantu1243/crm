const { BoxTransaction, Transaction } = require("../models");

const lockInactiveBoxes = async (daysInactive = 30) => {
    try {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysInactive);

        const activeBoxes = await BoxTransaction.find({
            status: 'active',
            isDeleted: false
        }).select('_id');

        const boxIds = activeBoxes.map(box => box._id);

        const latestTransactions = await Transaction.aggregate([
            { $match: { boxId: { $in: boxIds } } },
            { $group: {
                _id: '$boxId',
                latestTransactionDate: { $max: '$createdAt' }
            } },
            { $match: { latestTransactionDate: { $lt: cutoffDate } } }
        ]);

        const boxesToLock = latestTransactions.map(t => t._id);

        if (boxesToLock.length > 0) {
            const updateResult = await BoxTransaction.updateMany(
                { _id: { $in: boxesToLock }, status: 'active' },
                { $set: { status: 'lock' } }
            );

            console.log(`Đã khóa ${updateResult.modifiedCount} box không hoạt động quá ${daysInactive} ngày.`);
        } else {
            console.log(`Không có box nào không hoạt động quá ${daysInactive} ngày cần khóa.`);
        }
    } catch (error) {
        console.error('Lỗi khi khóa các box:', error);
    }
};

module.exports = {
    lockInactiveBoxes
}