export function getSong() {
    let notes = "C4 C4 D4 C4 F4 E4 C4 C4 D4 C4 G4 F4 C4 C4 C5 A4 F4 E4 D4 B4 B4 A4 F4 G4 F4";
    let newNotes = [];
    let prev = {"A": "G", "B": "A", "C": "B", "D": "C", "E": "D", "F": "E", "G": "F",};
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
    return newNotes;
}

export function parseMusic(sheetMusic) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(sheetMusic, "text/xml");
    let song = [];
    let notes = xmlDoc.getElementsByTagName("note");
    let note, pitch, step, octave, duration;
    for (let i = 0; i < notes.length; i += 1) {
        note='';
        pitch = notes[i].childNodes[1];
        if (pitch.nodeName === 'rest') {
        } else {
            step = pitch.childNodes[1].childNodes[0].nodeValue;
            octave = pitch.childNodes[3].childNodes[0].nodeValue;
            note += step;
            note += octave;
            // console.log(note);
            song.push(note);
        }
        duration = notes[i].childNodes[3].childNodes[0].nodeValue;
        // console.log(duration);
    }
    return song;
}

// export function getScore(){
//     const url = 'localhost:3000/music/score/sample';
//     let score;
//     $.get(url,function(data,status){
//        console.log(data);
//        score = data;
//     });
//     return score;
// }
