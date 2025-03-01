import { BoxTransaction, Transaction } from "../models"

const updateFlags = async () => {
    const boxes = await BoxTransaction.find({});

    for (const box of boxes) {
        box.flag = 1;
        const transactions = await Transaction.find({ boxId: box._id, status: { $nin: [3] } });

        const bills = await Transaction.find({ boxId: box._id, status: { $nin: [3] } });
    }
}