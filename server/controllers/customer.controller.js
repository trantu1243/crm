const { Customer } = require("../models");

const getCustomers = async (req, res) => {
    try {
        const { tags, page = 1, limit = 10, matchAll = true } = req.query;

        const tagArray = typeof tags === 'string' ? tags.split(',') : [];

        const query = tagArray.length > 0
            ? {
                  tags: matchAll === 'false'
                      ? { $in: tagArray }
                      : { $all: tagArray }
              }
            : {};

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
                }
            ],
            sort: { createdAt: -1 }
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
