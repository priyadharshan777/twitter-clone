import express from "express"
import dotenv from "dotenv"
import authRoute from "./routes/auth.route.js"
import connectDB from "./db/connectDB.js";
import cookieParser from "cookie-parser";
import userRoute from "./routes/user.route.js"
import cloudinary from "cloudinary"
import postRoute from "./routes/post.route.js"
import notificationRoute from "./routes/notification.route.js"
import cors from "cors"
import path from "path"

dotenv.config();
cloudinary.config({
    cloud_name : process.env.CLOUDINARY_CLOUD_NAME,
    api_key : process.env.CLOUDINARY_API_KEY,
    api_secret : process.env.CLOUDINARY_API_SECRET
})

const __dirname = path.resolve()

const PORT=process.env.PORT

const app = express()

// ✅ Allow both dev and production
app.use(cors({
    origin: process.env.NODE_ENV === "production" 
        ? "https://twitter-clone-2zm0.onrender.com"  // ← your Render URL
        : "http://localhost:3000",
    credentials: true
}))
app.use(express.json({
    limit : "5mb"
})); //parses JSON bodies (for Postman/Frontend) 
app.use(express.urlencoded({ extended: true }));  // Parses form data
app.use(cookieParser())

app.use("/api/auth", authRoute)
app.use("/api/users", userRoute)
app.use("/api/posts", postRoute)
app.use("/api/notifications",notificationRoute)

if(process.env.NODE_ENV === "production")
{
    app.use(express.static(path.join(__dirname,"/frontend", "/build")))
    app.use("/{*splat}",(req,res)=>{
        res.sendFile(path.join(__dirname,"frontend","build","index.html"))
    })
}
app.listen(PORT,()=>{
    console.log(`server is running on port ${PORT}`)
    connectDB()
})