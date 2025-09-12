import http from 'http';
import app from './app';

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

server.listen(PORT, (err) => {
  if (err) {
    console.error('Error occurred on starting the server');
    console.error(err);
    return;
  }
  console.log(`🚀 Server running successfully on port: ${PORT}`);
});
