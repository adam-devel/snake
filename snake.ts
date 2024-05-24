import readline from "readline";
import ansiEscape from "ansi-escapes"
import ansiColors from "ansi-colors"

const { stdin, stdout } = process;
const [terminalWidth, terminalHeight] = stdout.getWindowSize();

type Vec = [x: number, y: number];
enum Direction {
  Up = "up",
  Down = "down",
  Left = "left",
  Right = "right",
}

// Game Initialization
const snake: Vec[] = [getRandomPosition()]
let currentDirection: Direction = Direction.Left;
let foodPosition: Vec = getRandomPosition();
let ticksPerSecond = 12;

// Game Controls
let directionsQueue: Direction[] = [];
let overwriteQueue = false;
readline.emitKeypressEvents(process.stdin);
stdin.setRawMode(true);

stdin.on('keypress', (_, key) => {
  if (overwriteQueue) {
    overwriteQueue = false;
    directionsQueue = [];
  }
  switch (key.name) {
    // Directions
    case 'w': case 'W': case 'up': case 'k':
      directionsQueue.push(Direction.Up);
      break;
    case 's': case 'S': case 'down': case 'j':
      directionsQueue.push(Direction.Down);
      break;
    case 'd': case 'D': case 'right': case 'l':
      directionsQueue.push(Direction.Right);
      break;
    case 'a': case 'A': case 'left': case 'h':
      directionsQueue.push(Direction.Left);
      break;
    // Increase/decrease game speed
    case ']': case 'x': ticksPerSecond++; break;
    case '[': case 'z': ticksPerSecond--; break;
    // Quit
    case 'q': process.exit();
  }
  renderAndDrawFrame()
});

// Initialize the terminal and start the game loop
stdout.write(ansiEscape.cursorHide);
loop();

function loop() {
  setTimeout(() => {
    // process directions queue
    while (directionsQueue.length > 0) {
      const direction = directionsQueue.shift()!;
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
    } else {
      const head = snake[snake.length - 1];
      snake.push(move(head, currentDirection, terminalWidth, terminalHeight));
      snake.shift();
    }
    renderAndDrawFrame();
    loop();
  }, Math.round(1000 / ticksPerSecond));
}

// Utils
function getRandomPosition(): Vec {
  const x = Math.round(terminalWidth / 4 + Math.random() * terminalWidth / 2);
  const y = Math.round(terminalHeight / 4 + Math.random() * terminalHeight / 2);
  return [x, y];
}

function isOnFood(position: Vec, foodPosition: Vec) {
  return position[0] === foodPosition[0] && position[1] === foodPosition[1];
}

function isOppositeDirection(d1: Direction, d2: Direction) {
  return ((d1 === Direction.Left && d2 === Direction.Right)
    || (d1 === Direction.Right && d2 === Direction.Left)
    || (d1 === Direction.Up && d2 === Direction.Down)
    || (d1 === Direction.Down && d2 === Direction.Up)
  )
}

function renderAndDrawFrame() {
  let frame = "";
  frame += ansiEscape.clearScreen;

  // snake body
  for (const [x, y] of snake.slice(0, -1)) {
    frame += ansiEscape.cursorTo(x, y);
    frame += ansiColors.bgYellow(' ');
  }

  // food
  frame += ansiEscape.cursorTo(...foodPosition);
  frame += ansiColors.redBright("@");

  // snake head
  frame += ansiEscape.cursorTo(...snake[snake.length - 1]);
  frame += ansiColors.bgYellow.black(drawHead(directionsQueue.at(-1)||currentDirection));

  // debug infos
  frame += ansiEscape.cursorTo(0, 0);
  frame += ansiEscape.eraseLine;
  frame += ansiColors.bgRed(`Head at (${snake.at(-1)})\n`);
  frame += ansiColors.bgRed(`Food at (${foodPosition})\n`);
  frame += ansiColors.bgRed(`Current Direction: ${currentDirection}\n`);
  frame += ansiColors.bgRed(`Queued Directions: ${directionsQueue}\n`);
  frame += ansiColors.bgRed(`Game speed: ${ticksPerSecond} ticks per second`);
  process.stdout.write(frame);
}

// Moves a cell along a direction, taking into account a bounding box
function move([x, y]: Vec, direction: Direction, boundW: number, boundH: number): Vec {
  let newX = x;
  let newY = y;
  switch (direction) {
    case Direction.Left: newX = (x - 1 + boundW) % boundW; break;
    case Direction.Right: newX = (x + 1) % boundW; break;
    case Direction.Up: newY = (y - 1 + boundH) % boundH; break;
    case Direction.Down: newY = (y + 1) % boundH; break;
    default: throw Error(`Unrecognizeable direction: ${direction}.`);
  }
  return [newX, newY];
}


// Moves a cell along a direction, taking into account a bounding box
function drawHead(direction: Direction) {
  switch (direction) {
    case Direction.Left: return '<'; break;
    case Direction.Right: return '>'; break;
    case Direction.Up: return '^'; break;
    case Direction.Down: return 'v'; break;
    default: throw Error(`Unrecognizeable direction: ${direction}.`);
  }
}
