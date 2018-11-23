"use strict";

// camera
let CAMERA_POINT = new Point3D(0, 0, -500);
const FOCUS_POINT = 2000;

// viewport
const VIEWPORT_WIDTH = 4000;

let VIEWPORT_MIN_X = -2000;
let VIEWPORT_MAX_X = 2000;
let VIEWPORT_MIN_Y = -2000;
let VIEWPORT_MAX_Y = 2000;

let VIEWPORT_RESOLUTION_WIDTH = 1920;
let VIEWPORT_RESOLUTION_HEIGHT = 1080;

// model
const STEP = 1000/(20 - 1);
let model = [];

//rotate
let THETA_X = 0;
let THETA_Y = 0;
let THETA_Z = 0;
let DTHETA_X = 0.00;
let DTHETA_Y = 0.00;
let DTHETA_Z = 0.00;

// canvas
let canvas;
let ctx;

const KEYS = {
    KeyW: goForward,
    KeyS: goBackwards,
    KeyQ: rotateZMin,
    KeyE: rotateZPlus,
    KeyA: rotateYMin,
    keyD: rotateYPlus,
    KeyZ: rotateXMin,
    KeyC: rotateXPlus,
    ArrowUp: goUp,
    ArrowDown: goDown,
    ArrowLeft: goLeft,
    ArrowRight: goRight,
};

document.addEventListener("DOMContentLoaded", init);

function init(e) {
    e.preventDefault();

    resize();
    genCube();
    frame();

    window.addEventListener("resize", resize);
    document.addEventListener("keydown", onKeyDown);
}

function onKeyDown(e) {
    console.log(e.code);
    try {
        KEYS[e.code]();
    } catch(e) {
        console.log("Unknown key.");
    }
}

function frame() {
    ctx.clearRect(0, 0, VIEWPORT_MAX_X, VIEWPORT_MAX_Y);

    //let rotated = rotateModelX(model, THETA_X);
    //rotated = rotateModelY(rotated, THETA_Y);
    //rotated = rotateModelZ(rotated, THETA_Z);

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
    const X = FOCUS_POINT * (point.x - CAMERA_POINT.x) / (FOCUS_POINT + point.z - CAMERA_POINT.z);
    const Y = FOCUS_POINT * (point.y - CAMERA_POINT.y) / (FOCUS_POINT + point.z - CAMERA_POINT.z);

    return new Point2D(X, Y);
}

function translateToCanvas(point) {
    const PIXEL_X = (point.x - VIEWPORT_MIN_X) * VIEWPORT_RESOLUTION_WIDTH / (VIEWPORT_MAX_X - VIEWPORT_MIN_X);
    const PIXEL_Y = VIEWPORT_RESOLUTION_HEIGHT - (point.y - VIEWPORT_MIN_Y) * VIEWPORT_RESOLUTION_HEIGHT / (VIEWPORT_MAX_Y - VIEWPORT_MIN_Y);

    return new Point2D(PIXEL_X, PIXEL_Y);
}

function rotatePointY(point, theta) {
    const X = Math.cos(theta) * point.x - Math.sin(theta) * point.z;
    const Y = point.y;
    const Z = Math.sin(theta) * point.x + Math.cos(theta) * point.z;

    return new Point3D(X, Y, Z);
}

function rotatePointX(point, theta) {
    const X = point.x;
    const Y = Math.sin(theta) * point.z + Math.cos(theta) * point.y;
    const Z = Math.cos(theta) * point.z - Math.sin(theta) * point.y;

    return new Point3D(X, Y, Z);
}

function rotatePointZ(point, theta) {
    const X = Math.sin(theta) * point.y + Math.cos(theta) * point.x;
    const Y = Math.cos(theta) * point.y - Math.sin(theta) * point.x;
    const Z = point.z;

    return new Point3D(X, Y, Z);
}

function rotateModelY(model, theta) {
    let rotatedModel = [];

    model.forEach(point => {
        rotatedModel.push(rotatePointY(point, theta));
    });

    return rotatedModel;
}

function rotateModelX(model, theta) {
    let rotatedModel = [];

    model.forEach(point => {
        rotatedModel.push(rotatePointX(point, theta));
    });

    return rotatedModel;
}

function rotateModelZ(model, theta) {
    let rotatedModel = [];

    model.forEach(point => {
        rotatedModel.push(rotatePointZ(point, theta));
    });

    return rotatedModel;
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

function goForward() {
    CAMERA_POINT.z += 10;
}

function goBackwards() {
    CAMERA_POINT.z -= 10;
}

function rotateZMin() {
    THETA_Z -= DTHETA_Z;
}

function rotateZPlus() {
    THETA_Z += DTHETA_Z;
}

function rotateYMin() {
    THETA_Y -= DTHETA_Y;
}

function rotateYPlus() {
    THETA_Y += DTHETA_Y;
}

function rotateXMin() {
    THETA_X -= DTHETA_X;
}

function rotateXPlus() {
    THETA_X += DTHETA_X;
}

function goUp() {
    CAMERA_POINT.y += 10;
}

function goDown() {
    CAMERA_POINT.y -= 10;
}

function goLeft() {
    CAMERA_POINT.x -= 10;
}

function goRight() {
    CAMERA_POINT.x += 10;
}
