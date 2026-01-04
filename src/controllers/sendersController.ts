const sendersModel = require('../models/sendersModel');

const createSender = async (req, res) => {
    const senderData = req.body;
    try {
        const newSender = new sendersModel(senderData);
        await newSender.save();
        res.status(201).json(newSender);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error creating sender");
    }
};

const getSenderById = async (req, res) => {
    const id = req.params.id;
    try {
        const sender = await sendersModel.findById(id);
        res.json(sender);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error retrieving sender by ID");
    }
};

const getAllSenders = async (req, res) => {
    try {
        const senders = await sendersModel.find();
        res.json(senders);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error retrieving senders");
    }
};


module.exports = {
    createSender,
    getSenderById,
    getAllSenders,  
};