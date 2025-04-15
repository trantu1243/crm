const { BankApi, Transaction, Customer, BoxTransaction, Bill, Stk } = require('../models');
const customerQueue = require('../queues/customer.queue');

async function updateCustomerBankAccounts() {
    try {
        const customers = await Customer.find().sort({ createdAt: -1 });
        let i = 0
        for (const customer of customers) {
            let boxTransactions = await BoxTransaction.find({ buyer: customer._id });

            for (const boxTransaction of boxTransactions) {

                const bills = await Bill.find({ boxId: boxTransaction._id, status: 2 });

                for (const bill of bills) {
                    const typeTransfer = bill.typeTransfer;

                    if (typeTransfer === 'buyer') {
                        const bank = await BankApi.findOne({ bankCode: bill.bankCode });
                        const stk = await findOrCreateStk({stk: bill.stk, bankId: bank._id});
                        console.log('stk', stk._id);
                        console.log('customer', customer.facebookId);
                        await customer.updateOne({$addToSet: {bankAccounts: stk._id}});
                    }
                }
            }

            boxTransactions = await BoxTransaction.find({ seller: customer._id });

            for (const boxTransaction of boxTransactions) {

                const bills = await Bill.find({ boxId: boxTransaction._id, status: 2 });

                for (const bill of bills) {
                    const typeTransfer = bill.typeTransfer;
                
                    if (typeTransfer === 'seller') {
                        const bank = await BankApi.findOne({ bankCode: bill.bankCode });
                        const stk = await findOrCreateStk({stk: bill.stk, bankId: bank._id});
                        await customer.updateOne({$addToSet: {bankAccounts: stk._id}});
                    }
                }
            }
            if (i % 100 === 0) {
                console.log('Processed customers:', i);
            }
            i++;
        }

        console.log('Customer bank accounts updated successfully.');
    } catch (error) {
        console.error('Error updating customer bank accounts:', error);
    }
}

async function findOrCreateStk(stkData) {
    let stk = await Stk.findOne({ ...stkData });

    if (!stk) {
        stk = new Stk(stkData);
        await stk.save();
    }

    return stk;
}

async function updateCustomerToQueue(id) {
    await customerQueue.add({ id });
}

async function updateCustomers() {
    try {
        const customers = await Customer.find().sort({ createdAt: -1 });
        let i = 0;
        for (const customer of customers) {
            let boxTransactions = await BoxTransaction.find({ buyer: customer._id });
            let successTransactions = await Transaction.find({ boxId: { $in: boxTransactions.map(box => box._id) }, status: 2 });
            let cancelTransactions = await Transaction.find({ boxId: { $in: boxTransactions.map(box => box._id) }, status: 3 });

            customer.buyerCount.success = successTransactions.length;
            customer.buyerCount.cancel = cancelTransactions.length;

            boxTransactions = await BoxTransaction.find({ seller: customer._id });
            successTransactions = await Transaction.find({ boxId: { $in: boxTransactions.map(box => box._id) }, status: 2 });
            cancelTransactions = await Transaction.find({ boxId: { $in: boxTransactions.map(box => box._id) }, status: 3 });

            customer.sellerCount.success = successTransactions.length;
            customer.sellerCount.cancel = cancelTransactions.length;

            await customer.save();

            console.log('Processed customers:', i, ' ', customer._id);

            i++;
        }
        return { success: true };
    } catch (error) {
        console.error('Error updating customer:', error);
        return { success: false, message: 'Server error' };
    }
}

module.exports = {
    updateCustomerBankAccounts,
    updateCustomerToQueue,
    updateCustomers,
};