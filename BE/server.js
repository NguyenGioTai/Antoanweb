const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const apiRoutes = require('./routes/api');

const app = express();
app.use(cors());
app.use(express.json());

// Kết nối MongoDB
mongoose.connect('mongodb://localhost:27017/ProfessionalHashDemo')
    .then(() => console.log(' MongoDB Connected'))
    .catch(err => console.error(' MongoDB Error:', err));

// Sử dụng Routes
app.use('/api', apiRoutes);

app.listen(3000, () => console.log('🚀 Server running on port 3000'));