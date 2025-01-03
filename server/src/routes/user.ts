import express, { Request, Response } from "express";
import { User, Course } from "../db/db";
import {db} from '../index'
import {
  generateTokenUser,
  authenticateJWTUser,
} from "../middleware/user";
import {z} from 'zod'

const router = express.Router();

interface User{
  username?: string | ''
}

interface AuthenticatedRequest extends Request {
  user?: User 
}

interface CourseType {
  course_id: string,
  title: string,
  description: string,
  price: number,
  imageLink: string,
  published: boolean
}

const newUserSchema = z.object({
  username: z.string().min(2).max(50),
  password: z.string().min(6).max(20),
  firstName: z.string().min(2).max(20),
  lastName: z.string().min(2).max(20)
})

const userSchema = z.object({
  username: z.string().min(2).max(50),
  password: z.string().min(6).max(20),
})

// Zod inference
// type userSchemaType = z.infer<typeof userSchema>

// User routes
router.post("/signup", async (req: Request, res: Response) => {
  // logic to sign up user
  const parsedInput = newUserSchema.safeParse(req.body);
  if(!parsedInput.success){
    return res.status(411).json({
      msg: parsedInput.error
    })
  }
  let {username, password, firstName, lastName} = parsedInput.data

  const findUserQuery = `SELECT * FROM users WHERE username = ? AND password = ?`

  db.query(findUserQuery, [username, password], (err, result) => {
    if(err){
      return res.status(500).json({
        msg: err
      })
    }
    if(result.length > 0) {
      return res.status(403).json({
        msg: "User already signed up"
      })
    }

    const insertNewUserQuery = `INSERT INTO users (username, password, firstName, lastName) VALUES (?, ?, ?, ?)`
    db.query(insertNewUserQuery, [username, password, firstName, lastName], (err, result) => {
      if(err){
        return res.status(500).json({
          msg: err
        })
      }
      
      const token = generateTokenUser(req.body);
      return res.status(200).json({
        success: true,
        message: "User created successfully",
        token
      })       
    })
  })

  // const existingUser = await User.findOne({ username, password });

  // if (existingUser) {
  //   res.json({ success: false, message: "User already signed up" });
  // } else {
  //   const newUser = new User({
  //     firstName,
  //     lastName,
  //     username,
  //     password,
  //     purchasedCourses: [],
  //   });
  //   await newUser.save();
  //   const token = generateTokenUser(req.body);

  //   // res.status(200).cookie("token", token, {expire : 24 * 60 * 60 * 1000}).json({message : "User created successfully" , token})
  //   res
  //     .status(200)
  //     .json({ success: true, message: "User created successfully", token });
  // }
});

router.post("/login", async (req: Request, res: Response) => {
  // logic to log in user
  const parsedInput = userSchema.safeParse(req.body);
  if(!parsedInput.success){
    return res.status(411).json({
      msg: parsedInput.error
    })
  }
  const {username, password} = parsedInput.data
 
  const findUserQuery = `SELECT * FROM users WHERE username = ? AND password = ?`

  db.query(findUserQuery, [username, password], (err, result) => {
    if(err){
      return res.status(500).json({
        msg: err
      })
    }

    if(result.length === 0){
      return res.status(403).json({
        msg: "User not found"
      })
    }

    const token = generateTokenUser(req.body);
    return res.status(200).json({
      success: true,
      message: "Login successfully",
      token
    })
  })
  // const user1 = await User.findOne({ username, password });
  // if (user1) {
  //   const token = generateTokenUser(user1);
  //   // res.cookie("token", token, {expire : 24 * 60 * 60 * 1000}).json({message : "Login Succesfully" , token1 : token})
  //   res
  //     .status(200)
  //     .json({ success: true, message: "Login Succesfully", token });
  // } else {
  //   res.json({ success: false, message: "User not found" });
  // }
});

router.get("/me", authenticateJWTUser, async (req: AuthenticatedRequest, res: Response) => {
  res.json({
    success: true,
    user: req.headers.user,
    auth: true,
  });
});

router.get("/courses", authenticateJWTUser, async (req: Request, res: Response) => {
  // logic to list all courses
  // const courses = await Course.find();
  const getCoursesQuery =  `SELECT * FROM courses`
  db.query(getCoursesQuery, (err, result) => {
    if(err){
      return res.status(500).json({
        msg: err
      })
    }
    return res.status(200).json({
      success: true,
      courses: result
    })
  })
  // res.json({ success: true, courses: courses });
});

router.get("/course/:courseId", authenticateJWTUser, async (req: Request, res: Response) => {
  //logic to get a single course

  const courseId = req.params.courseId;

  const findCourseQuery =  `SELECT * FROM courses WHERE course_id = ?`

  db.query(findCourseQuery, [courseId], (err, result) => {
    if(err) {
      return res.status(500).json({
        msg: err
      })
    }

    if(result.length === 0){
      return res.status(404).json({
        success: false,
        msg: "Course not found"
      })
    } else {  
      return res.status(200).json({
        success: true,
        msg: "Course founded",
        course: result[0]
      })
    }
  })

  // const course = await Course.findById(courseId);
  // if (course) {
  //   res.status(200).json({ success: true, msg: "Course founded", course });
  // } else {
  //   res.status(404).json({ success: false, msg: "Course not found" });
  // }
});

router.post("/courses/:courseId", authenticateJWTUser, async (req: AuthenticatedRequest, res: Response) => {
  // logic to purchase a course
  // const isValid = mongoose.Types.ObjectId.isValid(req.params.courseId);
  // if (!isValid) {
  //   return res
  //     .status(403)
  //     .json({ success: false, message: "Invalid courseId" });
  // }

  
  const courseId = req.params.courseId;
  const findCourseQuery =  `SELECT * FROM courses WHERE course_id = ?`
  db.query(findCourseQuery, [courseId], (err, result) => {
    if(err) {
      return res.status(500).json({
        msg: err
      })
    }

    if(result.length == 0){
      return res.status(404).json({
        success: false,
        msg: "Course not found"
      })
    }

    const userQuery = `SELECT * FROM users WHERE username = ?`

    db.query(userQuery, [req.headers.user], (err, result) => {
      if(err) {
        return res.status(500).json({
          msg: err
        })
      }

      if(result.length == 0) {
        return res.status(404).json({
          success: false,
          msg: "User not found"
        })
      }

      const user = result[0]
      
      const purchaseCourseQuery = `INSERT INTO purchased_courses (user_id, course_id) VALUES (?, ?)`

      
      db.query(`SELECT * FROM purchased_courses WHERE user_id = ? AND course_id = ?`, [user.id, courseId], (err, result) => {
        if(err) {
          return res.status(500).json({
            msg: err
          })
        }

        if(result.length > 0) {
          return res.status(403).json({
            success: false,
            msg: "Course already purchased"
          })
        }

        db.query(purchaseCourseQuery, [user.id, courseId], (err, result) => {
          if(err) {
            return res.status(500).json({
              msg: err
            })
          }
          return res.status(200).json({
            success: true,
            msg: "Course purchased"
          })
      })  
    })
    
    })
  // const course = await Course.findById(req.params.courseId);
  // if (course) {
  //   const user = await User.findOne({ username: req.headers.user });
  //   if (user) {
  //     const isPurchased = user.purchasedCourses.find(
  //       (co) => co._id.toString() == req.params.courseId
  //     );

  //     if (isPurchased) {
  //       res.json({ success: true, message: "Course already purchased" });
  //     } else {
  //       user.purchasedCourses.push(course._id);
  //       await user.save();
  //       res.json({ success: true, message: "Course purchased" });
  //     }
  //   } else {
  //     res.status(403).json({ success: false, message: "User doesn't exist" });
  //   }
  // } else {
  //   res.status(404).json({ success: false, message: "Course doesn't exist" });
  // }
}) 
}); 

router.get("/purchasedCourses", authenticateJWTUser, async (req: AuthenticatedRequest, res: Response) => {
  // logic to view purchased courses
  // const user = await User.findOne({ username: req.headers.user }).populate(
  //   "purchasedCourses"
  // );
  // if (user) {
  //   res.json({ success: true, purchasedCourses: user.purchasedCourses || [] });
  // } else {
  //   res.status(403).json({ success: false, message: "User not found" });
  // }

  const userQuery = `SELECT * FROM users WHERE username = ?`

  db.query(userQuery, [req.headers.user], (err, result) => {
    if(err) {
      return res.status(500).json({
        msg: err
      })
    }

    if(result.length == 0) {
      return res.status(404).json({
        success: false,
        msg: "User not found"
      })
    }

    const user = result[0]
    const purchasedCoursesQuery = `SELECT * FROM purchased_courses WHERE user_id = ?`

    db.query(purchasedCoursesQuery, [user.id], (err, result) => {
      if(err) {
        return res.status(500).json({
          msg: err
        })
      }

      if(result.length == 0) {
        return res.status(404).json({
          success: false,
          msg: "No purchased courses"
        })
      }

      db.query(`SELECT * FROM courses WHERE course_id IN (?)`, [result.map((course: CourseType) => course.course_id)], (err, result) => {
        if(err) {
          return res.status(500).json({
            msg: err
          })
        }

        return res.status(200).json({
          success: true,
          purchasedCourses: result
        })
      })
    })
  })
});

export default router