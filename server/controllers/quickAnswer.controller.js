const { QuickAnswer } = require("../models");

const getQuickAnswers = async (req, res) => {
    try {
        const quickAnswers = await QuickAnswer.find({});

        res.status(200).json({
            message: 'quickAnswers fetched successfully',
            quickAnswers,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const addQuickAnswer = async (req, res) => {
    try {
        const requiredFields = ['title', 'content'];
        for (const field of requiredFields) {
            if (!req.body[field]) {
                return res.status(400).json({ message: `${field} is required` });
            }
        }

        const { title, content } = req.body;

        const quickAnswer = await QuickAnswer.create({
            title,
            content
        })
        
        res.status(200).json({
            message: 'quickAnswers created successfully',
            quickAnswer,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const editQuickAnswer = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content } = req.body;

        const quickAnswer = await QuickAnswer.findById(id);

        if (title) quickAnswer.title = title;
        if (content) quickAnswer.content = content;

        await quickAnswer.save();
        
        res.status(200).json({
            message: 'quickAnswers edited successfully',
            quickAnswer,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const deleteQuickAnswer = async (req, res) => {
    try {
        const { id } = req.params;

        await QuickAnswer.findByIdAndDelete(id);
        
        res.status(200).json({
            message: 'quickAnswers deleted successfully',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = {
    getQuickAnswers,
    addQuickAnswer,
    editQuickAnswer,
    deleteQuickAnswer
}