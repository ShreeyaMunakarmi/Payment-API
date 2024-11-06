const mongoose = require('mongoose');

mongoose.connect("mongodb://localhost:27017/paymentAPI", { 
    useNewUrlParser: true, 
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000, // 30 seconds
})
.then(() => {
    console.log("MongoDB connected successfully.");
})
.catch((error) => {
    console.error("MongoDB connection error:", error);
});

module.exports = mongoose;

