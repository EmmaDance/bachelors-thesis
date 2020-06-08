// Hacks to deal with different function names in different browsers
window.requestAnimFrame = (function(){
    return  window.requestAnimationFrame       ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        function(callback, element){
            window.setTimeout(callback, 1000 / 60);
        };
})();

window.AudioContext = (function(){
    return  window.webkitAudioContext || window.AudioContext || window.mozAudioContext;
})();

// Global Variables for Audio
var audioContext;
var audioBuffer;
var sourceNode;
var analyserNode;
var javascriptNode;
var audioData = null;
var audioPlaying = false;
var sampleSize = 1024;  // number of samples to collect before analyzing data
var amplitudeArray;     // array to hold time domain data

// This must be hosted on the same server as this page - otherwise you get a Cross Site Scripting error
var audioUrl = "/assets/Doctor_Who_theme_excerpt.ogg";

// Global Variables for the Graphics
var canvasWidth  = 512;
var canvasHeight = 256;
var ctx;

$(document).ready(function() {

    ctx = $("#canvas").get()[0].getContext("2d");

    // the AudioContext is the primary 'container' for all your audio node objects
    try {
        audioContext = new AudioContext();
    } catch(e) {
        alert('Web Audio API is not supported in this browser');
    }

    // When the Start button is clicked, finish setting up the audio nodes, play the sound,
    // gather samples for the analysis, update the canvas
    $("#start_button").on('click', function(e) {
        e.preventDefault();

        // Set up the audio Analyser, the Source Buffer and javascriptNode
        setupAudioNodes();

        // setup the event handler that is triggered every time enough samples have been collected
        // trigger the audio analysis and draw the results
        javascriptNode.onaudioprocess = function () {

            // get the Time Domain data for this sample
            analyserNode.getByteTimeDomainData(amplitudeArray);

            // draw the display if the audio is playing
            if (audioPlaying == true) {
                requestAnimFrame(drawTimeDomain);
            }
        }

        // Load the Audio the first time through, otherwise play it from the buffer
        if(audioData == null) {
            loadSound(audioUrl);
        } else {
            playSound(audioData);
        }
    });

    // Stop the audio playing
    $("#stop_button").on('click', function(e) {
        e.preventDefault();
        sourceNode.stop(0);
        audioPlaying = false;
    });
});

function setupAudioNodes() {
    sourceNode     = audioContext.createBufferSource();
    analyserNode   = audioContext.createAnalyser();
    javascriptNode = audioContext.createScriptProcessor(sampleSize, 1, 1);

    // Create the array for the data values
    amplitudeArray = new Uint8Array(analyserNode.frequencyBinCount);

    // Now connect the nodes together
    sourceNode.connect(audioContext.destination);
    sourceNode.connect(analyserNode);
    analyserNode.connect(javascriptNode);
    javascriptNode.connect(audioContext.destination);
}

// Load the audio from the URL via Ajax and store it in global variable audioData
// Note that the audio load is asynchronous
function loadSound(url) {
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';

    // When loaded, decode the data and play the sound
    request.onload = function () {
        audioContext.decodeAudioData(request.response, function (buffer) {
            audioData = buffer;
            playSound(audioData);
        }, onError);
    }
    request.send();
}

// Play the audio and loop until stopped
function playSound(buffer) {
    sourceNode.buffer = buffer;
    sourceNode.start(0);    // Play the sound now
    sourceNode.loop = true;
    audioPlaying = true;
}

function onError(e) {
    console.log(e);
}

function drawTimeDomain() {
    clearCanvas();
    for (var i = 0; i < amplitudeArray.length; i++) {
        var value = amplitudeArray[i] / 256;
        var y = canvasHeight - (canvasHeight * value) - 1;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(i, y, 1, 1);
    }
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
}
