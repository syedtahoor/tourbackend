const express = require("express");
const router = express.Router();
const ContactQuery = require("../../models/ContactQuery");
const sendEmail = require("../../utils/sendEmail");
const userContactTemplate = require("../../utils/templates/userContactTemplate");
const adminContactTemplate = require("../../utils/templates/adminContactTemplate");

// GET - Fetch All Contact Queries
router.get("/getContactQueries", async (req, res) => {
    try {
        const contactQueries = await ContactQuery
            .find()
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: "Contact queries fetched successfully",
            total: contactQueries.length,
            contactQueries: contactQueries
        });

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});

// CREATE - Add New Contact Query
router.post("/createContactQuery", async (req, res) => {
    try {
        const { fullName, emailAddress, phoneNumber, subject, message } = req.body;

        if (!fullName || !emailAddress || !phoneNumber || !subject || !message) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const newContactQuery = new ContactQuery({
            fullName,
            emailAddress,
            phoneNumber,
            subject,
            message
        });

        await newContactQuery.save();

        await Promise.all([
            sendEmail({
                to: emailAddress,
                subject: "Thank you for contacting us!",
                html: userContactTemplate({ fullName, subject })
            }),

            sendEmail({
                to: "syedtahooraliprogrammer@gmail.com",
                subject: "New Contact Query Received",
                html: adminContactTemplate({
                    fullName,
                    emailAddress,
                    phoneNumber,
                    subject,
                    message
                })
            })
        ]);

        res.status(201).json({
            message: "Contact query saved & emails sent successfully",
            contactQuery: newContactQuery
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE - Remove Contact Query
router.delete("/deleteContactQuery/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const deletedQuery = await ContactQuery.findByIdAndDelete(id);

        if (!deletedQuery) {
            return res.status(404).json({
                message: "Contact query not found"
            });
        }

        res.status(200).json({
            message: "Contact query deleted successfully",
            deletedQuery
        });

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});

module.exports = router;