import {
    energy,
    getIndexOfLeftmostMaximum, getNoteFrequency,
} from "./js/calculator";
import 'regenerator-runtime/runtime'
import {Score} from "./js/sheet-music";
import {UI} from "./js/ui";
import {getNoteFromMidi, Music} from "./js/music";
import AudioPlayer from "osmd-audio-player";
import {OpenSheetMusicDisplay, PageFormat} from "opensheetmusicdisplay";
import {PlaybackEvent} from "osmd-audio-player/src/PlaybackEngine";
import {startCursorMaster, stopMaster} from "./js/master-page";

let jquery = require("jquery");
window.$ = window.jQuery = jquery;
require("./js/jquery-3.4.1");
Music.init();
import("./js/playKeyboard").then(function (kb) {
    kb.playKeyboard(); // the keyboard on the learning page
    kb.playKeyboard1(); // the keyboard on the training page
});
// Older browsers might not implement mediaDevices at all, so we set an empty object first
if (navigator.mediaDevices === undefined) {
    navigator.mediaDevices = {};
}
let noteLog = [];

$(document).ready(async function () {
    let osmd = new OpenSheetMusicDisplay("score", {
        autoResize: true,
        backend: "svg",
        disableCursor: false,
        drawingParameters: "compact",
        drawPartNames: true,
        drawFingerings: true,
        fingeringPosition: "left",
        setWantedStemDirectionByXml: true, // try false, which was previously the default behavior
        // coloring options
        coloringEnabled: true,
        defaultColorNotehead: "#3d4849",
        defaultColorStem: "#3d4849",
        pageFormat: PageFormat.Endless,
        autoBeam: false,
        autoBeamOptions: {
            beam_rests: false,
            beam_middle_rests_only: false,
            maintain_stem_directions: false
        },
        tupletsBracketed: true, // creates brackets for all tuplets except triplets, even when not set by xml
        tripletsBracketed: true,
    });
    osmd.setLogLevel('debug'); // set this to 'debug' if you want to see more detailed control flow information in console
    // Create Audio Context and set its options
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    // console.log(audioCtx.sampleRate); // 48000
    const analyser = audioCtx.createAnalyser();
    analyser.smoothingTimeConstant = 0.91;
    analyser.fftSize = 8192;
    const bandSize = audioCtx.sampleRate / analyser.fftSize;
    let running = false;

    const audioPlayer = new AudioPlayer();
    audioPlayer.on(PlaybackEvent.ITERATION, notes => {
        $("#note-listen").text(getNoteFromMidi(notes[0].halfTone));
    });

    Score.renderPage(osmd, audioPlayer);
    UI.initButtons(osmd, audioPlayer);

    $("#start-train").on("click", function () {
        startRecording(startTraining);
    });

    $("#stop-train").on("click", function () {
        stopRecording();
        // console.log(noteLog);
    });

    $("#start").on("click", function () {
        $("#congrats").css("visibility", "hidden");
        $("#crt-song").text("");
        UI.none();
        startRecording(startLearning);
    });

    $("#stop").on("click", function () {
        stopRecording();
    });

    $("#start-master").on("click", function () {
        startRecording(startMaster);
    });

    $("#stop-master").on("click", function () {
        $(document).unbind("cursor:next");
        stopMaster(osmd);
        stopRecording();
    });

    function stopRecording() {
        audioCtx.suspend().then(() => {
            running = false;
        })
    }

    function startRecording(startFn) {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia(
                {audio: true})
                // Success callback
                .then(function (stream) {
                    running = true;
                    audioCtx.resume().then(() => {
                        const microphone = audioCtx.createMediaStreamSource(stream);
                        microphone.connect(analyser);
                        startFn();
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

    function startTraining() {
        let note = "-";
        let len = 0;
        let bufferLength = analyser.frequencyBinCount;
        let dataArray = new Uint8Array(bufferLength);
        let fDataArray = new Float32Array(bufferLength);
        UI.initVisualizerTime();
        let drawVisual;
        const frame = function () {
            if (running)
                drawVisual = requestAnimationFrame(frame);
            analyser.getFloatFrequencyData(fDataArray); // computes the FFT
            let indexOfMax = getIndexOfLeftmostMaximum(fDataArray);
            let min = indexOfMax * bandSize;
            let max = min + bandSize;
            let frequency = getNoteFrequency(Music.frequencies, min, max, 1);
            let crtNote = Music.notes[frequency];
            if (crtNote === note) {
                len++;
                if (len > 4) {
                    // display the note
                    $("#note-train").text(crtNote);
                    if (noteLog.last()!==note)
                        noteLog.push(note);
                    $(".frequency-img").css("display", "none");
                    $(".note-img").css("display", "none");
                    let crtVisualiser = $(".undef");
                    if (crtNote !== undefined) {
                        crtVisualiser = $(document.getElementById(crtNote + "t"));
                        crtVisualiser.css("display", "block");
                        crtVisualiser = $(document.getElementById(crtNote + "n"));
                        crtVisualiser.css("display", "block");
                        crtVisualiser = $(document.getElementById(crtNote));
                    }
                    crtVisualiser.css("display", "block");
                }
            } else {
                len = 1;
                note = crtNote;
            }
            analyser.getByteTimeDomainData(dataArray);
            UI.visualize_time(dataArray);
            analyser.getByteFrequencyData(dataArray);
            UI.visualize_frequency(dataArray);
        }

        frame();
    }

    function startLearning() {
        osmd.cursor.reset();
        osmd.cursor.show();
        let crt = 0;
        let bufferLength = analyser.frequencyBinCount;
        let dataArray = new Uint8Array(bufferLength);
        let fDataArray = new Float32Array(bufferLength);
        UI.initVisualizerFrequency('canvas');
        let len = 0;
        let note = "-";
        let songNote = $("#song-note");
        songNote.text(Score.song[0]);
        let drawVisual;
        const frame = function () {
            if (running)
                drawVisual = requestAnimationFrame(frame);

            // song finished
            if (crt >= Score.song.length) {
                $("#congrats").css("visibility", "visible");
                stopRecording();
                setTimeout(() => {
                    $("#congrats").css("visibility", "hidden");
                }, 4000);
            }

            if(Score.song[crt]==='rest'){
                osmd.cursor.next();
                crt++;
                return;
            }

            analyser.getByteFrequencyData(dataArray);
            analyser.getFloatFrequencyData(fDataArray);
            let e = energy(dataArray);
            if (e < 500)
                return;

            let indexOfMax = getIndexOfLeftmostMaximum(fDataArray);
            let min = indexOfMax * bandSize;
            let max = min + bandSize;
            let frequency = getNoteFrequency(Music.frequencies, min, max, 0);
            let crtNote = "-";
            if (parseInt(frequency) > 0)
                crtNote = Music.notes[frequency];
            if (crtNote === note) {
                len++;
                if (len > 1) {
                    // display the note
                    $("#note").text(crtNote);
                    if (note === Score.song[crt]) {
                        osmd.cursor.next();
                        crt++;
                        len = 1;
                        songNote.text(Score.song[crt]);
                    }
                    if (crtNote === Score.song[crt])
                        UI.correct();
                    else if (Music.noteMap[crtNote] < Music.noteMap[Score.song[crt]]) {
                        UI.down();
                    } else {
                        UI.up();
                    }
                    UI.visualize_frequency(dataArray);
                }
            } else {
                len = 1;
                note = crtNote;
            }
        };
        frame();
    }

    function startMaster() {
        let bufferLength = analyser.frequencyBinCount;
        let dataArray = new Uint8Array(bufferLength);
        let fDataArray = new Float32Array(bufferLength);
        UI.initVisualizerFrequency('canvas-master');
        let progressBar = $(".progress-bar");
        progressBar.attr('ariavalue-max', songLength);
        progressBar.attr('aria-valuenow', 0);
        let crt = 0;
        let ok = false;
        let songLength = Score.song.length;
        startCursorMaster(osmd);
        // on event cursor:next
        $(document).on("cursor:next", function cursorNextEvent() {
            let isRest = osmd.cursor.NotesUnderCursor()[0].isRest();
            if (!isRest) {
                if (ok) {
                    makeProgress();
                    osmd.cursor.NotesUnderCursor()[0].NoteheadColor = "#48b461";
                } else {
                    osmd.cursor.NotesUnderCursor()[0].NoteheadColor = "#ff5340";
                }
                crt++;
            }
            ok = false;
            if (crt === Score.song.length) {
                $(document).unbind("cursor:next");
                stopMaster(osmd);
                stopRecording();
            }
        });
        var i = 0;
        function makeProgress() {
            if (i < songLength) {
                i = i + 1;
                progressBar.css("width", i * 100 / songLength + "%").text(Math.round(i * 100 / songLength) + "%");
            }
        }

        let drawVisual;
        const frame = function () {
            if (running)
                drawVisual = requestAnimationFrame(frame);
            analyser.getFloatFrequencyData(fDataArray);
            analyser.getByteFrequencyData(dataArray);
            let indexOfMax = getIndexOfLeftmostMaximum(fDataArray);
            let min = indexOfMax * bandSize;
            let max = min + bandSize;
            let frequency = getNoteFrequency(Music.frequencies, min, max, 1);
            let crtNote = Music.notes[frequency];
            if (crtNote === Score.song[crt]) {
                ok = true;
                UI.correct();
            } else if (Music.noteMap[crtNote] < Music.noteMap[Score.song[crt]]) {
                UI.down();
            } else {
                UI.up();
            }
            UI.visualize_frequency(dataArray, indexOfMax);
        };
        frame();
    }
});
