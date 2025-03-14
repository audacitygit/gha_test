import express from "express"
import path from "path"
import { fileURLToPath } from "url";


const app = express()
const PORT = 3001

const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', "index.html"))
})

app.listen(PORT, () => {
    console.log(`🚀 server running on PORT: ${PORT}`)
})