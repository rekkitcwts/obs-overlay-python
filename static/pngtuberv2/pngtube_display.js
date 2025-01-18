//pngtube.js 1.0
// Thank you to jameshfisher for the info on getting microphone volume
// https://jameshfisher.com/2021/01/18/measuring-audio-volume-in-javascript/

var volume;
var emotion;
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
    const tuberDiv = document.getElementById('tuberdiv');
    const tuberDivRoot = document.getElementById('tuberdivroot');
    // const initialRootTransform = tuberDivRoot.style;
    const initialRootTransform = "translate(-50%, 0%)";
    console.log(initialRootTransform);

    //Preload images (though there might be a better way than chaining them?)
    ["styleBlink", "styleVolumeMedium", "styleVolumeSoft", "styleNeutral"].forEach( (c, i) => {
        tuberDivRoot.style.transform = "translateX(-1000%)"; //This is here so it doesn't visibly go through all states. Using "display: none" defeats the purpose...
        setTimeout( () => {
            tuberDiv.className = c;
            if (i >= 3) {
                initialized = true;
                tuberDivRoot.style.transform = initialRootTransform; //This is here so it doesn't visibly go through all states.
            }
        }, 70 * i);
    });
    
    //Get settings from style.css:
    try{
        blinkTimeOut = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--blink-timeout'));
        blinkTimeOutFuzziness = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--blink-fuzziness'));
        blinkStateDuration = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--blink-duration'));
        softVolumeThreshold = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--soft-volume-threshold'));
        mediumVolumeThreshold = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--medium-volume-threshold'));
    } catch {
    }

    const img = document.getElementById('image');
    
    const onFrame = () => {
        fetchVolumeData();
        console.log("VOLUME IN LOOP: ", volume);
        if (volume > mediumVolumeThreshold) {
            if(tuberDiv.className != "styleVolumeMedium") {
                //TODO: Pick random classes
                tuberDiv.className = "styleVolumeMedium";
            }
        } else if (volume > softVolumeThreshold) {
            if(tuberDiv.className != "styleVolumeSoft") {
                tuberDiv.className = "styleVolumeSoft";
            }
        } else {
            if (canBlink) {
                canBlink = false;
                if (tuberDiv.className != "styleBlink") {
                    tuberDiv.className = "styleBlink";
                    isBlinking = true;
                        //We don't know how long the blink state is. Let's just assume it's going to be at most 1000ms
                        setTimeout( () => {
                            if(volume < softVolumeThreshold) {
                                tuberDiv.className = "styleNeutral";
                            }
                            
                            isBlinking = false;
                        }, blinkStateDuration);
                    }
            } else { 
                if(tuberDiv.className != "styleNeutral" && !isBlinking) {
                    tuberDiv.className = "styleNeutral";
                }
            }
        }
        window.requestAnimationFrame(onFrame);
    }
    window.requestAnimationFrame(onFrame);
};

function fetchVolumeData() {
    fetch(`/pngtuber/v2/get-pngtuber-attrs?timestamp=${new Date().getTime()}`)
        .then(response => response.json())
        .then(data => {
            console.log('Received volume:', data.volume);
            volume = data.volume;
        })
        .catch(error => {
            console.error('Error fetching volume:', error);
        });
}

//This method has a timer that runs a random amount of time and checks if the avatar can blink.
//This is better in this situation than running the timer after every blink.
function startBlinkTimer() {
    var duration = blinkTimeOut + ( Math.random() * blinkTimeOutFuzziness );
    setTimeout( ()=> {
        canBlink = true;
        startBlinkTimer();
    }, duration)
}
