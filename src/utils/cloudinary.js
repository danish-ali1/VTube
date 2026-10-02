import {v2 as cloudinary} from "cloudinary"
import fs from "fs"

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary= async(localFilePath) =>{
  try {
    if(!localFilePath) return null
    const response=await cloudinary.uploader.upload(localFilePath,{
        resource_type:"auto",
        folder:"vtube"
    })
    // fs.unlinkSync(localFilePath) // Delete the local file after successful upload
    console.log("File uploaded to Cloudinary:", response)
    return response
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error)
    fs.unlinkSync(localFilePath) // Delete the local file in case of an error
    return null
  }
}

export default uploadOnCloudinary

