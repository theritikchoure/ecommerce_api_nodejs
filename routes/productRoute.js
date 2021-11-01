const { getAllProducts, createProduct, updateProduct, deleteProduct, getSingleProduct, createProductReview, getSingleProductReview, deleteProductReview } = require("../controllers/productController");
const { isUserAuth, authorizeRole } = require("../middleware/userAuth");
const express = require('express');
const router = express.Router();

router.route('/products').get(getAllProducts);
router.route('/admin/products').post(isUserAuth, authorizeRole("admin"), createProduct);
router.route('/admin/products/:id').put(isUserAuth, authorizeRole("admin"), updateProduct).delete(isUserAuth, authorizeRole("admin"), deleteProduct);
router.route('/products/:id').get(getSingleProduct);

router.route('/review/:id').put(isUserAuth, createProductReview); // FIXME:

router.route('/reviews').get(getSingleProductReview).delete(isUserAuth, deleteProductReview); // TEST LATER

module.exports = router;
