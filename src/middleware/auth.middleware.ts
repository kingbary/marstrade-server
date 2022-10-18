import { check } from "express-validator"

export const signUpValidator = [
    check("firstName").trim().isLength({ min: 1 }).withMessage("Name must be more than one character long"),
    check("lastName").trim().isLength({ min: 1 }).withMessage("Name must be more than one character long"),
    check("email").isEmail().withMessage("Please input a valid email").normalizeEmail(),
    check("password").isLength({ min: 6 }).withMessage("Password must be more than five characters long"),
    check("retypePassword").custom((val, { req }) => {
        if (req.body.password !== val) {
            throw new Error("Passwords must match")
        }
        return true
    }).withMessage("Passwords must match")
]
