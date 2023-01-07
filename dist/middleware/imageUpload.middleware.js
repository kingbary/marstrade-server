"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.imageUpload = void 0;
const multer_1 = __importDefault(require("multer"));
const imageStorage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        // const dest = path.join(__dirname, '..', '..', 'uploads/')
        // console.log(dest)
        cb(null, __dirname);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});
exports.imageUpload = (0, multer_1.default)({ storage: imageStorage });
