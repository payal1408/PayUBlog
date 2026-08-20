const express = require('express');
const router = express.Router();
const {
  getAuthorProfile,
  updateProfile,
  changePassword,
} = require('../controllers/userController');
const { protect, optionalProtect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/author/:username', optionalProtect, getAuthorProfile);
router.put('/profile', protect, upload.single('profileImage'), updateProfile);
router.put('/change-password', protect, changePassword);

module.exports = router;
