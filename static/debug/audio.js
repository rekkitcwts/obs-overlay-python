var devices = "";

window.onload = async () => {
    const debuginfo = document.getElementById('devicesList');
    
    navigator.mediaDevices.enumerateDevices().then(devices => {
        let devicesList = ""; // Separate variable for accumulating device info
        devices.forEach(device => {
            // Log device information to the console
            console.log(`${device.label}: ${device.deviceId}`);
            // Append device information to the devicesList string
            devicesList += `${device.label}: ${device.deviceId}<br>`;
        });
        // Set the accumulated string as the innerHTML of the <p> tag
        debuginfo.innerHTML = devicesList;
    });
    
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    
    const audioContext = new AudioContext();
    const mediaStreamAudioSourceNode = audioContext.createMediaStreamSource(stream);
    const analyserNode = audioContext.createAnalyser();
    mediaStreamAudioSourceNode.connect(analyserNode);

    const pcmData = new Float32Array(analyserNode.fftSize);
};
