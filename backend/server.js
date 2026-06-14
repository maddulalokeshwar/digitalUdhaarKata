import exp from "express";
import cookieParser from 'cookie-parser';
import {connect} from "mongoose"
import {config} from "dotenv";
import {errorHandler} from './middleware/errorHandler.js'
import {authApp} from './API/authAPI.js'
import {customerApp} from './API/customerAPI.js'
import {reminderApp} from './API/reminderAPI.js'
import {transactionApp} from './API/transactionAPI.js'
import {customerAuthApp} from './API/customerAuth.js'
import {customerDashboardApp} from './API/customerDashboardAPI.js'
import {dashboardApp} from './API/shopkeeperDashboard.js'
import {paymentApp} from './API/paymentAPI.js'
import cors from 'cors'
config();


const app =exp()
app.use(
  cors({
    origin: function(origin, callback) {
      if (!origin) return callback(null, true);
      
      if (
        origin.startsWith("http://localhost") ||
        origin.includes("digital-udhaar-kata") && origin.endsWith(".vercel.app")
      ) {
        return callback(null, true);
      }
      
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true
  })
);
// cookie parser middleware
app.use(cookieParser());

// JSON body parser middleware
app.use(exp.json());



//Connecting to the database
const connectDB=async()=>{
    try{
        await connect(process.env.DB_URL)
        console.log("Connected to DB Successfully")
        const port=process.env.PORT||4500
        app.listen(port,()=>{console.log(`Server running in the port ${port}`)})
    }
    catch(err){
        console.log("Error connecting to the DB",err);
        process.exit(1)
    }
}
//Function call
connectDB()

//Test route
app.get('/',(req,res)=>{
    res.send('Backend working')
})

//Path for routes
app.use('/auth-api',authApp)
app.use('/customer-api',customerApp)
app.use('/reminder-api',reminderApp)
app.use('/payment-api',paymentApp)
app.use('/customer-auth',customerAuthApp)
app.use('/transaction-api',transactionApp)
app.use('/customer-dashboard',customerDashboardApp)
app.use('/shop-dashboard',dashboardApp)

//errorHandler middleware
app.use(errorHandler)

export default app;