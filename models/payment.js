const mongoose = require('mongoose');
const paymentSchema = new mongoose.Schema(
    {
        amount: {
            type: Number,
            required: [true, 'Amount is required'],
            default: 1000,
        },
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        receiverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        madeAt: {
            type: Date,
            default: Date.now,
        }
});

const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment;