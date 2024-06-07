#!/usr/bin/env node
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import readline from "readline";
import ansiEscape from "ansi-escapes";
import ansiColors from "ansi-colors";
const { stdin, stdout } = process;
const [terminalWidth, terminalHeight] = stdout.getWindowSize();
var Direction;
(function (Direction) {
    Direction["Up"] = "up";
    Direction["Down"] = "down";
    Direction["Left"] = "left";
    Direction["Right"] = "right";
})(Direction || (Direction = {}));
// Game Initialization
const theme = {
    board: ansiColors.dim.white,
    boardChar: "\u00B7",
    body: ansiColors.white,
    bodyChar: "\u2588",
    head: ansiColors.bgWhite.black,
    foodColor: ansiColors.redBright.bold,
    foodChar: "@",
    information: ansiColors.bgYellowBright.black,
};
const offesetY = Math.floor(terminalHeight / 2);
const snake = [[0, offesetY], [1, offesetY], [2, offesetY]];
let currentDirection = Direction.Right;
let foodPosition = getRandomPosition();
let ticksPerSecond = 9;
// Game Controls
let directionsQueue = [];
let overwriteQueue = false;
stdin.setRawMode(true);
readline.emitKeypressEvents(process.stdin);
stdin.on("keypress", (_, key) => {
    if (overwriteQueue) {
        overwriteQueue = false;
        directionsQueue = [];
    }
    switch (key.name) {
        // Directions
        case "w":
        case "W":
        case "up":
        case "k":
            directionsQueue.push(Direction.Up);
            break;
        case "s":
        case "S":
        case "down":
        case "j":
            directionsQueue.push(Direction.Down);
            break;
        case "d":
        case "D":
        case "right":
        case "l":
            directionsQueue.push(Direction.Right);
            break;
        case "a":
        case "A":
        case "left":
        case "h":
            directionsQueue.push(Direction.Left);
            break;
        // Increase/decrease game speed
        case "]":
        case "x":
            ticksPerSecond++;
            break;
        case "[":
        case "z":
            ticksPerSecond--;
            break;
        // Quit
        case "q":
            stdout.write(ansiEscape.cursorShow + ansiEscape.exitAlternativeScreen + "\n", () => {
                process.exit();
            });
    }
    //renderAndDrawFrame();
});
// Initialize the terminal and start the game loop
stdout.write(ansiEscape.enterAlternativeScreen + ansiEscape.cursorHide + "\n", () => {
    loop();
});
function loop() {
    setTimeout(() => __awaiter(this, void 0, void 0, function* () {
        // process directions queue
        while (directionsQueue.length > 0) {
            const direction = directionsQueue.shift();
            if (!isOppositeDirection(direction, currentDirection)) {
                currentDirection = direction;
                overwriteQueue = true;
                break;
            }
        }
        // are we on food ?
        if (isOnFood(snake[snake.length - 1], foodPosition)) {
            foodPosition = getRandomPosition();
            snake.push(move(snake[snake.length - 1], currentDirection, terminalWidth, terminalHeight));
        }
        else {
            const head = snake[snake.length - 1];
            snake.push(move(head, currentDirection, terminalWidth, terminalHeight));
            snake.shift();
        }
        yield renderAndDrawFrame();
        loop();
    }), Math.round(1000 / ticksPerSecond));
}
// Utils
function getRandomPosition() {
    const x = Math.round(terminalWidth / 4 + Math.random() * terminalWidth / 2);
    const y = Math.round(terminalHeight / 4 + Math.random() * terminalHeight / 2);
    return [x, y];
}
function isOnFood(position, foodPosition) {
    return position[0] === foodPosition[0] && position[1] === foodPosition[1];
}
function isOppositeDirection(d1, d2) {
    return ((d1 === Direction.Left && d2 === Direction.Right) ||
        (d1 === Direction.Right && d2 === Direction.Left) ||
        (d1 === Direction.Up && d2 === Direction.Down) ||
        (d1 === Direction.Down && d2 === Direction.Up));
}
function renderAndDrawFrame() {
    return __awaiter(this, void 0, void 0, function* () {
        let frame = "";
        frame += ansiEscape.eraseScreen;
        // board
        frame += theme.board("\u00B7 ".repeat(terminalWidth / 2 * terminalHeight));
        // snake body
        for (const [x, y] of snake.slice(0, -1)) {
            frame += ansiEscape.cursorTo(x, y);
            frame += theme.body("\u2588");
        }
        // food
        frame += ansiEscape.cursorTo(...foodPosition);
        frame += theme.foodColor(theme.foodChar);
        // snake head
        frame += ansiEscape.cursorTo(...snake[snake.length - 1]);
        frame += theme.head(drawHead(directionsQueue.at(-1) || currentDirection));
        // debug infos
        //frame += ansiEscape.cursorTo(0, 0);
        //frame += theme.information(`Head at (${snake.at(-1)})\n`);
        //frame += theme.information(`Food at (${foodPosition})\n`);
        //frame += theme.information(`Current Direction: ${currentDirection}\n`);
        //frame += theme.information(`Queued Directions: ${directionsQueue}\n`);
        //frame += theme.information(`Game speed: ${ticksPerSecond} ticks per second`);
        // the appended newline is to work around line buffering
        yield new Promise((suc, rej) => {
            process.stdout.write(frame + ansiEscape.cursorTo(0, 0), suc);
        });
    });
}
// Moves a cell along a direction, taking into account a bounding box
function move([x, y], direction, boundW, boundH) {
    let newX = x;
    let newY = y;
    switch (direction) {
        case Direction.Left:
            newX = (x - 1 + boundW) % boundW;
            break;
        case Direction.Right:
            newX = (x + 1) % boundW;
            break;
        case Direction.Up:
            newY = (y - 1 + boundH) % boundH;
            break;
        case Direction.Down:
            newY = (y + 1) % boundH;
            break;
        default:
            throw Error(`Unrecognizeable direction: ${direction}.`);
    }
    return [newX, newY];
}
// Moves a cell along a direction, taking into account a bounding box
function drawHead(direction) {
    switch (direction) {
        //case Direction.Left:
        //  return "\uD83E\uDF6E";
        //case Direction.Right:
        //  return "\uD83E\uDF6C";
        //case Direction.Up:
        //  return "\uD83E\uDF6F";
        //case Direction.Down:
        //  return "\uD83E\uDF6D";
        case Direction.Left:
            return "<";
        case Direction.Right:
            return ">";
        case Direction.Up:
            return "^";
        case Direction.Down:
            return "v";
        default:
            throw Error(`Unrecognizeable direction: ${direction}.`);
    }
}
// TDOD: Canvas
// The canvas is a convinient intermediary format Its use greately improves
// performance by offloading rendering logic to the program instead of going
// through a translation layer (escape sequences) and taxing the terminal with
// interpreting it
//
// Challenges: a single character on a the terminal screen may be the result of
// several characters, such as ansii sequences changing the color of the character.
// One could store characters in an intermediate data structure that stores the
// Character and attributes such as color and weight, but that's yet another layer
// of indirection: program -> intermediate buffer -> actual buffer -> terminal screen.
// I rather use functions to write directly into the final buffer.
// of indirection: program -> actual buffer -> terminal screen.
//
// Approach/Paradigm:
// There's a is a single instance of the canvas used for a single purpose in this program.
// this makes the extra structure for wrapping the code in a class, useless.
// A procedural approach would make sense here.
//const canvas: Uint16Array = new Uint16Array(terminalWidth * terminalHeight);
//
//function canvas_set(x: number, y: number, char: string) {
//  canvas[y * terminalWidth + x] = char.charCodeAt(0);
//}
//
//function canvas_fill(char:string) {
//}
