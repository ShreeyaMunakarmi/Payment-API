const express = require ("express");
const router = express.Router();
const { register, login, getUserData, update, sendMoney } = require("../controllers/authController");

router.post('/register', register);
router.post('/login', login);
router.get('/me', getUserData);
router.patch('/update', update);
router.post('/sendMoney', sendMoney);

module.exports = router;