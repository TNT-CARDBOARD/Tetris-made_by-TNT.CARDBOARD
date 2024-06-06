const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');
const nextPieceDiv = document.getElementById('next-piece');
const row = 20;
const col = 10;
const sq = 30;
const vacant = 'WHITE';

let board = [];
for (let r = 0; r < row; r++) {
    board[r] = [];
    for (let c = 0; c < col; c++) {
        board[r][c] = vacant;
    }
}

function drawSquare(x, y, color) {
    context.fillStyle = color;
    context.fillRect(x * sq, y * sq, sq, sq);
    context.strokeStyle = 'BLACK';
    context.strokeRect(x * sq, y * sq, sq, sq);
}

function drawBoard() {
    for (let r = 0; r < row; r++) {
        for (let c = 0; c < col; c++) {
            drawSquare(c, r, board[r][c]);
        }
    }
}

const pieces = [
    [Z, 'red'],
    [S, 'green'],
    [T, 'yellow'],
    [O, 'blue'],
    [L, 'purple'],
    [I, 'cyan'],
    [J, 'orange']
];

let nextPiece = randomPiece();

function randomPiece() {
    let r = randomN = Math.floor(Math.random() * pieces.length)
    return new Piece(pieces[r][0], pieces[r][1]);
}

class Piece {
    constructor(tetromino, color) {
        this.tetromino = tetromino;
        this.color = color;
        this.tetrominoN = 0;
        this.activeTetromino = this.tetromino[this.tetrominoN];
        this.x = 3;
        this.y = -2;
    }

    fill(color) {
        for (let r = 0; r < this.activeTetromino.length; r++) {
            for (let c = 0; c < this.activeTetromino.length; c++) {
                if (this.activeTetromino[r][c]) {
                    drawSquare(this.x + c, this.y + r, color);
                }
            }
        }
    }

    draw() {
        this.fill(this.color);
    }

    undraw() {
        this.fill(vacant);
    }

    moveDown() {
        if (!this.collision(0, 1, this.activeTetromino)) {
            this.undraw();
            this.y++;
            this.draw();
        } else {
            this.lock();
            piece = nextPiece;
            nextPiece = randomPiece();
            displayNextPiece();
        }
    }

    moveRight() {
        if (!this.collision(1, 0, this.activeTetromino)) {
            this.undraw();
            this.x++;
            this.draw();
        }
    }

    moveLeft() {
        if (!this.collision(-1, 0, this.activeTetromino)) {
            this.undraw();
            this.x--;
            this.draw();
        }
    }

    rotate() {
        let nextPattern = this.tetromino[(this.tetrominoN + 1) % this.tetromino.length];
        let kick = 0;

        if (this.collision(0, 0, nextPattern)) {
            if (this.x > col / 2) {
                kick = -1;
            } else {
                kick = 1;
            }
        }

        if (!this.collision(kick, 0, nextPattern)) {
            this.undraw();
            this.x += kick;
            this.tetrominoN = (this.tetrominoN + 1) % this.tetromino.length;
            this.activeTetromino = this.tetromino[this.tetrominoN];
            this.draw();
        }
    }

    collision(x, y, piece) {
        for (let r = 0; r < piece.length; r++) {
            for (let c = 0; c < piece.length; c++) {
                if (!piece[r][c]) {
                    continue;
                }
                let newX = this.x + c + x;
                let newY = this.y + r + y;

                if (newX < 0 || newX >= col || newY >= row) {
                    return true;
                }
                if (newY < 0) {
                    continue;
                }
                if (board[newY][newX] != vacant) {
                    return true;
                }
            }
        }
        return false;
    }

    lock() {
        for (let r = 0; r < this.activeTetromino.length; r++) {
            for (let c = 0; c < this.activeTetromino.length; c++) {
                if (!this.activeTetromino[r][c]) {
                    continue;
                }
                if (this.y + r < 0) {
                    alert("Game Over");
                    gameOver = true;
                    break;
                }
                board[this.y + r][this.x + c] = this.color;
            }
        }

        for (let r = 0; r < row; r++) {
            let isRowFull = true;
            for (let c = 0; c < col; c++) {
                isRowFull = isRowFull && (board[r][c] != vacant);
            }
            if (isRowFull) {
                for (let y = r; y > 1; y--) {
                    for (let c = 0; c < col; c++) {
                        board[y][c] = board[y - 1][c];
                    }
                }
                for (let c = 0; c < col; c++) {
                    board[0][c] = vacant;
                }
                score += 10;
                dropSpeed -= 0.03;
            }
        }
        drawBoard();
        updateScore();
    }
}

document.addEventListener("keydown", CONTROL);

function CONTROL(event) {
    if (event.keyCode == 37) {
        piece.moveLeft();
        dropStart = Date.now();
    } else if (event.keyCode == 38) {
        piece.rotate();
        dropStart = Date.now();
    } else if (event.keyCode == 39) {
        piece.moveRight();
        dropStart = Date.now();
    } else if (event.keyCode == 40) {
        piece.moveDown();
    }
}

let dropStart = Date.now();
let gameOver = false;
let score = 0;
let dropSpeed = 1000;
let piece = nextPiece;
nextPiece = randomPiece();
displayNextPiece();

function drop() {
    let now = Date.now();
    let delta = now - dropStart;
    if (delta > dropSpeed) {
        piece.moveDown();
        dropStart = Date.now();
    }
    if (!gameOver) {
        requestAnimationFrame(drop);
    }
}

function updateScore() {
    document.getElementById('score').innerHTML = score;
}

function displayNextPiece() {
    nextPieceDiv.innerHTML = "";
    nextPiece.tetromino[0].forEach((row, rIndex) => {
        row.forEach((col, cIndex) => {
            if (col) {
                let div = document.createElement('div');
                div.style.width = `${sq}px`;
                div.style.height = `${sq}px`;
                div.style.backgroundColor = nextPiece.color;
                div.style.position = 'absolute';
                div.style.left = `${cIndex * sq}px`;
                div.style.top = `${rIndex * sq}px`;
                nextPieceDiv.appendChild(div);
            }
        });
    });
}

drop();

const Z = [
    [
        [1, 1, 0],
        [0, 1, 1],
        [0, 0, 0]
    ],
    [
        [0, 0, 1],
        [0, 1, 1],
        [0, 1, 0]
    ]
];

const S = [
    [
        [0, 1, 1],
        [1, 1, 0],
        [0, 0, 0]
    ],
    [1, 0, 0],
        [1, 1, 0],
        [0, 1, 0]
    ]
];

const T = [
    [
        [0, 1, 0],
        [1, 1, 1],
        [0, 0, 0]
    ],
    [
        [0, 1, 0],
        [0, 1, 1],
        [0, 1, 0]
    ],
    [
        [0, 0, 0],
        [1, 1, 1],
        [0, 1, 0]
    ],
    [
        [0, 1, 0],
        [1, 1, 0],
        [0, 1, 0]
    ]
];

const O = [
    [
        [1, 1],
        [1, 1]
    ]
];

const L = [
    [
        [0, 0, 1],
        [1, 1, 1],
        [0, 0, 0]
    ],
    [
        [0, 1, 0],
        [0, 1, 0],
        [0, 1, 1]
    ],
    [
        [0, 0, 0],
        [1, 1, 1],
        [1, 0, 0]
    ],
    [
        [1, 1, 0],
        [0, 1, 0],
        [0, 1, 0]
    ]
];

const I = [
    [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ],
    [
        [0, 0, 1, 0],
        [0, 0, 1, 0],
        [0, 0, 1, 0],
        [0, 0, 1, 0]
    ]
];

const J = [
    [
        [1, 0, 0],
        [1, 1, 1],
        [0, 0, 0]
    ],
    [
        [0, 1, 1],
        [0, 1, 0],
        [0, 1, 0]
    ],
    [
        [0, 0, 0],
        [1, 1, 1],
        [0, 0, 1]
    ],
    [
        [0, 1, 0],
        [0, 1, 0],
        [1, 1, 0]
    ]
];