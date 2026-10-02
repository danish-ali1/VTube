import "dotenv/config"
import app from "./app.js"
import connectDb from "./db/db.js"

const PORT = process.env.PORT || 8000

try{
  await connectDb()
  app.listen(PORT,()=>{
    console.log(`Server running on port ${PORT}`)
  })
}catch(error){
  console.error(`MongoDB connection error: ${error.message}`)
  process.exit(1)
}
