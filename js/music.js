let frequencies = {};
let notes = {};
let noteMap = {};

// Creates two maps
// notes = a map with pairs (frequency, note)
// frequencies = a map with pairs (index, frequency)
export function mapFrequencies(notes, frequencies) {
    const a = Math.pow(2, 1 / 12);
    const note_names = ["A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#"];
    frequencies[57] = 440;
    notes[440] = "A4";
    let k = 58;
    let note = 1;
    for (let i = 4; i < 9;) {
        frequencies[k] = frequencies[k - 1] * a;
        notes[frequencies[k]] = note_names[note] + i.toString();
        k++;
        note++;
        if (note === 3)
            i++;
        if (note === 12)
            note = 0;
    }
    k = 56;
    note = 11;
    for (let i = 4; i >= 0;) {
        frequencies[k] = frequencies[k + 1] / a;
        notes[frequencies[k]] = note_names[note] + i.toString();
        k--;
        note--;
        if (note === 2)
            i--;
        if (note < 0)
            note = 11;
    }

}

// create map of pairs (note, frequency)
export function mapNotes(noteMap, notes) {
    for ( const frequency in notes){
        noteMap[notes[frequency]] = frequency;
    }
}

function init() {
    mapFrequencies(notes, frequencies);
    mapNotes(noteMap, notes);
}

export const Music = {
    frequencies: frequencies,
    noteMap:noteMap,
    notes: notes,
    init:init
}
