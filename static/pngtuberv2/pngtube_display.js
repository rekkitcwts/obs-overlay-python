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
    fetchVolumeData();
    
};

function fetchVolumeData() {
    fetch('/pngtuber/v2/get-pngtuber-attrs')
        .then(response => response.json())
        .then(data => {
            console.log('Received volume:', data.volume);
        })
        .catch(error => {
            console.error('Error fetching volume:', error);
        });
}
