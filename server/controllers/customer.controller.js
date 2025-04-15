const { Customer } = require("../models");

const getCustomers = async (req, res) => {
    try {
        const {
            tags,
            page = 1,
            limit = 10,
            sortField = 'createdAt', 
            search,
            list
        } = req.query;

        let tagArray = [];
        if (tags) tagArray = Array.isArray(tags) ? tags : [tags];

        const query = {};

        if (tagArray.length > 0) {
            query.tags = { $in: tagArray };
        }

        if (list) {
            if (list === 'whitelist') {
                query.whiteList = true;
            }
            
            if (list === 'blacklist') {
                query.blackList = true;
            }
        }
        
        if (search) {
            query.$or = [
                { facebookId: { $regex: search, $options: 'i' } },
                { nameCustomer: { $regex: search, $options: 'i' } }
            ];
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

const toggleWhitelist = async (req, res) => {
    try {
        const { id } = req.params;
        const customer = await Customer.findById(id);
        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }

        customer.whiteList = !customer.whiteList;
        await customer.save();

        res.json({ success: true, data: customer });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const toggleBlacklist = async (req, res) => {
    try {
        const { id } = req.params;
        const customer = await Customer.findById(id);
        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }

        customer.blackList = !customer.blackList;
        await customer.save();

        res.json({ success: true, data: customer });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const updateNote = async (req, res) => {
    try {
        const { id } = req.params;
        const { note } = req.body;

        if (!note) {
            return res.status(400).json({ success: false, message: 'Note is required' });
        }

        const customer = await Customer.findById(id);
        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }

        customer.note = note;
        await customer.save();

        res.json({ success: true, data: customer });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const updateTag = async (req, res) => {
    try {
        const { tags, facebookIds } = req.body;

        if (!tags || !facebookIds) {
            return res.status(400).json({ success: false, message: 'Tags and Facebook IDs are required' });
        }

        const ids = facebookIds.split('\n').map(id => id.trim()).filter(id => id); 
        const idArray = [...new Set(tags.map(item => new mongoose.Types.ObjectId(item.value)))];

        for (const id of ids) {
            await Customer.findOneAndUpdate({ facebookId: id }, { $set: { tags: idArray } });
        }

        return res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

module.exports = {
    getCustomers,
    toggleWhitelist,
    toggleBlacklist,
    updateNote,
    updateTag
};
