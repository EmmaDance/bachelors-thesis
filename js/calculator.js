export function binarySearch(frequencies, min, max, errorSize) {
    const err = getErrorSize(max) * errorSize;
    const size = Object.keys(frequencies).length;
    let start = 0, end = size - 1;
    while (start <= end) {
        let mid = Math.floor((start + end) / 2);
        let elem = frequencies[mid];
        if (elem >= min - err && elem <= max + err)
            return elem;
        else if (elem < min) {
            start = mid + 1;
        } else {
            end = mid - 1;
        }
    }
    return "-1";
}

export function getNoteFrequency(frequencies, min, max, errorSize) {
    let frequency = binarySearch(frequencies, min, max, errorSize);
    if (frequency < 0) {
        return getNoteFrequency(frequencies, min, max, errorSize + 1);
    }
    return frequency;
}

function getErrorSize(frequency) {
    return Math.pow(frequency, 1 / 12);

}

export function energy(signal) {
    let energy = 0;
    for (let i = 0; i < signal.length; i++) {
        energy += Math.pow(Math.abs(signal[i]), 2);
    }
    return energy / 1000;
}

function isLocalMaximum(dataArray, x) {
    return dataArray[x]>dataArray[x-1] && dataArray[x]>dataArray[x+1] && dataArray[x]>dataArray[x+2] && dataArray[x]>dataArray[x-2];
    // return dataArray[x] > dataArray[x - 1] && dataArray[x] > dataArray[x + 1];
}

export function getLocalMaxima(dataArray) {
    let maxima = [];
    for (let i = 0; i < dataArray.length; i++) {
        if (isLocalMaximum(dataArray, i)) {
            maxima.push({"index": i, "value": dataArray[i]});
        }
    }
    if (maxima.length === 0)
        console.log("error for ", dataArray);
    return maxima;
}

export function getIndexOfLeftmostMaximum(dataArray) {
    let maxima = getLocalMaxima(dataArray);
    maxima.sort((a, b) => {return b.value - a.value;});
    maxima = maxima.slice(0, 5);
    maxima.sort((a, b) => {return a.index - b.index;})
    for (let i = 0; i < maxima.length - 2; i++) {
        // if two close peaks are found, pick the one with the highest value
        if (maxima[i + 1].index - maxima[i].index < 25) {
            if (maxima[i + 1].value > maxima[i].value)
                maxima[i].index = Infinity;
            else
                maxima[i + 1].index = Infinity;
        }
    }
    maxima.sort((a, b) => {
        return a.index - b.index;
    })
    return maxima[0] && maxima[0].index;
}



