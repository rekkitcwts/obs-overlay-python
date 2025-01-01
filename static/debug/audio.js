var devices = "";

window.onload = async () => {
    const debuginfo = document.getElementById('devicesList');
    
    navigator.mediaDevices.enumerateDevices().then(devices => {
        devices.forEach(device => {
            //if (device.kind === 'audioinput') {
            console.log(`${device.label}: ${device.deviceId}`);
            devices = devices + `${device.label}: ${device.deviceId}` + "\n";
            //}
        });
    });
    
    debuginfo.innerHTML = devices;
    
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    
    const audioContext = new AudioContext();
    const mediaStreamAudioSourceNode = audioContext.createMediaStreamSource(stream);
    const analyserNode = audioContext.createAnalyser();
    mediaStreamAudioSourceNode.connect(analyserNode);

    const pcmData = new Float32Array(analyserNode.fftSize);
};
