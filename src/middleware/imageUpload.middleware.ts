import multer from 'multer'
import path from 'path'

const imageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        // const dest = path.join(__dirname, '..', '..', 'uploads/')
        // console.log(dest)
        cb(null, __dirname)
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})

export const imageUpload = multer({ storage: imageStorage })