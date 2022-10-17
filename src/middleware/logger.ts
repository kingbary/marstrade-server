import fs from "fs"
import fsPromises from "fs/promises"
import path from "path"

import { v4 as uuid } from 'uuid'
import { format } from "date-fns"

export interface IlogEvent {
    (msg: string, filename: string): Promise<void>
}

export const logEvent: IlogEvent = async (message: string, logFileName: string) => {
    const time = format(new Date(), 'yyyy-MM-dd\thh:mm:ss')
    const logItem = `${time}\t${uuid()}\t${message}\n`

    try {
        if (!fs.existsSync(path.join(__dirname, '..', '..', 'logs'))) {
            await fsPromises.mkdir(path.join(__dirname, '..', '..', 'logs'))
        }
        await fsPromises.appendFile(path.join(__dirname, '..', '..', 'logs', logFileName), logItem)
    } catch (error) {
        console.log(error)
    }
}