import User from "../models/user.model.js"
import asyncHandler from "../utils/asyncHandler.js"
import ApiError from "../utils/ApiError.js"
import uploadOnCloudinary from "../utils/cloudinary.js"
import ApiResponse from "../utils/ApiResponse.js"

const generateTokens=async(userId)=>{
    try{
       const user=await User.findById(userId)
       const accessToken= await user.generateAccessToken()
       const refreshToken=await user.generateRefreshToken()
       user.refreshToken=refreshToken
       await user.save({validateBeforeSave:false})
       return {accessToken, refreshToken}
    }catch(error){
        throw new ApiError(500, "Error while generating access and refresh tokens")
    }
}

export const registerUser= asyncHandler(async (req, res) => {
    const{username, email, password, fullName} = req.body
    if([username,email,password,fullName].some((field)=> !field || field.trim()==="")){
        throw new ApiError(400, "All fields are required")
    }
    const existingUser=await User.findOne({$or:[{username},{email}]})
    if(existingUser){
        throw new ApiError(409, "Username or email already exists")
    }
    const avatarLocalPath= req.files?.avatar?.[0]?.path
    const coverImageLocalPath= req.files?.coverImage?.[0]?.path
    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar image is required")
    }
    const avatar= await uploadOnCloudinary(avatarLocalPath)
      if(!avatar){
        throw new ApiError(500, "Failed to upload avatar image")
    }
    let coverImage;
    if(coverImageLocalPath){
      coverImage= await uploadOnCloudinary(coverImageLocalPath)
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

export const loginUser= asyncHandler(async(req,res) =>{
    const{email,username,password}= req.body
    if(!password || (!email && !username)){
        throw new ApiError(400, "Email or username and password are required")
    }
    const user =await User.findOne({$or:[{email},{username}]})
    if(!user){
        throw new ApiError(404, "User not found")
    }
    const isPasswordValid = await user.isPasswordCorrect(password)
    if(!isPasswordValid){
        throw new ApiError(401, "Invalid user credentials")
    }
    const {accessToken, refreshToken}= await generateTokens(user._id)
    const loggedInUser=await User.findById(user._id).select("-password -refreshToken")
    const options={
        httpOnly:true,
        secure:true
    }
    return res.status(200)
    .cookie("refreshToken", refreshToken, options)
    .cookie("accessToken", accessToken, options)
    .json(new ApiResponse(200, "User logged in successfully",{user:loggedInUser, accessToken, refreshToken },true))
})

export const logoutUser= asyncHandler(async(req,res)=>{
   await User.findByIdAndUpdate(req.user._id, {$set:{refreshToken:undefined}}, {new:true})
   const options={
    httpOnly:true,
    secure:true
   }
   return res.status(200)
   .clearCookie("refreshToken", options)
   .clearCookie("accessToken", options)
   .json(new ApiResponse(200, "User logged out successfully", {}, true))
})