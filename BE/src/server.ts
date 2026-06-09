import { loadConfig } from './config/env.js'
import { createApp } from './app.js'

const config = loadConfig()
const app = createApp(config)

app.listen(config.port, () => {
  console.log(
    `Chat API listening on http://localhost:${config.port} ` +
      `(CORS origin: ${config.frontendOrigin})`,
  )
})
