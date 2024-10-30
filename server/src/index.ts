import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser'
import adminRouter from './routes/admin'
import userRouter from './routes/user'
import dotenv from 'dotenv'
import path from 'path'

const app = express();
dotenv.config({
  path: path.join(__dirname, '../.env')
})
app.use(express.json());

const buildPath = path.join(__dirname, '../../client/dist')

app.use(express.static(buildPath))

app.use(cors())
app.use(cookieParser())


app.use('/admin', adminRouter)
app.use('/users', userRouter)



// Connect to MongoDB
mongoose.connect('mongodb+srv://prathameshtheurkar037:Prathamesh%401@cluster0.s8asa1j.mongodb.net/'  ,  { dbName: 'course-selling-app' })

app.get('/home', (req, res) => {
 res.json({msg: 'Welcome Home'})      
})

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../client/dist', 'index.html'), (err) => {
    if(err)res.status(500).send(err)
  })
})
app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});

