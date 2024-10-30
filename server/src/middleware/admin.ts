import {Request, Response, NextFunction} from 'express'
import jwt from 'jsonwebtoken'


// const secretKeyAdmin = process.env.SECRET_KEY_ADMIN
interface User{
  username: string
}

// interface AuthenticatedRequest extends Request {
//   user?: string | jwt.JwtPayload | undefined | User
// }

export const generateTokenAdmin = (user: User)=>{
  const secretKeyAdmin = 's3cr3t_admin' 
  if(!secretKeyAdmin){
    throw new Error('Secret key not found')
  }
  
  const payload = {username : user.username}
  return jwt.sign(payload, secretKeyAdmin, {expiresIn : '1h'})
}

export const authenticateJWTAdmin = (req: Request, res: Response, next: NextFunction)=>{
  const secretKeyAdmin ='s3cr3t_admin' 
  if(!secretKeyAdmin){
    throw new Error('Secret key not found')
  }
    
  const authHeader = req.headers.authorization
  if(authHeader){
    const token = authHeader.split(' ')[1]
    // const token  = req.cookies.token
    jwt.verify(token , secretKeyAdmin , (err , user)=>{
      if(err){
        return res.sendStatus(403);
      }
      if(!user){
        return res.sendStatus(403);
      }
      if(typeof user === 'string'){
        return res.sendStatus(403);
      }
      
      req.headers['user'] = user.username
      next()
    })
  }else{
    res.sendStatus(401);
  } 
}
