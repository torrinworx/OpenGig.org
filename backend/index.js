import path from 'path';
import http from 'http';
import express from 'express';
import { config } from 'dotenv';
import { WebSocketServer } from 'ws'; // Corrected import statement
import webpack from 'webpack';

import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';

import { Jobs } from './jobs.js';
import webpackConfig from '../webpack.config.js';

// Load environment variables
config();
const app = express();
app.use(express.json());

const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../build')));
  app.get('*', (_req, res) => {
    res.sendFile(path.resolve(__dirname, '../build', 'index.html'));
  });
} else {
  const compiler = webpack(webpackConfig);

  app.use(
    webpackDevMiddleware(compiler, {
      publicPath: webpackConfig.output.publicPath,
    })
  );

  app.use(webpackHotMiddleware(compiler));

  app.get('*', (req, res, next) => {
    const filename = path.join(compiler.outputPath, 'index.html');
    compiler.outputFileSystem.readFile(filename, (err, result) => {
      if (err) {
        return next(err);
      }
      res.set('content-type', 'text/html');
      res.send(result);
      res.end();
    });
  });
}

const port = process.env.PORT || process.env.BACKEND_PORT || 5000;
// Create an HTTP server and wrap the Express app
const server = http.createServer(app);

// Initialize WebSocket server instance
const wss = new WebSocketServer({ server }); // Use WebSocketServer instead of WebSocket.Server

wss.on('connection', (ws) => {
  console.log('New client connected');
  // Send a welcome message to the client
  ws.send('Welcome to the WebSocket server!');

  // Handle incoming messages from clients
  ws.on('message', (message) => {
    console.log(`Received message: ${message}`);
    // Echo the message back to the client
    ws.send(`You said: ${message}`);
  });

  // Handle client disconnection
  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// Start the server
server.listen(port, () => {
  console.log(`Serving on port ${port}`);
});

(async () => {
  const jobs = new Jobs('./backend/jobs');

  // const jobRequest = new JobRequest('example', { args: 'example' });
  // try {
  //     const result = await jobs.router(jobRequest);
  //     console.log('Job result:', result);
  // } catch (error) {
  //     console.error('Job execution error:', error);
  // }
})();
