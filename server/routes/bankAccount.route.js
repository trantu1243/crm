const express = require('express');
const { BankAccount } = require('../models');

const router = express.Router();

router.get('/all', async (req, res) => {
    const items = await BankAccount.find();
    res.send(items);
});

module.exports = router;