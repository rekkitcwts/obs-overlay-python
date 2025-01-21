//pngtube.js 1.0
// Thank you to jameshfisher for the info on getting microphone volume
// https://jameshfisher.com/2021/01/18/measuring-audio-volume-in-javascript/

var volume;
// var minVolumeThreshold = 0.03; //Redundant...
var softVolumeThreshold = 0.03;
var mediumVolumeThreshold = 0.10;
var blinkTimeOut = 4000;
var blinkTimeOutFuzziness = 4000;
var blinkStateDuration = 1000;
var canBlink = false;
var isBlinking = false;
var initialized = false;
var device_id;

window.onload = async () => {
    
 //   const socket = io('/display'); // Connect to the display namespace
    const socket = io('wss://obs-overlay-python.onrender.com/display', { transports: ['websocket'] }); // Connect to the display namespace

    socket.on('connect', () => {
        console.log('Connected to /display namespace');
    });

    socket.on('volume_update', (data) => {
        console.log('Volume update received:', data.volume);
    });

    socket.on('connect_error', (err) => {
        console.error('Connection error:', err.message);
    });

    socket.on('disconnect', () => {
        console.warn('Disconnected from /display namespace');
    });
};
