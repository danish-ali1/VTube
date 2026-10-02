import User from "../models/user.model.js"
import asyncHandler from "../utils/asyncHandler.js"
import ApiError from "../utils/ApiError.js"
import uploadOnCloudinary from "../utils/cloudinary.js"
import ApiResponse from "../utils/ApiResponse.js"

export const registerUser= asyncHandler(async (req, res) => {
    const{username, email, password, fullName} = req.body
    if([username,email,password,fullName].some((field)=> !field || field.trim()==="")){
        throw new ApiError(400, "All fields are required")
    }
    const existingUser=await User.findOne({$or:[{username},{email}]})
    if(existingUser){
        throw new ApiError(409, "Username or email already exists")
    }
    const avatarLocalPath= req.files?.avatar[0]?.path
    const coverImageLocalPath=req.files?.coverImage[0]?.path
    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar image is required")
    }
    const avatar= await uploadOnCloudinary(avatarLocalPath)
    const coverImage= await uploadOnCloudinary(coverImageLocalPath)
    if(!avatar){
        throw new ApiError(500, "Failed to upload avatar image")
    }
    const newUser= await User.create({
        username: username.toLowerCase(),
        email,
        password,
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || ""
    })
    const createdUser= await User.findById(newUser._id).select("-password -refreshToken")
    if(!createdUser){
        throw new ApiError(500, "Failed to create user")
    }
    return res.status(201).json(
        new ApiResponse(201, "User registered successfully", createdUser,true)
    )
})