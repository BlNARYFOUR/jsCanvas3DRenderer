"use strict";

const VIEWPORT_WIDTH = 4000;

let CAMERA_POINT = new Point3D(0, 0, 0);
const FOCUS_POINT = 2000;

let VIEWPORT_MIN_X = -2000;
let VIEWPORT_MAX_X = 2000;
let VIEWPORT_MIN_Y = -2000;
let VIEWPORT_MAX_Y = 2000;

let VIEWPORT_RESOLUTION_WIDTH = 1920;
let VIEWPORT_RESOLUTION_HEIGHT = 1080;

const STEP = 25;

let model = [];

let canvas;
let ctx;

document.addEventListener("DOMContentLoaded", init);

function init(e) {
    e.preventDefault();

    resize();
    genCube();
    frame();

    window.addEventListener("resize", resize);
}

function frame() {
    ctx.clearRect(0, 0, VIEWPORT_MAX_X, VIEWPORT_MAX_Y);

    render(model, new Point3D(0, 0, 0));

    requestAnimationFrame(frame);
}

function resize(e) {
    canvas = document.getElementById("myCanvas");
    ctx = canvas.getContext("2d");

    VIEWPORT_RESOLUTION_HEIGHT = document.documentElement.clientHeight;
    VIEWPORT_RESOLUTION_WIDTH = document.documentElement.clientWidth;

    canvas.height = VIEWPORT_RESOLUTION_HEIGHT;
    canvas.width = VIEWPORT_RESOLUTION_WIDTH;

    calibrateViewport();
}

function calibrateViewport() {
    VIEWPORT_MIN_X = CAMERA_POINT.x - VIEWPORT_WIDTH / 2;
    VIEWPORT_MAX_X = CAMERA_POINT.x + VIEWPORT_WIDTH / 2;

    const PXL = VIEWPORT_RESOLUTION_WIDTH / (VIEWPORT_MAX_X - VIEWPORT_MIN_X);

    VIEWPORT_MIN_Y = CAMERA_POINT.y - (VIEWPORT_RESOLUTION_HEIGHT / PXL) / 2;
    VIEWPORT_MAX_Y = CAMERA_POINT.y + (VIEWPORT_RESOLUTION_HEIGHT / PXL) / 2;
}

function Point2D(x, y) {
    this.x = x;
    this.y = y;
}
function Point3D(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
}

function genCube() {
    for(let x=-500; x<=500; x+=STEP) {
        for(let y=-500; y<=500; y+=STEP) {
            for(let z=-500; z<=500; z+=STEP) {
                model.push(new Point3D(x, y, z));
            }
        }
    }
}

function projectPoint3Dto2D(point) {
    const X = FOCUS_POINT * (point.x - CAMERA_POINT.x) / (FOCUS_POINT + point.z - CAMERA_POINT.z) + CAMERA_POINT.x;
    const Y = FOCUS_POINT * (point.y - CAMERA_POINT.y) / (FOCUS_POINT + point.z - CAMERA_POINT.z) + CAMERA_POINT.y;

    return new Point2D(X, Y);
}

function translateToCanvas(point) {
    const PIXEL_X = (point.x - VIEWPORT_MIN_X) * VIEWPORT_RESOLUTION_WIDTH / (VIEWPORT_MAX_X - VIEWPORT_MIN_X);
    const PIXEL_Y = VIEWPORT_RESOLUTION_HEIGHT - (point.y - VIEWPORT_MIN_Y) * VIEWPORT_RESOLUTION_HEIGHT / (VIEWPORT_MAX_Y - VIEWPORT_MIN_Y);

    return new Point2D(PIXEL_X, PIXEL_Y);
}

function renderPoint(point) {
    //console.log("renderPoint");

    const PROJECTED_POINT = projectPoint3Dto2D(point);
    const TRANSLATED_POINT = translateToCanvas(PROJECTED_POINT);

    ctx.beginPath();
    ctx.moveTo(TRANSLATED_POINT.x, TRANSLATED_POINT.y);
    ctx.lineTo(TRANSLATED_POINT.x + 1, TRANSLATED_POINT.y + 1);
    ctx.lineWidth = 1;
    ctx.strokeStyle = "white";
    ctx.stroke();
}

function render(model, coordinates) {
    model.forEach(point => {
        point = new Point3D(point.x + coordinates.x, point.y + coordinates.y, point.z + coordinates.z);
        renderPoint(point);
    });
}