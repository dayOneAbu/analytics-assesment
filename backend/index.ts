import './src/config/env'
import app from './app'

import { startScheduler } from './src/queue/scheduler'
import { startWorkers } from './src/queue/worker'

const PORT = process.env.PORT || 3000


void startWorkers()
void startScheduler()

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})