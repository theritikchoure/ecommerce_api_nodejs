const { registerUser, loginUser, loggedOutUser, forgetPassword, resetPassword, getUserDetails, updateUserPassword, updateUserProfile, getAllRegisteredUsers, getSingleRegisteredUser, updateUserRole, deleteUser } = require('../controllers/userController');
const { isUserAuth, authorizeRole } = require('../middleware/userAuth');
const express = require('express');
const router = express.Router();

router.route('/users/register').post(registerUser);
router.route('/users/login').post(loginUser);
router.route('/users/password/forget').post(forgetPassword);
router.route('/users/password/reset/:token').put(resetPassword);
router.route('/users/logout').post(loggedOutUser);

router.route('/users/me').get(isUserAuth, getUserDetails);
router.route('/users/profile/update').put(isUserAuth, updateUserProfile);
router.route('/users/password/update').put(isUserAuth, updateUserPassword);

router.route('/admin/users').get(isUserAuth, authorizeRole("admin"), getAllRegisteredUsers);
router.route('/admin/users/:id').get(isUserAuth, authorizeRole("admin"), getSingleRegisteredUser)
                                .put(isUserAuth, authorizeRole("admin"), updateUserRole)
                                .delete(isUserAuth, authorizeRole("admin"), deleteUser);

module.exports = router;