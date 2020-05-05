import {binarySearch, energy, getIndexOfMax, mapFrequencies, mapNotes} from "./js/calculator";
import {OpenSheetMusicDisplay} from "opensheetmusicdisplay";
import AudioPlayer from "osmd-audio-player";
import 'regenerator-runtime/runtime'
import {getSong} from "./js/sheet-music.js";
import {getScore, parseMusic, readFile} from "./js/sheet-music";
import {registerButtonEvents} from "./js/audio-player";

let jquery = require("jquery");
window.$ = window.jQuery = jquery;
require("./js/jquery-3.4.1");
let song = [];

$(document).ready(function () {

    import("./js/playKeyboard").then(function (kb) {
        kb.playKeyboard();
    });

    function renderPage() {
        if (localStorage.getItem("hasScore")) {
            loadMusic(localStorage.getItem("score"));
            $("#initialize").css("display", "none");
            $("#navigation").css("display", "inline");
            $("#pages").css("display", "inline");
        }
    }
    renderPage();

    async function loadMusic(sheetMusic) {
        song = parseMusic(sheetMusic);
        let init_song = $("#init-song");
        let osmd = new OpenSheetMusicDisplay("score", {
            autoResize: true,
            backend: "svg",
            drawingParameters: "allon",
            drawCredits: false,
            pageFormat: "Endless",
            followCursor: true,
            disableCursor: false,
            coloringEnabled: true,
        });
        // let osmd = new OpenSheetMusicDisplay(document.getElementById("score"));
        await osmd.load(sheetMusic);
        await osmd.render();
        const audioPlayer = new AudioPlayer();
        await audioPlayer.loadScore(osmd);
        if (localStorage.getItem("hasScore")) {
            init_song.html(localStorage.getItem('song'));
        } else {
            let songStr = "";
            for (let note of song) {
                init_song.append(note + " ");
                songStr += note;
                songStr += " ";
            }
            localStorage.setItem('score', sheetMusic);
            localStorage.setItem('song', songStr);
            localStorage.setItem('hasScore', 'true');
            renderPage();
        }
        registerButtonEvents(audioPlayer);
    }

    $("#upload-btn").on("click", function () {
        let file = document.getElementById('file-input');
        readFile(file);
    });

    $('#get-sample').click(async function () {
        let score = await getScore();
        await loadMusic(score);
    });

    // Older browsers might not implement mediaDevices at all, so we set an empty object first
    if (navigator.mediaDevices === undefined) {
        navigator.mediaDevices = {};
    }

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
    let noteMap = {};
    analyser.fftSize = 4096;
    const bandSize = audioCtx.sampleRate / analyser.fftSize;
    let running = false;
    let crt = 0;
    let crt_song = $("#crt-song");

    // Audio Buffer - to access the raw PCM data (in case we need it)
    // let myArrayBuffer = audioCtx.createBuffer(2, audioCtx.sampleRate, audioCtx.sampleRate);

    $("#start").on("click", function () {
        startRecording();
    });
    $("#stop").on("click", function () {
        stopRecording();
    });

    function stopRecording() {
        audioCtx.suspend().then(() => {
            running = false;
        })
    }

    function startRecording() {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            console.log('getUserMedia supported.');
            navigator.mediaDevices.getUserMedia(
                // constraints - only audio needed for this client
                {audio: true})
                // Success callback
                .then(function (stream) {
                    console.log("Success");
                    running = true;
                    mapFrequencies(notes, frequencies);
                    mapNotes(noteMap, notes);
                    console.log(noteMap);
                    audioCtx.resume().then(() => {
                        const microphone = audioCtx.createMediaStreamSource(stream);
                        microphone.connect(analyser);
                        // microphone.connect(biquadFilter);
                        // biquadFilter.connect(analyser);
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

    function correct() {
        $("#correct").css("color", "green");
        $("#up").css("color", "whitesmoke");
        $("#down").css("color", "whitesmoke");
    }

    function up() {
        $("#correct").css("color", "whitesmoke");
        $("#up").css("color", "darkred");
        $("#down").css("color", "whitesmoke");
    }

    function down() {
        $("#correct").css("color", "whitesmoke");
        $("#up").css("color", "whitesmoke");
        $("#down").css("color", "darkred");
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
        let note = "C0";

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
            // console.log("ENERGY = ", e);
            if (e < 500)
                return;

            let indexOfMax = getIndexOfMax(fDataArray);
            let min = indexOfMax * bandSize;
            let max = min + bandSize;
            let frequency = binarySearch(frequencies, min, max);
            // console.log("NEW FRAME");
            // console.log(indexOfMax);
            // console.log(bandSize);
            console.log(min);
            console.log(max);
            console.log(frequency);
            let crtNote = notes[frequency];
            // console.log(crtNote);
            // console.log(note);

            if (crtNote === note) {
                len++;
                if (len > 5) {
                    // display the note
                    $("#note").text(crtNote);
                }
            } else {
                len = 1;
                note = crtNote;
            }
            console.log("note is "+note);
            console.log("song[crt] is "+song[crt]);
            if (note === song[crt]) {
                crt_song.append(" " + note);
                crt++;
                // song finished
                if (crt >= song.length) {
                    $("#congrats").css("visibility", "visible");
                    stopRecording();
                }
            }

            if(crtNote === song[crt])
                correct();
            else if(noteMap[crtNote]<noteMap[song[crt]]){
                down();
            }
            else {
                up();
            }
            console.log(note);
            console.log(noteMap[crtNote]);
            console.log(song[crt]);
            console.log(noteMap[song[crt]]);

            canvasCtx.fillStyle = 'rgb(255, 255, 255)';
            canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

            let barWidth = (WIDTH / bufferLength) * 4;
            let barHeight;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                barHeight = dataArray[i];

                canvasCtx.fillStyle = 'rgb(15,31,35)';
                canvasCtx.fillRect(x, HEIGHT - barHeight / 2, barWidth, barHeight / 2);

                x += barWidth + 1;
            }
        };
        frame();
    }
});



