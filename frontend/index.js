import { h, mount } from 'destam-dom';

let remove;
window.addEventListener('load', () => {
  // Create the WebSocket connection
  const socket = new WebSocket(`ws://${window.location.hostname}:${window.location.port}`);

  socket.addEventListener('open', () => {
    console.log('WebSocket connection established.');
    // Send an initial message to the server if needed
    socket.send('Hello from the client!');
  });

  socket.addEventListener('message', (event) => {
    console.log(`Message from server: ${event.data}`);
    // You can manipulate your DOM here based on messages from the server
  });

  socket.addEventListener('close', () => {
    console.log('WebSocket connection closed.');
  });

  socket.addEventListener('error', (error) => {
    console.error('WebSocket error:', error.message);
  });

  remove = mount(document.body, 
    <div>
      Hello World
    </div>
  );
});

window.addEventListener('unload', () => {
  if (remove) remove();
  // Close the WebSocket connection when the page unloads
  if (socket) socket.close();
});
