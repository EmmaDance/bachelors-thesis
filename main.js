import {binarySearch, energy, getIndexOfMax, mapFrequencies} from "./js/calculator";

let jquery = require("jquery");
window.$ = window.jQuery = jquery;
require("./js/jquery-3.4.1");
import {OpenSheetMusicDisplay} from "opensheetmusicdisplay";
import AudioPlayer from "osmd-audio-player";
import 'regenerator-runtime/runtime'
function registerButtonEvents(audioPlayer) {
    document.getElementById("btn-play").addEventListener("click", () => {
        if (audioPlayer.state === "STOPPED" || audioPlayer.state === "PAUSED") {
            audioPlayer.play();
        }
    });
    document.getElementById("btn-pause").addEventListener("click", () => {
        if (audioPlayer.state === "PLAYING") {
            audioPlayer.pause();
        }
    });
    document.getElementById("btn-stop").addEventListener("click", () => {
        if (audioPlayer.state === "PLAYING" || audioPlayer.state === "PAUSED") {
            audioPlayer.stop();
        }
    });
}

$(document).ready(function () {
    import("./js/playKeyboard").then(function (kb) {
        kb.playKeyboard();
    });

    function readFile(input) {
        let file = input.files[0];
        let reader = new FileReader();
        reader.readAsText(file);
        reader.onload = function () {
           loadMusic(reader.result);
        };
        reader.onerror = function () {
            console.log(reader.error);
        };
    }

    async function loadMusic(sheetMusic){
        // let osmd = new OpenSheetMusicDisplay("score", {
        //     autoResize: true,
        //     backend: "svg",
        //     drawingParameters: "allon",
        //     pageFormat: "Endless",
        //     followCursor: true,
        //     disableCursor: false,
        //     coloringEnabled: true,
        // });
        let osmd = new OpenSheetMusicDisplay(document.getElementById("score"));

        await osmd.load(sheetMusic);
        await osmd.render();
        const audioPlayer = new AudioPlayer();
        await audioPlayer.loadScore(osmd);

        registerButtonEvents(audioPlayer);

        $("#initialize").css("display", "none");
    }

    // sheet music
    $("#upload-btn").on("click", function () {
        let file = document.getElementById('file-input');
        readFile(file);
    });


    // let loadPromise = osmd.load("https://drive.google.com/open?id=1WrfyjhurNg-SHowwOz41MGNtVTPJeIdU");

    // // "upload-dropzone" is the camelized version of the HTML element's ID
    // Dropzone.options.uploaddropzone = {
    //     paramName: "sheet-music", // The name that will be used to transfer the file
    //     maxFilesize: 10, // MB
    //     accept: function(file, done) {
    //         if (file.name === "justinbieber.jpg") {
    //             done("Naha, you don't.");
    //         }
    //         else {
    //             alert("The upload was successful!")
    //             done(); }
    //     }
    // };
    //
    // Dropzone.options.uploaddropzone = {
    //     init: function() {
    //         this.on("addedfile", function(file) { alert("Added file."); });
    //     }
    // };


    function getSong() {
        // let notes = "c c d c f e c c d c g f c c c a f e d b b a f g f";
        let notes = "C4 C4 D4 C4 F4 E4 C4 C4 D4 C4 G4 F4 C4 C4 C5 A4 F4 E4 D4 B4 B4 A4 F4 G4 F4";
        // notes = notes.toUpperCase();
        let newNotes = [];
        let prev = {"A": "G", "B": "A", "C": "B", "D": "C", "E": "D", "F": "E", "G": "F",};
        // let flats = "a b d e";
        let flats = "b";
        flats = flats.toUpperCase();
        flats = flats.split(" ");
        notes = notes.split(" ");
        for (let note of notes) {
            if (flats.includes(note[0])) {
                note = prev[note[0]] + "#" + note[1];
            }
            newNotes.push(note);
        }
        // console.log(notes);
        // console.log(newNotes);
        return newNotes;
    }

    let running = false;
    let song = getSong();
    let init_song = $("#init-song");
    for (let note of song)
        init_song.append(note + " ");
    let crt = 0;

    let crt_song = $("#crt-song");

    // Older browsers might not implement mediaDevices at all, so we set an empty object first
    if (navigator.mediaDevices === undefined) {
        navigator.mediaDevices = {};
    }

    $("#start").on("click", function () {
        startRecording();
    });
    $("#stop").on("click", function () {
        stopRecording();
    });

    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    console.log(audioCtx.sampleRate);
    // const biquadFilter = audioCtx.createBiquadFilter();
    // biquadFilter.type = "lowshelf";
    const analyser = audioCtx.createAnalyser();

    analyser.smoothingTimeConstant = 0.9;
    let bufferLength = analyser.frequencyBinCount;
    console.log(bufferLength);
    let dataArray = new Uint8Array(bufferLength);
    let frequencies = {};
    let notes = {};
    analyser.fftSize = 4096;
    const bandSize = audioCtx.sampleRate / analyser.fftSize;


    // Audio Buffer - to access the raw PCM data (in case we need it)
    // let myArrayBuffer = audioCtx.createBuffer(2, audioCtx.sampleRate, audioCtx.sampleRate);

    function stopRecording() {
        audioCtx.suspend().then(() => {
            running = false;
        })

    }

    function startRecording() {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            console.log('getUserMedia supported.');
            navigator.mediaDevices.getUserMedia(
                // constraints - only audio needed for this app
                {audio: true})
                // Success callback
                .then(function (stream) {
                    console.log("Success");
                    running = true;
                    mapFrequencies(notes, frequencies);
                    audioCtx.resume().then(() => {
                        const microphone = audioCtx.createMediaStreamSource(stream);
                        microphone.connect(analyser);
                        // microphone.connect(biquadFilter);
                        // biquadFilter.connect(analyser);
                        // analyser.connect(audioCtx.destination);
                        start();
                    });
                })
                // Error callback
                .catch(function (err) {
                    console.log('The following getUserMedia error occurred: ' + err);
                });
        } else {
            console.log('getUserMedia not supported on your browser!');
        }
    }

    function start() {
        const HEIGHT = 100;
        const WIDTH = 300;
        bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);
        const fDataArray = new Float32Array(bufferLength);

        const canvas = document.getElementById('canvas');
        const canvasCtx = canvas.getContext('2d');
        canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
        let len = 0;
        let note = "";

        let drawVisual;
        const frame = function () {
            if (running)
                drawVisual = requestAnimationFrame(frame);
            analyser.getByteFrequencyData(dataArray);
            analyser.getFloatFrequencyData(fDataArray);


            // let z = zcr(fDataArray);
            // console.log("ZCR = ", z);
            // let threshold = 100;
            // if (z>threshold)
            //     return;

            let e = energy(dataArray);
            console.log("ENERGY = ", e);
            if (e < 500)
                return;

            let indexOfMax = getIndexOfMax(fDataArray);
            let min = indexOfMax * bandSize;
            let max = min + bandSize;
            let frequency = binarySearch(frequencies, min, max);
            console.log("NEW FRAME");
            console.log(indexOfMax);
            console.log(bandSize);
            console.log(min);
            console.log(max);
            console.log(frequency);
            let crtNote = notes[frequency];
            console.log(crtNote);

            if (crtNote === note) {
                len++;
                if (len > 3) {
                    // display the note
                    $("#note").text(crtNote);
                }
            } else {
                len = 1;
                note = crtNote;
            }

            // song finished
            if (crtNote === song[crt]) {
                crt_song.append(" " + crtNote);
                crt++;
                if (crt >= song.length) {
                    $("#congrats").css("visibility", "visible");
                    stopRecording();
                }
            }

            canvasCtx.fillStyle = 'rgb(255, 255, 255)';
            canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

            let barWidth = (WIDTH / bufferLength) * 4;
            let barHeight;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                barHeight = dataArray[i];

                // canvasCtx.fillStyle = 'rgb(0,0,' + (barHeight + 100) + ')';
                canvasCtx.fillStyle = 'rgb(15,31,35)';
                canvasCtx.fillRect(x, HEIGHT - barHeight / 2, barWidth, barHeight / 2);

                x += barWidth + 1;
            }
        };
        frame();
    }
});
