import {OpenSheetMusicDisplay} from "opensheetmusicdisplay";
import {registerButtonEvents} from "./audio-player";

let song = [];

// parses the .musicxml file and returns the information needed about the notes: pitch(step and octave) --and duration
function parseMusic(sheetMusic) {
    song.clear();
    console.log("INIT_SHEET_MUSIC");
    let prev = {
        "A": "G",
        "B": "A",
        "C": "B",
        "D": "C",
        "E": "D",
        "F": "E",
        "G": "F",
    }
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(sheetMusic, "text/xml");
    let notes = xmlDoc.getElementsByTagName("note");
    let note, pitch, step, alter, octave, duration;
    for (let i = 0; i < notes.length; i += 1) {
        note = '';
        pitch = notes[i].childNodes[1];
        if (pitch.nodeName === 'rest') {

        } else {
            let pitchChildNodes = pitch.childNodes;
            for (let i = 0; i < pitchChildNodes.length; i++) {
                if (pitchChildNodes[i].nodeName === "step") {
                    step = pitchChildNodes[i].childNodes[0].nodeValue;
                    note += step;
                } else if (pitchChildNodes[i].nodeName === "alter") {
                    alter = pitchChildNodes[i].childNodes[0].nodeValue;
                    if (alter === '1') {
                        note += "#";
                        console.log('#')
                    } else if (alter === '-1')
                        note = prev[note] + "#";
                } else if (pitchChildNodes[i].nodeName === "octave") {
                    octave = pitchChildNodes[i].childNodes[0].nodeValue;
                    note += octave;

                }
            }
            song.push(note);
        }
        duration = notes[i].childNodes[3].childNodes[0].nodeValue;
        // console.log(duration);
    }
    return song;
}

// reads a file from a file input and returns its content
async function readFile(input, osmd, audioPlayer) {
    let file = input.files[0];
    let reader = new FileReader();

    reader.onload = function () {
        console.log("onload");
        $("#loading-indicator").css("visibility", 'hidden');
        loadMusic(reader.result, osmd, audioPlayer).then(
            () => {
                renderPage(osmd,audioPlayer);
            }
        )

    };
    reader.onerror = function () {
        console.log("onerror");
        console.error(reader.error);
        $("#loading-indicator").css("visibility", 'hidden');

    };
    reader.onprogress = function () {
        console.log("onprogress");

        $("#loading-indicator").css("visibility", 'visible');

    }
    // if (file.type.match(textType)) {
    // console.log(file.type.match("vnd.recordare.musicxml"));
    reader.readAsText(file);
}


// renders the score and loads the audio player
async function loadMusic(sheetMusic, osmd, audioPlayer) {
    console.log('loadMusic');
    song = parseMusic(sheetMusic);
    console.log("load music song = ", song);

    $("#loading-indicator").css("visibility", "visible");
    await osmd.load(sheetMusic);
    await osmd.render();

    await audioPlayer.loadScore(osmd);
    $("#loading-indicator").css("visibility", "hidden");
    $("#showCursor").on("click",function () {
        if (osmd.cursor) {
            osmd.cursor.show();
        } else {
            console.log("Can't show cursor, as it was disabled (e.g. by drawingParameters).");
        }
    });
    if (!(localStorage.getItem("hasScore") === 'true')) {
        let songStr = "";
        for (let note of song) {
            songStr += note;
            songStr += " ";
        }
        writeToLocalStorage(sheetMusic, songStr, true);
        console.log('saved to local storage');


    }
    registerButtonEvents(audioPlayer);
    return song;
}

function writeToLocalStorage(sheetMusic, songStr, hasScore) {
    localStorage.setItem('score', sheetMusic);
    localStorage.setItem('song', songStr);
    localStorage.setItem('hasScore', `${hasScore}`);
}

function clearLocalStorage() {
    localStorage.setItem('hasScore', 'false');
    localStorage.setItem('song', '');
    localStorage.setItem('score', '');
}

async function renderPage(osmd, audioPlayer) {
    // console.log("render page");
    if (localStorage.getItem("hasScore") === 'true') {
        $("#init-song").text(localStorage.getItem("song"));
        $("#initialize").css("display", "none");
        $("#navigation").css("display", "inline");
        $("#pages").css("display", "inline");
        $("#change-music-btn").html("Change Sheet Music <i class=\"fas fa-file-alt\"></i>");
        $("#score-btn").css("display","inline");
        await Score.loadMusic(localStorage.getItem("score"), osmd, audioPlayer);
    } else {
        $("#initialize").css("display", "inline");
        $("#navigation").css("display", "none");
        $("#pages").css("display", "none");
    }
}

// returns a list of objects, each containing the note and the time when it starts to be played, in seconds
function getDurations(osmd) {
    var allNotes = []
    const iterator = osmd.cursor.Iterator;
    const bpm = parseInt($("#tempoOutputId").text());
    while (!iterator.EndReached) {
        const voices = iterator.CurrentVoiceEntries;
        const v = voices[0];
        const notes = v.notes;
        for (var j = 0; j < notes.length; j++) {
            const note = notes[j];
            if ((note != null)) {
                allNotes.push({
                    "note": note.halfTone + 12,
                    "time": iterator.CurrentSourceTimestamp.RealValue * 4 * 60 / bpm
                });
            }
        }
        iterator.moveToNext();
    }
    return allNotes;
}

export const Score = {
    parseMusic: parseMusic,
    readFile: readFile,
    loadMusic: loadMusic,
    getDurations:getDurations,
    renderPage: renderPage,
    clearLocalStorage: clearLocalStorage,
    song:song,
}
// export default song;
