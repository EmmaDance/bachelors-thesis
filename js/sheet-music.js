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


