import jwt from 'jsonwebtoken';
const { verify} = jwt;
import { config } from 'dotenv';
config();

export const verifyToken = (...allowedRoles) => {
  return (req, res, next) => {
      // 1. Get token from cookie
      const token = req.cookies?.token;

      // 2. Check token exists
      if (!token) {
        return res.status(401).json({ message: "Please login first!" });
      }

      // 3. Validate token
      const decodedToken = verify(token, process.env.SECRET_KEY);

      // 4. Check whether the roles are matching or not
      if (allowedRoles.length > 0 && !allowedRoles.includes(decodedToken.role)) {
        return res.status(403).json({ message: "Sorry, you are not authorized" });
      }

      // 5. Add decoded token data to request object
      req.user = decodedToken;
      
      // Pass control to the next middleware/controller
      return next(); 
      
  };
};

export const verifyCustomerToken = () => (req, res, next) => {
  const token = req.cookies?.customerToken
  if (!token) return res.status(401).json({ message: 'Please login' })
 
  const decoded = verify(token, process.env.SECRET_KEY)
  if (decoded.role !== 'customer') return res.status(403).json({ message: 'Customer access only' })
  req.user = decoded
  next()
}