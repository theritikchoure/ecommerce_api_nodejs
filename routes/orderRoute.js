const { newOrder, getSingleOrder, myOrders, getAllOrders, updateOrder, deleteOrder } = require("../controllers/orderController");
const { isUserAuth, authorizeRole } = require("../middleware/userAuth");
const express = require('express');
const router = express.Router();

router.route('/orders/new').post(isUserAuth, newOrder);

router.route('/orders/:id').get(isUserAuth, getSingleOrder);
router.route('/myorders').get(isUserAuth, myOrders);

router.route('/admin/orders').get(isUserAuth, authorizeRole("admin"), getAllOrders);
router.route('/admin/orders/:id').put(isUserAuth, authorizeRole("admin"), updateOrder).delete(isUserAuth, authorizeRole("admin"), deleteOrder);

module.exports = router;

