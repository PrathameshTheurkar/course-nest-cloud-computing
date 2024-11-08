import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser'
import adminRouter from './routes/admin'
import userRouter from './routes/user'
import dotenv from 'dotenv'
import path from 'path'
import mysql from 'mysql'


const app = express();
dotenv.config({
  path: path.join(__dirname, '../.env')
})
app.use(express.json());

// const buildPath = path.join(__dirname, '../../admin/dist')

// app.use(express.static(buildPath))

app.use(cors())
app.use(cookieParser())

app.use('/admin', adminRouter)
app.use('/users', userRouter)



// Connect to MongoDB
// mongoose.connect('mongodb+srv://prathameshtheurkar037:Prathamesh%401@cluster0.s8asa1j.mongodb.net/'  ,  { dbName: 'course-selling-app' })
export const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Prathamesh@1',
  database: 'course_nest'
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL: ' + err.stack);
    return;
  }
  // console.log('Connected to MySQL as ID ' + db.threadId);
  createTables()
});

const createTables = () => {
  const createUsersTableQuery = `CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  firstName VARCHAR(255),
  lastName VARCHAR(255),
  username VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL
);
`

db.query(createUsersTableQuery, (error, results) => {
  if (error) {
    console.error('Error creating users table:', error);
    return;
  }
  // console.log('Created users table:', results);
});

const createAdminsTableQuery = `CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  firstName VARCHAR(255),
  lastName VARCHAR(255),
  username VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL
);
`

db.query(createAdminsTableQuery, (error, results) => {
  if (error) {
    console.error('Error creating admins table:', error);
    return;
  }
  // console.log('Created admins table:', results);
});


const createCoursesTableQuery = `CREATE TABLE IF NOT EXISTS courses (
  course_id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255),
  description TEXT,
  price DECIMAL(10, 2),
  imageLink VARCHAR(255),
  published BOOLEAN,
  imageName VARCHAR(255)
);`

db.query(createCoursesTableQuery, (error, results) => {
  if (error) {
    console.error('Error creating courses table:', error);
    return;
  }
  // console.log('Created courses table:', results);
});

const createPurchasedCoursesTableQuery = `CREATE TABLE IF NOT EXISTS purchased_courses (
  user_id INT,
  course_id INT,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (course_id) REFERENCES courses(course_id),
  PRIMARY KEY (user_id, course_id)
);`

db.query(createPurchasedCoursesTableQuery, (error, results) => {
  if (error) {
    console.error('Error creating purchased_courses table:', error);
    return;
  }
  // console.log('Created purchased_courses table:', results);
});

}

app.get('/home', (req, res) => {
 res.json({msg: 'Welcome Home'})      
})

// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, '../../admin/dist', 'index.html'), (err) => {
//     if(err)res.status(500).send(err)
//   })
// })
app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});

