import {Router} from "express"
import {registerUser} from "../controllers/user.controller.js"
import upload from "../utils/multer.js"

const router = Router()

router.post("/register", upload.fields([
    {name: "avatar", maxCount: 1},
    {name: "coverImage", maxCount: 1}
]), registerUser)

export default router
