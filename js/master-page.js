import {Score} from "./sheet-music";


(function (deferFunctions) {
    for (var setter in deferFunctions) (function (setter, clearer) {
        var ids = [];
        var startFn = window[setter];
        var clearFn = window[clearer];

        function clear(id) {
            var index = ids.indexOf(id);
            if (index !== -1) ids.splice(index, 1);
            return clearFn.apply(window, arguments);
        }

        function set() {
            var id = startFn.apply(window, arguments);
            ids.push(id);
            return id;
        }

        set.clearAll = function () {
            ids.slice(0).forEach(clear);
        };

        if (startFn && clearFn) {
            window[setter] = set;
            window[clearer] = clear;
        }
    })(setter, deferFunctions[setter]);
})(
    {
        setTimeout: 'clearTimeout'
        , setInterval: 'clearInterval'
        , requestAnimationFrame: 'cancelAnimationFrame'
    });

export function startCursorMaster(osmd) {
    window.setInterval.clearAll();
    window.setTimeout.clearAll();

    let allNotes = Score.getDurations(osmd);
    const metronome = document.querySelector('#metronome');
    let playPromise;
    const bpm = parseInt($("#tempoOutputId").text());
    let pause = 60 / bpm * 1000;
    let k = 0;
    let num = 4 // rhythm
    window.setInterval(() => {
        playPromise = metronome.play();
        if (k >= num-1)
            window.setInterval.clearAll();
        k++;
    }, pause);
    window.setTimeout(() => {
        osmd.cursor.reset();
        osmd.cursor.show();
        let i = 1;
        let oldTime = 0;
        let newTime = allNotes[i].time;
        // measure the duration of the notes and move the cursor accordingly
        window.setTimeout(function run() {
            // trigger event
            $(document).trigger("cursor:next");
            osmd.cursor.next();
            if (i >= allNotes.length-1)
                return;
            i++;
            oldTime = allNotes[i - 1].time;
            newTime = allNotes[i].time - oldTime;
            window.setTimeout(run, newTime * 1000 - 30);
        }, newTime * 1000);
    }, pause * (num + 1));
}

export function stopMaster(osmd) {
    window.setTimeout.clearAll();
    window.setInterval.clearAll();
    osmd.cursor.reset();
    osmd.cursor.hide();
    osmd.render();
}
