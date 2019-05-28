const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');



context.scale(20, 20);

//pieces disappear when you form a full line

function arenaSweep (){
    let rowCount = 1;
    outer: for( let y = arena.length - 1; y > 0; --y){
        for(let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x] === 0) {
                continue outer;
            }
        }

        const row = arena.splice(y, 1)[0].fill(0); //takes the row out
        arena.unshift(row);
        ++y;

        player.score += rowCount * 10;
        rowCount *= 2;
    }
}



function collide(arena, player) {
    const [m, o] = [player.matrix, player.pos];
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x){
            if (m[y][x] !== 0 &&
                (arena [y + o.y] &&
                arena[y + o.y] [x + o.x]) !== 0) {
                    return true;
                }
        }
    }
    return false;
}

function createMatrix (w, h) {
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}

//tetris pieces

function createPiece(type) {
    if (type === 'T') {
        return [
            [0, 0, 0],
            [1, 1, 1],
            [0, 1, 0],
        
        ];

    } else  if (type === 'O') {
        return [
            [2, 2],
            [2, 2]
                   
        ];
    } else if(type === 'L') {
        return [
            [0, 3, 0],
            [0, 3, 0],
            [0, 3, 3],
        
        ];
        } else if(type === 'J') {
            return [
                [0, 4, 0],
                [0, 4, 0],
                [0, 4, 0],
            
            ];
        } else if(type === 'I') {
            return [
                [0, 5, 0, 0],
                [0, 5, 0, 0],
                [0, 5, 0, 0]
                [0, 5, 0, 0],
            
            ];
        } else if(type === 'S') {
            return [
                [0, 6, 6],
                [6, 6, 0],
                [0, 0, 0],
            
            ]
        } else if(type === 'Z') {
            return [
                [7, 7, 0],
                [0, 7, 7],
                [0, 0, 0],
            
            ];
    } 
}

function draw() {
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.width, canvas.height);

    drawMatrix(arena, {x: 0, y: 0});
    drawMatrix(player.matrix, player.pos);
}

function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = colors[value];
                context.fillRect(x + offset.x,
                                 y + offset.y,
                                 1, 1);
            }
        });
    });
}

function merge(arena, player) {
    player.matrix.forEach((row,y) => {
        row.forEach((value, x) => {
            if(value !== 0) {
                arena[y + player.pos.y] [x + player.pos.x] = value;
            }
        });
    });
}

//Rotate Piece
function rotate(matrix, dir) {
    for(let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [
                matrix[x][y],
                matrix[y][x],
            ] = [
                    matrix[y][x],
                    matrix[x][y],
                ];       
            
        }

    }

    if (dir > 0) {
        matrix.forEach(row => row.reverse());
    } else {
        matrix.reverse();
    }
    
}

//Player functions
function playerDrop() {
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        playerReset();
        arenaSweep ();
        updateScore();
    }
    dropCounter = 0;
}

function playerMove(dir) {
    player.pos.x += dir;
    if(collide(arena, player)) {
        player.pos.x -= dir; 
    };
}

//Randomize the Tetris Pieces
function playerReset() {
    const pieces = 'ILJOTSZ';
    player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
    player.pos.y = 0;
    player.pos.x =(arena[0].length / 2 | 0) - 
                  (player.matrix[0].length / 2 | 0);
    if (collide(arena, player)) {
        arena.forEach(row => row.fill(0));
        player.score = 0;
        updateScore();
    }
}

function playerRotate(dir) {
    const pos = player.pos.x; // Store players X position before rotation.
    let offset = 1; // Assign an offset to use for later.
    rotate(player.matrix, dir); // Perform the actual matrix rotation.
    
    // If there is a collision immediately after rotate, the rotation was illegal.
    // But we allow rotation if the piece can fit when moved out from wall.
    while (collide(arena, player)) { 
        // Thus we try and move the piece left/right until it no longer collides, 
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1: -1)); // Produces 1, -2, 3, -4, 5 etc.
        if (offset > player.matrix[0].length) { // If we have tried to offset more than the piece width, we deem the rotation unsuccessful/
            rotate(player.matrix, -dir); // Reset rotation.
            player.pos.x = pos; // Reset position.
            return;
        }
    }
}



let dropCounter = 0;
let dropInterval = 1000;

let lastTime = 0;
function update(time = 0) {
    const deltaTime = time - lastTime;
    lastTime = time;

    dropCounter += deltaTime;
    if(dropCounter > dropInterval) {
        playerDrop();
    }
lastTime = time;

    draw();
    requestAnimationFrame(update);
}

//scoreboard
function updateScore(){
    document.getElementById('score').innerText = player.score;
}

//colors
const colors = [
    null,
    'violet',
    'yellow',
    'orange',
    'blue',
    'aqua',
    'green',
    'red'
  ];

const arena = createMatrix(12, 20);


const player = {
    pos: {x:0, y:0},
    matrix: createPiece('T'),
    score: 0,
}

//keyboard controls

document.addEventListener('keydown', event => {
        if(event.keyCode === 37) {
            playerMove(-1);
            

        }else if (event.keyCode === 39) {
            playerMove(1);
            
        }else if (event.keyCode === 40) {
           playerDrop();
        } else if(event.keyCode === 81){
            playerDrop(-1);
        } else if(event.keyCode === 87) {
            playerDrop(-1);
        }


});
playerReset();
updateScore();
update();

