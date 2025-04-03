const { Tag } = require("../models");

const getTags = async (req, res) => {
    try {
        const tags = await Tag.find({});

        res.status(200).json({
            message: 'Tags fetched successfully',
            tags,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const filterTags = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
        } = req.query;

        const tags = await Tag.paginate({}, {
            page: Number(page),
            limit: Number(limit),
        });

        res.status(200).json({
            message: 'Tags fetched successfully',
            tags,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const createTag = async (req, res) => {
    try {
        const { color, slug, name } = req.body;
        if (color === undefined || slug === undefined || name === undefined) {
            return res.status(400).json({ message: 'Fields tag, name and color are required' });
        }
        const existTag = await Tag.findOne({ slug });
        if (existTag) {
            return res.status(400).json({ message: 'Tag đã tồn tại' });
        }
        const newTag = await Tag.create(req.body);
        res.status(201).json({ tag: newTag });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Internal server error' });
    }
};

const updateTag = async (req, res) => {
    try {
        const { id } = req.params;
        const { color, slug, name } = req.body;
        if (color === undefined || slug === undefined || name === undefined) {
            return res.status(400).json({ message: 'Fields tag and color are required' });
        }
        const existTag = await Tag.findById(id);
        if (!existTag) {
            return res.status(400).json({ message: 'Tag ko tồn tại' });
        }
        const checkTag = await Tag.findOne({ slug });

        if (checkTag && checkTag._id.toString() !== existTag._id.toString()) {
            return res.status(400).json({ message: 'Tag đã tồn tại' });
        }
        existTag.slug = slug;
        existTag.color = color;
        existTag.name = name;
        await existTag.save();
        res.status(200).json({ tag: existTag });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Internal server error' });
    }
};

const deleteTag = async (req, res) => {
    try {
        const { id } = req.params;
       
        await Tag.findByIdAndDelete(id);
    
        res.status(200).json({ message: 'Xoá tag thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    getTags,
    createTag,
    updateTag,
    deleteTag,
    filterTags
}