import {Score} from "./sheet-music";
import {Ajax} from "./service-utils";

let canvasTime, canvasTimeCtx;
let canvasFrequency, canvasFrequencyCtx;
const WIDTH = 300, HEIGHT = 100;

function correct() {
    $(".correct").css("color", "green");
    $(".up").css("color", "whitesmoke");
    $(".down").css("color", "whitesmoke");
}

function down() {
    $(".correct").css("color", "whitesmoke");
    $(".up").css("color", "darkred");
    $(".down").css("color", "whitesmoke");
}

function up() {
    $(".correct").css("color", "whitesmoke");
    $(".up").css("color", "whitesmoke");
    $(".down").css("color", "darkred");
}

function none() {
    $(".correct").css("color", "whitesmoke");
    $(".up").css("color", "whitesmoke");
    $(".down").css("color", "whitesmoke");
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
        canvasFrequencyCtx.fillRect(x, HEIGHT - barHeight / 2, barWidth, barHeight / 2);
        x += barWidth + 1;
    }
}

function visualize_time(amplitudeArray) {
    canvasTimeCtx.clearRect(0, 0, WIDTH, HEIGHT);
    for (var i = 0; i < amplitudeArray.length; i++) {
        var value = amplitudeArray[i] / 256;
        var y = HEIGHT - (HEIGHT * value) - 1;
        canvasTimeCtx.fillStyle = '#000000';
        canvasTimeCtx.fillRect(i, y, 1, 1);
    }
}

function initVisualizerFrequency(canvasId) {
    canvasFrequency = document.getElementById(canvasId);
    canvasFrequencyCtx = canvasFrequency.getContext('2d');
    canvasFrequencyCtx.clearRect(0, 0, WIDTH, HEIGHT);
}

function initVisualizerTime() {
    initVisualizerFrequency('canvas-train');
    canvasTime = document.getElementById('canvas-time');
    canvasTimeCtx = canvasTime.getContext('2d');
    canvasTimeCtx.clearRect(0, 0, WIDTH, HEIGHT);
}

function initButtons(osmd, audioPlayer) {
    $("#change-music-btn").on("click", async function () {
        $("#page-train").css("display", "none");
        Score.clearLocalStorage();
        await Score.renderPage(osmd, audioPlayer);
        // reset();
    });

    $("#upload-btn").on("click", async function () {
        const file = document.getElementById('file-input');
        await Score.readFile(file, osmd, audioPlayer).then(() => {
            $("#page-train").css("display","none");
            $("#score-btn").css("display", "inline");
            $("#change-music-btn").html("Change Sheet Music <i class=\"fas fa-file-alt\"></i>");
        });
    });

    $('#get-sample').click(async function () {
        let score = await Ajax.getScore();
        $("#loading-indicator").css("visibility", 'hidden');
        await Score.loadMusic(score, osmd, audioPlayer);
        await Score.renderPage(osmd, audioPlayer);
        $("#score-btn").css("display", "inline");
        $("#change-music-btn").text("Change Sheet Music");
    });

    $("#train-btn").on("click", async function () {
        $("#page-train").css("display", "flex");
        $("#initialize").css("display", "none");
        $("#navigation").css("display", "none");
        $("#pages").css("display", "none");
    });

    $("#score-btn").on("click", async function () {
        $("#page-train").css("display", "none");
        $("#initialize").css("display", "none");
        $("#navigation").css("display", "inline");
        $("#pages").css("display", "inline");
    });

}

export const UI = {
    initButtons: initButtons,
    initVisualizerFrequency: initVisualizerFrequency,
    initVisualizerTime: initVisualizerTime,
    visualize_frequency: visualize_frequency,
    visualize_time: visualize_time,
    correct: correct,
    up: up,
    down: down,
    none: none,
}
