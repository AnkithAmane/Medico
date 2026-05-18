const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");

// Mounts directly onto your front-end endpoints to deliver unified transaction feeds
router.get("/medicines/history", orderController.getMedicineProcurementHistory);
router.get("/tests/history", orderController.getTestProcurementHistory);

module.exports = router;
