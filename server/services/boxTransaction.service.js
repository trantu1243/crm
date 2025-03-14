const { BoxTransaction, Transaction, Bill } = require("../models");

const lockInactiveBoxes = async (daysInactive = 45) => {
    try {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysInactive);

        const allBoxes = await BoxTransaction.find({ status: "active" });

        for (const box of allBoxes) {
            const boxId = box._id;

            let transactions = await Transaction.find({ boxId }).sort({ createdAt: -1 });

            let allStatusThree = transactions.every(transaction => transaction.status === 3);

            if (allStatusThree) {
                if (transactions.length > 0 && transactions[0].createdAt < cutoffDate) await BoxTransaction.updateOne({ _id: boxId }, { status: "lock" });
                continue;
            }

            let transaction = await Transaction.findOne({ boxId, status: 8 }).sort({ createdAt: -1 });

            if (transaction) {
                const latestBill = await Bill.findOne({ boxId }).sort({ createdAt: -1 });
                
                if (latestBill.createdAt < cutoffDate) await BoxTransaction.updateOne({ _id: boxId }, { status: "lock" });
                continue;

            } 

            const latestTransaction = await Transaction.findOne({ boxId }).sort({ createdAt: -1 });
            
            if (latestTransaction.createdAt < cutoffDate) await BoxTransaction.updateOne({ _id: boxId }, { status: "lock" });
            
        }
    } catch (error) {
        console.error('Lỗi khi khóa các box:', error);
    }
};

module.exports = {
    lockInactiveBoxes
}