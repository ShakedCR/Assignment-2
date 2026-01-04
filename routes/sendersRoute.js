const express = require('express');
const router = express.Router();
const sendersController = require('../controllers/sendersController');

router.get("/", sendersController.getAllSenders);
    
router.get("/:id", sendersController.getSenderById);

router.post("/", sendersController.createSender);       

module.exports = router;