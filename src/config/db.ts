import mongoose from 'mongoose'

export interface IDBSetup {
    connectDB: (uri: string, callback: () => void) => Promise<void>
}

class DBSetup implements IDBSetup {
    async connectDB(db_uri: string, cb: () => void) {
        mongoose.connect(
            db_uri,
            // {
            //     useNewUrlParser: true,
            //     useUnifiedTopology: true,
            // },
            (err) => {
                if (err) {
                    console.log(`Error: ${err.message}`)
                    process.exit()
                }
                cb()
            }
        )
    }
}

export default DBSetup