let canvas, canvasCtx;
const WIDTH = 300, HEIGHT = 100;
 function correct() {
    $("#correct").css("color", "green");
    $("#up").css("color", "whitesmoke");
    $("#down").css("color", "whitesmoke");
}

 function up() {
    $("#correct").css("color", "whitesmoke");
    $("#up").css("color", "darkred");
    $("#down").css("color", "whitesmoke");
}

 function down() {
    $("#correct").css("color", "whitesmoke");
    $("#up").css("color", "whitesmoke");
    $("#down").css("color", "darkred");
}

function none() {
    $("#correct").css("color", "whitesmoke");
    $("#up").css("color", "whitesmoke");
    $("#down").css("color", "whitesmoke");
}

 function visualize(dataArray, bufferLength){
    canvasCtx.fillStyle = 'rgb(255, 255, 255)';
    canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

    let barWidth = (WIDTH / bufferLength) * 4;
    let barHeight;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i];

        canvasCtx.fillStyle = 'rgb(15,31,35)';
        canvasCtx.fillRect(x, HEIGHT - barHeight / 2, barWidth, barHeight / 2);

        x += barWidth + 1;
    }
}

 function initVisualizer(){
     canvas = document.getElementById('canvas');
     canvasCtx = canvas.getContext('2d');
    canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
}

export const UI = {
    initVisualizer:initVisualizer,
    visualize:visualize,
    correct:correct,
    up:up,
    down:down,
    none:none,
}
