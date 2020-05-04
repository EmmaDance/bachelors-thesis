// const fs = require('fs');
//
// export function readSong() {
//     let notes = [];
//     let prev = {"A":"G", "B":"A","C":"B","D":"C","E":"D","F":"E","G":"F",};
//     fs.readFile('song.txt', 'utf-8', (err, data) => {
//         if (err) throw err;
//         const alterations = data[0].split(" ");
//         notes = data[1].split(" ");
//             for (let note of notes){
//                 if (note in alterations){
//                     note = prev[note] + "#";
//                 }
//             }
//     });
//     return notes;
// }
//

