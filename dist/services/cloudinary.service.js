"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const cloudinary_1 = require("cloudinary");
const fs_1 = require("fs");
class Cloudinary {
    constructor() {
        cloudinary_1.v2.config({
            cloud_name: process.env.CLOUDNAME,
            api_key: process.env.CLOUDAPIKEY,
            api_secret: process.env.CLOUDINARYSECRET,
            secure: true
        });
    }
    uploadImage(imageToUpload, filename, folder) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const uploadResponse = yield cloudinary_1.v2.uploader.upload(imageToUpload, {
                    public_id: filename,
                    folder: folder
                });
                const { secure_url } = uploadResponse;
                (0, fs_1.unlinkSync)(imageToUpload);
                if (!secure_url) {
                    return {
                        isSuccess: false,
                        message: "Couldn't upload your image at the moment. Please try again later.",
                        statusCode: 400,
                    };
                }
                return {
                    isSuccess: true,
                    message: "Successfully uploaded image.",
                    statusCode: 200,
                    imageURL: secure_url,
                };
            }
            catch (error) {
                (0, fs_1.unlinkSync)(imageToUpload);
                return {
                    isSuccess: false,
                    message: "Internal Server Error",
                    statusCode: 500,
                };
            }
        });
    }
}
exports.default = Cloudinary;
