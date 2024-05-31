const socket = io();

socket.on('connect', () => {
    console.log('Connected to server');
});

socket.on('userCount', (count) => {
    console.log(`Total connected users: ${count}`);
    document.getElementById('userCount').innerText = `Total connected users: ${count}`;
});
