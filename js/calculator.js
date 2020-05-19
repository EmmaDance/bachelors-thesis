export function binarySearch(frequencies, min, max) {
    const err = (max-min)*0.2;
    const size = Object.keys(frequencies).length;
    let start = 0, end = size - 1;
    while (start <= end) {
        let mid = Math.floor((start + end) / 2);
        let elem = frequencies[mid];
        if (elem >= min-err && elem <= max+err)
            return elem;
        else if (elem < min) {
            start = mid + 1;
        } else {
            end = mid - 1;
        }
    }
    return "1";
}

export function energy(signal) {
    let energy = 0;
    for (let i = 0; i < signal.length; i++) {
        energy += Math.pow(Math.abs(signal[i]), 2);
    }

    return energy / 1000;
}


function zcr(signal) {
    let sum = 0;
    for (let i = 0; i < signal.length; i++) {
        sum += parseInt(signal[i], 10); //don't forget to add the base
    }

    let avg = sum / signal.length;
    // console.log("AVG = ", avg);
    let zcr = 0;
    let zero = avg;
    for (let i = 1; i < signal.length; i++) {
        if ((signal[i - 1] >= zero && signal[i] < zero) ||
            (signal[i - 1] < zero && signal[i] >= zero)) {
            zcr++;
        }
    }
    return zcr;
}


export function getMaxAndIndex(data) {
    let max, k = 0;
    max = data[0] > data[1] ? data[0] : data[1];
    for (let i = 2; i < data.length; i++) {
        let val = data[i];
        if (val > max) {
            max = val;
            k = i;
        }
    }
    return {"index": k, "value": data[k]};
}

export function getNMax(data, n) {
    let spikes = [];
    for (let i = 0; i < n; i++) {
        let res = getMaxAndIndex(data);
        let idx = res.index;
        data[idx] = -Infinity;
        spikes.push(idx);
    }
    return spikes;
}

// gets the lowest index from the first n maximum points
export function getIndexOfMax(data) {
    let spikes = getNMax(data, 4);
    spikes.sort();
    // console.log("getIndexOfMax: ", spikes[0]);
    return spikes[0];
}

// Get the highest 2 spikes and return the lowest one
function getIndexOfMax2(data) {
    let max, smax, k1 = 0, k2 = 0;
    max = data[0] > data[1] ? data[0] : data[1];
    smax = data[0] > data[1] ? data[1] : data[0];
    for (let i = 2; i < data.length; i++) {
        let val = data[i];
        if (val > max) {
            const tmp = max;
            max = val;
            smax = tmp;
            k2 = k1;
            k1 = i;

        } else if (val > smax) {
            smax = val;
            k2 = i;
        }
    }
    return k1 > k2 ? k2 : k1;
}

function lower(note1, note2) {
    const value = {
        "C":1,
        "D":2,
        "E":3,
        "F":4,
        "G":5,
        "A":6,
        "B":7,
    }
    if(!(note1 && note2))
        return 0;
    const octave1=note1[note1.length-1];
    const octave2=note2[note2.length-1];
    if (octave1 < octave2)
        return 1;
    if (octave2<octave1)
        return -1;
    if (value[note1[0]] < value[note2[0]])
        return 1;
    if (value[note2[0]] < value[note1[0]])
        return -1;
    // if note 2 has a sharp in it, it is higher
    if  (note2.length>note1.length)
        return 1;
    return -1;
}

