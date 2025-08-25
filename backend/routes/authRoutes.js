const express = require("express");
const authController = require("../controllers/authController");
const auth = require("../middleware/auth");
const dataController = require("../controllers/dataController");
const router = express.Router();

router.post("/user-register", authController.user_register);
router.post("/user-login", authController.user_login);
router.get("/getall-users", auth, authController.get_users);
router.get("/getall-headeritems", auth, dataController.get_headerItems);
router.get("/getall-polineitems", auth, dataController.get_polineItems);
router.put("/update-poline-item/:id", auth, dataController.update_poLineItem);
router.get("/get-purchase-orders", auth, dataController.get_purchaseOrders);

module.exports = router;
