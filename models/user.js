const mongoose = require('mongoose');
const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required : [true, 'Username is required'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            trim: true,
            lowercase: true,
            match: [/\S+@\S+\.\S+/, 'Please enter a valid email address'],
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minLength:6,
        },
        phone: {
            type: String,
            required: [true, 'Phone number is required'],
        },
        balance: {
            type: Number,
            required: [true, 'Balance is required'],
            default: 0,
         },
         payments:[
            {
                paymentId: {type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
                recipientName: {type: String},
            }
         ],
         receipts: [
            {
                paymentId : {type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
                senderName: {type: String},
            }
         ]
        },
        { timestamps: true }
);

const User = mongoose.model('User', userSchema);
 
module.exports = User; 
