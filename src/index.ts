import express from 'express';  
import mongoose from 'mongoose';  
import dotenv from 'dotenv';  

dotenv.config();  

const app = express();  
const PORT = process.env.PORT || 3000;  
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';  

mongoose.connect(MONGODB_URI)  
  .then(() => console.log('Connect to MongoDB has success'))  
  .catch(err => console.error('Do not connect in to MongoDB', err));  

app.get('/', (req, res) => {  
  res.send('Test get!');  
});  

app.listen(PORT, () => {  
  console.log(`Server start on PORT: ${PORT}`);  
});  