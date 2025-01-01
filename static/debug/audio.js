var devices = "";

window.onload = async () => {
    const debuginfo = document.getElementById('devicesList');
    
    navigator.mediaDevices.enumerateDevices().then(devices => {
        devices.forEach(device => {
            if (device.kind === 'audioinput') {
                console.log(`${device.label}: ${device.deviceId}`);
                devices = devices + `${device.label}: ${device.deviceId}` + "\n";
            }
        });
    });
    
    debuginfo.innerText = devices;
};
