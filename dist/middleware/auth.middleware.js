"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginValidator = exports.signupValidator = void 0;
const express_validator_1 = require("express-validator");
exports.signupValidator = [
    (0, express_validator_1.check)("firstName").trim().isLength({ min: 1 }).withMessage("Name must be more than one character long"),
    (0, express_validator_1.check)("lastName").trim().isLength({ min: 1 }).withMessage("Name must be more than one character long"),
    (0, express_validator_1.check)("email").isEmail().withMessage("Please input a valid email").normalizeEmail(),
    (0, express_validator_1.check)("password").isLength({ min: 6 }).withMessage("Password must be more than five characters long"),
    (0, express_validator_1.check)("rePassword").custom((val, { req }) => {
        if (req.body.password !== val) {
            throw new Error("Passwords must match");
        }
        return true;
    }).withMessage("Passwords must match")
];
exports.loginValidator = [
    (0, express_validator_1.check)("email").isEmail().withMessage("Please input a valid email").normalizeEmail(),
    (0, express_validator_1.check)("password").isString().withMessage('Must be text').isLength({ min: 6 }).withMessage("Password must be more than five characters long")
];
