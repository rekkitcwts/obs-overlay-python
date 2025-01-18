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
    initialized = true;

    // Specify the devices to prioritize and avoid
const dedicated_microphone = "Headset (联想thinkplus-TH20 Hands-Free AG Audio) (Bluetooth)";
const avoid_device = "Digital Audio Interface (USB Digital Audio) (534d:2109)";

let device_id = null;
const socket = io('https://obs-overlay-python.vercel.app/microphone', {
    transports: ['websocket', 'polling']
}); // Connect to the microphone namespace

    socket.on('connect', () => {
        console.log('Connected to microphone namespace');
    });

    /*const sendVolume = (volume) => {
        if (socket.connected) {
            socket.send({ volume: volume }); // Send volume data
        }
    };*/
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
                volumeDebugInfo.innerHTML = volume;
                console.log(volume);
                /*if (socket.connected) {
                    socket.send({ volume: volume }); // Send volume data
                }*/
                fetch('/../display', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ volume: volume }),
                }).catch(error => {
                    console.error('Error sending volume data:', error);
                });
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
