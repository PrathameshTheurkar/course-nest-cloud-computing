import express, { Request, Response } from "express";
import mongoose from "mongoose";
import { User, Course } from "../db/db";
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

  const existingUser = await User.findOne({ username, password });

  if (existingUser) {
    res.json({ success: false, message: "User already signed up" });
  } else {
    const newUser = new User({
      firstName,
      lastName,
      username,
      password,
      purchasedCourses: [],
    });
    await newUser.save();
    const token = generateTokenUser(req.body);

    // res.status(200).cookie("token", token, {expire : 24 * 60 * 60 * 1000}).json({message : "User created successfully" , token})
    res
      .status(200)
      .json({ success: true, message: "User created successfully", token });
  }
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
  
  const user1 = await User.findOne({ username, password });
  if (user1) {
    const token = generateTokenUser(user1);
    // res.cookie("token", token, {expire : 24 * 60 * 60 * 1000}).json({message : "Login Succesfully" , token1 : token})
    res
      .status(200)
      .json({ success: true, message: "Login Succesfully", token });
  } else {
    res.json({ success: false, message: "User not found" });
  }
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
  const courses = await Course.find();
  res.json({ success: true, courses: courses });
});

router.get("/course/:courseId", authenticateJWTUser, async (req: Request, res: Response) => {
  //logic to get a single course

  const courseId = req.params.courseId;

  const course = await Course.findById(courseId);
  if (course) {
    res.status(200).json({ success: true, msg: "Course founded", course });
  } else {
    res.status(404).json({ success: false, msg: "Course not found" });
  }
});

router.post("/courses/:courseId", authenticateJWTUser, async (req: AuthenticatedRequest, res: Response) => {
  // logic to purchase a course
  const isValid = mongoose.Types.ObjectId.isValid(req.params.courseId);
  if (!isValid) {
    return res
      .status(403)
      .json({ success: false, message: "Invalid courseId" });
  }
  const course = await Course.findById(req.params.courseId);
  if (course) {
    const user = await User.findOne({ username: req.headers.user });
    if (user) {
      const isPurchased = user.purchasedCourses.find(
        (co) => co._id.toString() == req.params.courseId
      );

      if (isPurchased) {
        res.json({ success: true, message: "Course already purchased" });
      } else {
        user.purchasedCourses.push(course._id);
        await user.save();
        res.json({ success: true, message: "Course purchased" });
      }
    } else {
      res.status(403).json({ success: false, message: "User doesn't exist" });
    }
  } else {
    res.status(404).json({ success: false, message: "Course doesn't exist" });
  }
});

router.get("/purchasedCourses", authenticateJWTUser, async (req: AuthenticatedRequest, res: Response) => {
  // logic to view purchased courses
  const user = await User.findOne({ username: req.headers.user }).populate(
    "purchasedCourses"
  );
  if (user) {
    res.json({ success: true, purchasedCourses: user.purchasedCourses || [] });
  } else {
    res.status(403).json({ success: false, message: "User not found" });
  }
});

export default router