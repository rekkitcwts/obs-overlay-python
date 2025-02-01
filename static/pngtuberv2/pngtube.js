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
let lastSentTime = 0;
const throttleInterval = 100; // Send data every 100ms

window.onload = async () => {
    initialized = true;

    // Specify the devices to prioritize and avoid
const dedicated_microphone = "Headset (联想thinkplus-TH20 Hands-Free AG Audio) (Bluetooth)";
const avoid_device = "Digital Audio Interface (USB Digital Audio) (534d:2109)";

let device_id = null;
//const socket = io('/microphone'); // Connect to the microphone namespace
const socket = io('wss://obs-overlay-python.onrender.com/microphone', { transports: ['websocket'] });

    socket.on('connect', () => {
        console.log('Connected to microphone namespace');
    });
    
    // Add automatic reconnection
    socket.on('disconnect', () => {
        console.log('WebSocket disconnected. Reconnecting...');
        socket.connect();
    });

// Enumerate devices and filter based on the criteria
navigator.mediaDevices.enumerateDevices()
    .then(devices => {
        devices.forEach(device => {
            if (device.kind === 'audioinput') {
                console.log(`${device.label}: ${device.deviceId}`);

                // Skip the device if it matches the one to avoid
                if (device.label === avoid_device) {
                    console.log(`Skipping: ${device.label}`);
                    return;
                }

                // Match the dedicated microphone or fallback to the first available
                if (device.label === dedicated_microphone) {
                    console.log(`Using dedicated microphone: ${device.label}`);
                    device_id = device.deviceId;
                } else if (!device_id) {
                    // Set the first valid device as a fallback
                    console.log(`Fallback device: ${device.label}`);
                    device_id = device.deviceId;
                }
            }
        });

        // Request user media with the chosen device
        return navigator.mediaDevices.getUserMedia({
            audio: { deviceId: device_id ? { exact: device_id } : undefined },
            video: false
        });
    })
    .then(stream => {
        console.log("Audio stream successfully started.");
        // Attach the stream to your application logic here
        const audioContext = new AudioContext();
        const mediaStreamAudioSourceNode = audioContext.createMediaStreamSource(stream);
        const analyserNode = audioContext.createAnalyser();
        
        mediaStreamAudioSourceNode.connect(analyserNode);

        const pcmData = new Float32Array(analyserNode.fftSize);

        //startBlinkTimer();
        const volumeDebugInfo = document.getElementById('devicesList');
        const onFrame = () => {
            if(initialized){
                analyserNode.getFloatTimeDomainData(pcmData);
                let sumSquares = 0.0;
                for (const amplitude of pcmData) { sumSquares += amplitude*amplitude; }
                volume = Math.sqrt(sumSquares / pcmData.length);

                // (AJAX the volume here)
                updateVolumeBar(volume)

                const currentTime = Date.now();
                if (socket.connected && currentTime - lastSentTime > throttleInterval) {
                    socket.emit('volume_update', { volume }); // Send volume data
                    lastSentTime = currentTime;
                }
            }
            window.requestAnimationFrame(onFrame);
        };
        window.requestAnimationFrame(onFrame);
    })
    .catch(error => {
        console.error("Error accessing audio devices:", error);
    });
    
};

//This method has a timer that runs a random amount of time and checks if the avatar can blink.
//This is better in this situation than running the timer after every blink.
function startBlinkTimer() {
    var duration = blinkTimeOut + ( Math.random() * blinkTimeOutFuzziness );
    setTimeout( ()=> {
        canBlink = true;
        startBlinkTimer();
    }, duration)
}

// Update volume bar in pngtube.js
function updateVolumeBar(volume) {
    const volumeBar = document.querySelector('.volume-bar');
        if (!volumeBar) return;

        // Update width
        const percentage = Math.min(volume * 100, 100);
        volumeBar.style.width = `${percentage}%`;

        // Update color based on volume
        if (volume > 0.1) {
            volumeBar.classList.add('bg-danger');
                volumeBar.classList.remove('bg-warning', 'bg-success');
            } else if (volume > 0.03) {
                volumeBar.classList.add('bg-warning');
                volumeBar.classList.remove('bg-danger', 'bg-success');
            } else {
                volumeBar.classList.add('bg-success');
                volumeBar.classList.remove('bg-danger', 'bg-warning');
            }
        }

        // Modify your existing volume update code to use this function
        // Replace the line: volumeDebugInfo.innerHTML = volume;
        // With: updateVolumeBar(volume);
