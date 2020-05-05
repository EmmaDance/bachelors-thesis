import {binarySearch, energy, getIndexOfMax, mapFrequencies} from "./js/calculator";
import {OpenSheetMusicDisplay} from "opensheetmusicdisplay";
import AudioPlayer from "osmd-audio-player";
import 'regenerator-runtime/runtime'
import {getSong} from "./js/sheet-music.js";
import {parseMusic} from "./js/sheet-music";

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

    $('#get-sample').click(async function () {
        let score = await getScore();
        await loadMusic(score);
    });

    async function getScore() {
        const url = 'http://localhost:3000/score/sample';

        return await $.ajax({
            url: url,
            type: 'GET',
            success: function (res) {
                return res;
            },
            error: function (xhr, status, error) {
                console.log(error);
            }

        });
    }

    async function loadMusic(sheetMusic) {
        // let osmd = new OpenSheetMusicDisplay("score", {
        //     autoResize: true,
        //     backend: "svg",
        //     drawingParameters: "allon",
        //     pageFormat: "Endless",
        //     followCursor: true,
        //     disableCursor: false,
        //     coloringEnabled: true,
        // });
        song = parseMusic(sheetMusic);
        let init_song = $("#init-song");
        let osmd = new OpenSheetMusicDisplay(document.getElementById("score"));
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

    // sheet music
    $("#upload-btn").on("click", function () {
        let file = document.getElementById('file-input');
        readFile(file);
    });

    let running = false;
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
                // constraints - only audio needed for this client
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

    function lower(note1, note2) {
        if(!(note1 && note2))
            return 0;
        console.log("lower: " + note1 + " - " + note2);
        const octave1=note1[note1.length-1];
        const octave2=note2[note2.length-1];
        if (octave1 < octave2)
            return 1;
        if (octave2<octave1)
            return -1;
        if (note1[0] < note2[0])
            return 1;
        if (note2[0] < note1[0])
            return -1;
        // if note 2 has a sharp in it, it is higher
        if  (note2.length>note1.length)
            return 1;
        return -1;
    }

    function correct() {
        $("#correct").css("color", "green");
        $("#up").css("color", "whitesmoke");
        $("#down").css("color", "whitesmoke");
    }

    function none() {
        $("#correct").css("color", "whitesmoke");
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
            // console.log(min);
            // console.log(max);
            console.log(frequency);
            let crtNote = notes[frequency];
            console.log(crtNote);
            console.log(note);

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

            console.log("note is "+note);
            console.log("song[crt] is "+song[crt]);
            if (note === song[crt]) {
                correct();
                crt_song.append(" " + note);
                crt++;
                // song finished
                if (crt >= song.length) {
                    $("#congrats").css("visibility", "visible");
                    stopRecording();
                }
            } else if (lower(note, song[crt])===1) {
                down();
            } else if (lower(note, song[crt])===-1){
                up();
            }
            else{
                none();
            }

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


