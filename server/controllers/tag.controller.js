const Tag = require("../models/tag.model");

const getTags = async (req, res) => {
    try {
        const feeTransactions = await Tag.find({});

        res.status(200).json({
            message: 'Tags fetched successfully',
            data: feeTransactions,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const createTag = async (req, res) => {
    try {
        const { color, tag } = req.body;
        if (color === undefined || tag === undefined) {
            return res.status(400).json({ message: 'Fields tag and color are required' });
        }
        const existTag = await Tag.findOne({ tag });
        if (existTag) {
            return res.status(400).json({ message: 'Tag đã tồn tại' });
        }
        const newTag = await Tag.create(req.body);
        res.status(201).json({ tag: newTag });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

const updateTag = async (req, res) => {
    try {
        const { color, tag } = req.body;
        if (color === undefined || tag === undefined) {
            return res.status(400).json({ message: 'Fields tag and color are required' });
        }
        const existTag = await Tag.findOne({ tag });
        if (!existTag) {
            return res.status(400).json({ message: 'Tag ko tồn tại' });
        }
        existTag.color = color;
        await existTag.save();
        res.status(200).json({ tag: existTag });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

const deleteTag = async (req, res) => {
    try {
        const { tag } = req.body;
        if (tag === undefined) {
            return res.status(400).json({ message: 'Fields tag and color are required' });
        }
        const existTag = await Tag.findOneAndDelete({ tag });
     
        res.status(200).json({ message: 'Xoá tag thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    getTags,
    createTag,
    updateTag,
    deleteTag
}