import {binarySearch, energy, getIndexOfMax, mapFrequencies, mapNotes} from "./js/calculator";
import 'regenerator-runtime/runtime'
import {Score} from "./js/sheet-music";
import {Ajax} from "./js/service-utils";
import {UI} from "./js/ui";
import {Tests} from "./js/tests";
import {Music} from "./js/music";
import AudioPlayer from "osmd-audio-player";
import {OpenSheetMusicDisplay, PageFormat} from "opensheetmusicdisplay";
import {PlaybackEvent} from "osmd-audio-player/src/PlaybackEngine";

let jquery = require("jquery");
window.$ = window.jQuery = jquery;
require("./js/jquery-3.4.1");
Tests.runAllTests();
Music.init();
let pos = 0;
let measure = 0;

$(document).ready(function () {
// Create OSMD object and canvas
    let osmd = new OpenSheetMusicDisplay("score", {
        autoResize: true,
        backend: "svg",
        disableCursor: false,
        drawingParameters: "compact", // try compact (instead of default)
        drawPartNames: true, // try false
        // drawTitle: false,
        // drawSubtitle: false,
        drawFingerings: true,
        fingeringPosition: "left", // left is default. try right. experimental: auto, above, below.
        // fingeringInsideStafflines: "true", // default: false. true draws fingerings directly above/below notes
        setWantedStemDirectionByXml: true, // try false, which was previously the default behavior
        // drawUpToMeasureNumber: 3, // draws only up to measure 3, meaning it draws measure 1 to 3 of the piece.

        //drawMeasureNumbers: false, // disable drawing measure numbers
        //measureNumberInterval: 4, // draw measure numbers only every 4 bars (and at the beginning of a new system)

        // coloring options
        coloringEnabled: true,
        defaultColorNotehead: "teal", // try setting a default color. default is black (undefined)
        defaultColorStem: "#106d85",
        pageFormat: PageFormat.Endless,
        autoBeam: false, // try true, OSMD Function Test AutoBeam sample
        autoBeamOptions: {
            beam_rests: false,
            beam_middle_rests_only: false,
            //groups: [[3,4], [1,1]],
            maintain_stem_directions: false
        },

        // tupletsBracketed: true, // creates brackets for all tuplets except triplets, even when not set by xml
        // tripletsBracketed: true,
        // tupletsRatioed: true, // unconventional; renders ratios for tuplets (3:2 instead of 3 for triplets)
    });
    osmd.setLogLevel('debug'); // set this to 'debug' if you want to see more detailed control flow information in console

    import("./js/playKeyboard").then(function (kb) {
        kb.playKeyboard();
    });


    $("#upload-btn").on("click", async function () {
        console.log("upload btn clicked");
        const file = document.getElementById('file-input');
        await Score.readFile(file, osmd, audioPlayer);
    });

    $("#change-music-btn").on("click", async function () {
        console.log("Change btn clicked");
        Score.clearLocalStorage();
        await Score.renderPage(osmd, audioPlayer);
        reset();
    });

    $('#get-sample').click(async function () {
        let score = await Ajax.getScore();
        $("#loading-indicator").css("visibility", 'hidden');
        await Score.loadMusic(score, osmd, audioPlayer);
        await Score.renderPage(osmd, audioPlayer);
    });

    function reset() {
        $("#crt-song").text("");
        $("#init-song").text("");
        $("#congrats").css("visibility", "hidden");
        UI.none();
    }

    function startMaster() {
        var allNotes = []
        osmd.cursor.reset();
        osmd.cursor.show();
        const iterator = osmd.cursor.Iterator;

        while (!iterator.EndReached) {
            const voices = iterator.CurrentVoiceEntries;
            const v = voices[0];
            const notes = v.notes;
            // const bpm = osmd.Sheet.userStartTempoInBPM;
            const bpm = parseInt($("#tempoOutputId").text());
            for (var j = 0; j < notes.length; j++) {
                const note = notes[j];
                if ((note != null)) {
                    // console.log(note);
                    allNotes.push({
                        "note": note.halfTone + 12, // see issue #224
                        "time": iterator.CurrentSourceTimestamp.RealValue * 4 * 60 / bpm
                    });
                    console.log(iterator.CurrentSourceTimestamp.RealValue * 4 * 60 / bpm);
                }
            }
            iterator.moveToNext();
        }

        osmd.cursor.reset();
        osmd.cursor.show();
        let i = 0;
        let oldTime = 0;
        let newTime = allNotes[i].time;
            window.setTimeout(function run() {
                i++;
                if (i>=allNotes.length)
                    return;
                osmd.cursor.next();
                oldTime = allNotes[i-1].time;
                newTime = allNotes[i].time-oldTime;
                console.log(newTime);
                window.setTimeout(run, newTime*1000);
            }, newTime*1000);
    }

// Older browsers might not implement mediaDevices at all, so we set an empty object first

    if (navigator.mediaDevices === undefined) {
        navigator.mediaDevices = {};
    }

    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    // console.log(audioCtx.sampleRate);
    const audioPlayer = new AudioPlayer();
    Score.renderPage(osmd, audioPlayer);

// const biquadFilter = audioCtx.createBiquadFilter();
// biquadFilter.type = "lowshelf";
    const analyser = audioCtx.createAnalyser();
    analyser.smoothingTimeConstant = 0.92;
    let bufferLength = analyser.frequencyBinCount;
    console.log(bufferLength);
    let dataArray = new Uint8Array(bufferLength);
    analyser.fftSize = 4096;
    const bandSize = audioCtx.sampleRate / analyser.fftSize;
// Audio Buffer - to access the raw PCM data (in case we need it)
// let myArrayBuffer = audioCtx.createBuffer(2, audioCtx.sampleRate, audioCtx.sampleRate);

    let running = false;

    $("#start").on("click", function () {
        startRecording();
    });
    $("#stop").on("click", function () {
        stopRecording();
    });
    $("#restart").on("click", function () {
        restartRecording();
    });

    $("#start-master").on("click", function () {
        startMaster();
    });

    function stopRecording() {
        audioCtx.suspend().then(() => {
            running = false;
        })
    }

    function startRecording() {
        $("#congrats").css("visibility", "hidden");
        $("#crt-song").text("");
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            console.log('getUserMedia supported.');
            navigator.mediaDevices.getUserMedia(
                // constraints - only audio needed for this client
                {audio: true})
                // Success callback
                .then(function (stream) {
                    console.log("Success");
                    running = true;
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

    function restartRecording() {
        startRecording();
        $("#congrats").css("visibility", "hidden");
        $("#crt-song").text("");

    }

    function start() {
        osmd.cursor.reset();
        osmd.cursor.show();
        let crt = 0;
        let crt_song = $("#crt-song");
        console.log("start");
        console.log("song = ", Score.song);

        bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);
        const fDataArray = new Float32Array(bufferLength);

        UI.initVisualizer();
        let len = 0;
        let note = "C0";

        let drawVisual;
        const frame = function () {
            if (running)
                drawVisual = requestAnimationFrame(frame);
            analyser.getByteFrequencyData(dataArray);
            analyser.getFloatFrequencyData(fDataArray);

            let e = energy(dataArray);
            if (e < 500)
                return;

            let indexOfMax = getIndexOfMax(fDataArray);
            let min = indexOfMax * bandSize;
            let max = min + bandSize;
            let frequency = binarySearch(Music.frequencies, min, max);
            console.log(frequency);
            let crtNote = Music.notes[frequency];

            if (crtNote === note) {
                len++;
                if (len > 5) {
                    // display the note
                    // $("#note").text(crtNote);
                    console.log("note is " + note);
                    console.log("song[crt] is " + Score.song[crt]);

                    if (note === Score.song[crt]) {
                        // osmd.GraphicSheet.MeasureList[0][0].staffEntries[1].graphicalVoiceEntries[0].notes[0].sourceNote.NoteheadColor = "red";
                        // osmd.render()
                        osmd.cursor.next();

                        crt_song.append(" " + note);
                        len = 1;
                        crt++;
                        // song finished
                        if (crt >= Score.song.length) {
                            $("#congrats").css("visibility", "visible");
                            stopRecording();
                            setTimeout(() => {
                                $("#congrats").css("visibility", "hidden");
                            }, 4000);
                        }
                        if (osmd.cursor.NotesUnderCursor()[0].isRest())
                            osmd.cursor.next();
                    }

                    if (crtNote === Score.song[crt])
                        UI.correct();
                    else if (Music.noteMap[crtNote] < Music.noteMap[Score.song[crt]]) {
                        UI.down();
                    } else {
                        UI.up();
                    }

                    console.log(note);
                    console.log(Music.noteMap[crtNote]);
                    console.log(Score.song[crt]);
                    console.log(Music.noteMap[Score.song[crt]]);
                    UI.visualize(dataArray, bufferLength);

                }
            } else {
                len = 1;
                note = crtNote;
            }

        };
        frame();
    }
});



