const { BoxTransaction, Bill } = require("../models");

const updateUser = async () => {

    const boxes = await BoxTransaction.find({
        $and: [
            {
                $or: [
                    { buyer: { $exists: true } },
                    { buyer: { $ne: null } }
                ]
            },
            {
                $or: [
                    { seller: { $exists: true } },
                    { seller: { $ne: null } }
                ]
            }
        ],
    }).populate(
        [
            { path: 'buyer', select: 'nameCustomer facebookId avatar' },
            { path: 'seller', select: 'nameCustomer facebookId avatar' },
        ]
    );

    const result = []
    
    for (const box of boxes) {
        if (box.buyer.facebookId !== '1') {
            const bills = await Bill.find({ boxId: box._id, typeTransfer: 'buyer', status: 2});
            for (const bill of bills) {
                let boxIds = await Bill.find(
                    { stk: bill.stk, bankCode: bill.bankCode, status: 2, typeTransfer: "buyer" }
                ).distinct("boxId");

                let updatedBoxes = await BoxTransaction.find(
                    { 
                        _id: { $in: boxIds },  
                        $or: [
                            { seller: { $exists: false } },
                            { seller: null }
                        ]
                    }
                ).select('messengerId');
                
                await BoxTransaction.updateMany(
                    { 
                        _id: { $in: boxIds },  $or: [
                            { buyer: { $exists: false } },
                            { buyer: null }
                        ]
                    },
                    {
                        buyer: box.buyer
                    }
                )
                result.push(...updatedBoxes.map(box => box.messengerId));


                boxIds = await Bill.find(
                    { stk: bill.stk, bankCode: bill.bankCode, status: 2, typeTransfer: "seller" }
                ).distinct("boxId");

                updatedBoxes = await BoxTransaction.find(
                    { 
                        _id: { $in: boxIds },  
                        $or: [
                            { seller: { $exists: false } },
                            { seller: null }
                        ]
                    }
                ).select('messengerId');

                await BoxTransaction.updateMany(
                    { 
                        _id: { $in: boxIds },  $or: [
                            { seller: { $exists: false } },
                            { seller: null }
                        ]
                    },
                    {
                        seller: box.buyer
                    }
                )
                result.push(...updatedBoxes.map(box => box.messengerId));

            }
        }


        if (box.seller.facebookId !== '2') {
            const bills = await Bill.find({ boxId: box._id, typeTransfer: 'seller', status: 2});
            for (const bill of bills) {
                let boxIds = await Bill.find(
                    { stk: bill.stk, bankCode: bill.bankCode, status: 2, typeTransfer: "buyer" }
                ).distinct("boxId");

                let updatedBoxes = await BoxTransaction.find(
                    { 
                        _id: { $in: boxIds },  
                        $or: [
                            { seller: { $exists: false } },
                            { seller: null }
                        ]
                    }
                ).select('messengerId');
                
                await BoxTransaction.updateMany(
                    { 
                        _id: { $in: boxIds },  $or: [
                            { buyer: { $exists: false } },
                            { buyer: null }
                        ]
                    },
                    {
                        buyer: box.seller
                    }
                )
                result.push(...updatedBoxes.map(box => box.messengerId));

                boxIds = await Bill.find(
                    { stk: bill.stk, bankCode: bill.bankCode, status: 2, typeTransfer: "seller" }
                ).distinct("boxId");
                
                updatedBoxes = await BoxTransaction.find(
                    { 
                        _id: { $in: boxIds },  
                        $or: [
                            { seller: { $exists: false } },
                            { seller: null }
                        ]
                    }
                ).select('messengerId');

                await BoxTransaction.updateMany(
                    { 
                        _id: { $in: boxIds },  $or: [
                            { seller: { $exists: false } },
                            { seller: null }
                        ]
                    },
                    {
                        seller: box.seller
                    }
                )
                result.push(...updatedBoxes.map(box => box.messengerId));

            }
        }
    }

    console.log(result);
}


module.exports = {
    updateUser
}