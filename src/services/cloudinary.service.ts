import { v2 as cloudinary } from "cloudinary"
import { unlinkSync } from "fs"

export interface ICloudinaryResponse {
    isSuccess: boolean,
    message: string,
    statusCode: number,
    imageURL?: string,
}

export interface ICloudinary {
    uploadImage: (imageToUpload: string, filename: string, folder: string) => Promise<ICloudinaryResponse>
}

class Cloudinary implements ICloudinary {
    constructor() {
        cloudinary.config({
            cloud_name: process.env.CLOUDNAME,
            api_key: process.env.CLOUDAPIKEY,
            api_secret: process.env.CLOUDINARYSECRET,
            secure: true
        })
    }

    async uploadImage(imageToUpload: string, filename: string, folder: string) {
        try {
            const uploadResponse = await cloudinary.uploader.upload(
                imageToUpload,
                {
                    public_id: filename,
                    folder: folder
                }
            )

            const { secure_url } = uploadResponse
            unlinkSync(imageToUpload)

            if (!secure_url) {
                return {
                    isSuccess: false,
                    message:
                        "Couldn't upload your image at the moment. Please try again later.",
                    statusCode: 400,
                }
            }

            return {
                isSuccess: true,
                message: "Successfully uploaded image.",
                statusCode: 200,
                imageURL: secure_url,
            }
        } catch (error) {
            unlinkSync(imageToUpload);
            return {
                isSuccess: false,
                message: "Internal Server Error",
                statusCode: 500,
            }
        }
    }
    // createSignature(timestamp) {
    //     const signature = cloudinary.utils.api_sign_request({ timestamp }, cloudinaryConfig.api_secret);
    //     return { api_key: cloudinaryConfig.api_key, cloud_name: cloudinaryConfig.cloud_name, timestamp, signature };
    // }

    // validatedSignature(payload, signature) {
    //     const expectedSignature = cloudinary.utils.api_sign_request(payload, cloudinaryConfig.api_secret);

    //     if (expectedSignature === signature) {
    //         return true;
    //     } else {
    //         return false;
    //     }
    // }
}


export default Cloudinary