import { BoxTransaction, Transaction } from "../models"


const checkAndUpdateConsecutiveSums = async (transactions, bills, box) => {
    // Tính mảng tổng tích lũy cho transactions
    const transSums = [];
    let transTotal = 0;
    for (const trans of transactions) {
        transTotal += trans.amount || 0;
        transSums.push(transTotal);
    }

    // Tính mảng tổng tích lũy cho bills
    const billsSums = [];
    let billsTotal = 0;
    for (const bill of bills) {
        billsTotal += bill.amount || 0;
        billsSums.push(billsTotal);
    }

    // Tìm tổng khớp đầu tiên
    for (let i = 0; i < transSums.length; i++) {
        const transSum = transSums[i];
        const billIndex = billsSums.indexOf(transSum);
        
        if (billIndex !== -1) {
            // Lấy số lượng transactions và bills cần cập nhật
            const transCount = i + 1;
            const billCount = billIndex + 1;

            // Cập nhật transactions
            const transToUpdate = transactions.slice(0, transCount);
            const transIds = transToUpdate.map(t => t._id);
            await Transaction.updateMany(
                { _id: { $in: transIds } },
                { 
                    $set: { 
                        status: 2,
                        flag: box.flag 
                    }
                }
            );

            // Cập nhật bills
            const billsToUpdate = bills.slice(0, billCount);
            const billIds = billsToUpdate.map(b => b._id);
            await Transaction.updateMany(
                { _id: { $in: billIds } },
                { 
                    $set: { 
                        flag: box.flag 
                    }
                }
            );

            // Tăng flag của box
            box.flag += 1;
            
            return {
                found: true,
                updatedTransactions: transCount,
                updatedBills: billCount,
                newFlag: box.flag
            };
        }
    }

    return { found: false };
};

const updateFlags = async () => {
    const boxes = await BoxTransaction.find({});

    for (const box of boxes) {
        box.flag = 1;
        const transactions = await Transaction.find({ boxId: box._id, status: { $nin: [3] } }).sort({createdAt: 1});

        const bills = await Transaction.find({ boxId: box._id, status: { $nin: [3] } }).sort({createdAt: 1});


        if (!transactions.length || !bills.length) {
            console.log(`Box ${box._id}: Không có dữ liệu để so sánh`);
            continue;
        }
    
        // Thực hiện kiểm tra và cập nhật
        const result = await checkAndUpdateConsecutiveSums(transactions, bills, box);
        
        if (result.found) {
            console.log(`Box ${box._id}: Đã cập nhật thành công!`);
            console.log(`Số transactions được cập nhật: ${result.updatedTransactions}`);
            console.log(`Số bills được cập nhật: ${result.updatedBills}`);
            console.log(`Flag mới của box: ${result.newFlag}`);
            
            // Cập nhật box trong database
            await box.save();
        } else {
            console.log(`Box ${box._id}: Không tìm thấy tổng bằng nhau`);
        }

    }

    
}