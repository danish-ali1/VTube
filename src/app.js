import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import userRoutes from "./routes/user.route.js"


const app = express()

app.use(cors())
app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({extended:true}))
app.use(express.static("public"))

app.use("/api/users", userRoutes)

app.get("/test", (req,res)=>{
    res.send("Hello")
})

export default app