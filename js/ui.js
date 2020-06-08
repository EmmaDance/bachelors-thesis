let canvasTime, canvasTimeCtx;
let canvasFrequency, canvasFrequencyCtx;
const WIDTH = 300, HEIGHT = 100;

function correct() {
    $("#correct").css("color", "green");
    $("#up").css("color", "whitesmoke");
    $("#down").css("color", "whitesmoke");
}

function down() {
    $("#correct").css("color", "whitesmoke");
    $("#up").css("color", "darkred");
    $("#down").css("color", "whitesmoke");
}

function up() {
    $("#correct").css("color", "whitesmoke");
    $("#up").css("color", "whitesmoke");
    $("#down").css("color", "darkred");
}

function none() {
    $("#correct").css("color", "whitesmoke");
    $("#up").css("color", "whitesmoke");
    $("#down").css("color", "whitesmoke");
}


function visualize_frequency(dataArray, indexOfMax) {
    canvasFrequencyCtx.fillStyle = 'rgb(255, 255, 255)';
    canvasFrequencyCtx.fillRect(0, 0, WIDTH, HEIGHT);

    let barWidth = (WIDTH / dataArray.length) * 4;
    let barHeight;
    let x = 0;

    for (let i = 0; i < dataArray.length; i++) {
        barHeight = dataArray[i];
        canvasFrequencyCtx.fillStyle = 'rgb(15,31,35)';
        // if (i === indexOfMax) {
        //     canvasFrequencyCtx.fillStyle = 'rgb(255,0,0)';
        //     console.log(i);
        //     canvasFrequencyCtx.fillRect(x, HEIGHT - barHeight / 2, barWidth+10, barHeight / 2);
        // } else
            canvasFrequencyCtx.fillRect(x, HEIGHT - barHeight / 2, barWidth, barHeight / 2);

        x += barWidth + 1;
    }

    // for (var i = 0; i < frequencyArray.length; i++) {
    //     canvasFrequencyCtx.fillStyle = 'red';                             // **
    //     var y = canvasHeight - Math.round(frequencyArray[i]);  // **
    //     canvasFrequencyCtx.fillRect(i, 0, 1, y);                                 // **
    // }

}

function visualize_time(amplitudeArray) {
    console.log("visualize_time");
    canvasTimeCtx.clearRect(0, 0, WIDTH, HEIGHT);
    for (var i = 0; i < amplitudeArray.length; i++) {
        var value = amplitudeArray[i] / 256;
        var y = HEIGHT - (HEIGHT * value) - 1;
        canvasTimeCtx.fillStyle = '#000000';
        canvasTimeCtx.fillRect(i, y, 1, 1);
    }
}

function initVisualizerFrequency() {
    canvasFrequency = document.getElementById('canvas');
    canvasFrequencyCtx = canvasFrequency.getContext('2d');
    canvasFrequencyCtx.clearRect(0, 0, WIDTH, HEIGHT);
}

function initVisualizerFrequencyTrain() {
    canvasFrequency = document.getElementById('canvas-frequency');
    canvasFrequencyCtx = canvasFrequency.getContext('2d');
    canvasFrequencyCtx.clearRect(0, 0, WIDTH, HEIGHT);
}

function initVisualizerTime() {
    initVisualizerFrequencyTrain();
    canvasTime = document.getElementById('canvas-time');
    canvasTimeCtx = canvasTime.getContext('2d');
    canvasTimeCtx.clearRect(0, 0, WIDTH, HEIGHT);
}

export const UI = {
    initVisualizerFrequency: initVisualizerFrequency,
    initVisualizerTime: initVisualizerTime,
    visualize_frequency: visualize_frequency,
    visualize_time: visualize_time,
    correct: correct,
    up: up,
    down: down,
    none: none,
}
