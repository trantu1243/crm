const { Customer } = require("../models");

const getCustomers = async (req, res) => {
    try {
        const {
            tags,
            page = 1,
            limit = 10,
            sortField = 'createdAt', 
            facebookId
        } = req.query;

        let tagArray = [];
        if (tags) tagArray = Array.isArray(tags) ? tags : [tags];

        const query = tagArray.length > 0
            ? {
                tags: { $in: tagArray }
            }
            : {};
        
        if (facebookId) {
            query = { facebookId };
        }

        const allowedSortFields = [
            'createdAt',
            'buyerCount.success',
            'buyerCount.cancel',
            'sellerCount.success',
            'sellerCount.cancel'
        ];

        const sortOption = allowedSortFields.includes(sortField)
            ? { [sortField]: -1 } 
            : { createdAt: -1 };

        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            populate: [
                {
                    path: 'bankAccounts',
                    select: 'bankId stk',
                    populate: [
                        {
                            path: 'bankId',
                            select: 'bankName bankCode binBank name',
                        }
                    ]
                },
                {
                    path: 'tags',
                    select: 'slug name color',
                }
            ],
            sort: sortOption
        };

        const result = await Customer.paginate(query, options);

        res.json({
            success: true,
            data: result
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = {
    getCustomers
};
