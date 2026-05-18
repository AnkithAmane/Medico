const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");

router.post("/create", orderController.createOrder);
router.get("/patient/:patientId", orderController.getPatientOrders);

module.exports = router;
