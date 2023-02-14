import express from "express"
import cors from "cors"

const server = express()

// ************************************* MIDDLEWARES *******************************
server.use(cors())
server.use(express.json())

// *************************************** ENDPOINTS *******************************

// ************************************ ERROR HANDLERS *****************************

export default server
