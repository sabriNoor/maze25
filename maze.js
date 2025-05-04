
let maze = [];
let startTile = null;
let endTile = null;

document.getElementById('generateBtn').addEventListener('click', generateMaze);

function generateMaze() {
    const size = parseInt(document.getElementById('size').value);
    const mazeContainer = document.getElementById('maze');
    mazeContainer.innerHTML = '';
    mazeContainer.style.gridTemplateColumns = `repeat(${size}, 30px)`;

    maze = [];

    for (let i = 0; i < size; i++) {
        const row = [];
        for (let j = 0; j < size; j++) {
            const tile = createTile(i, j);
            row.push(tile);
        }
        maze.push(row);
    }

    startTile = getRandomNonObstacleTile(size);
    endTile = getRandomNonObstacleTile(size);

    while (startTile.x === endTile.x && startTile.y === endTile.y) {
        endTile = getRandomNonObstacleTile(size);
    }

    computeAllObstacleDistances(size);

    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            const tile = maze[i][j];
            const tileDiv = document.createElement('div');
            tileDiv.className = `tile ${tile.type}`;

            if (tile.x === startTile.x && tile.y === startTile.y) {
                tileDiv.classList.add('start');
                tileDiv.innerHTML = "S";
            } else if (tile.x === endTile.x && tile.y === endTile.y) {
                tileDiv.classList.add('end');
                tileDiv.innerHTML = "E";
            } else {
                tileDiv.innerHTML = `${tile.elevation}<br>h=${tile.distanceToObstacle}`;
            }

            mazeContainer.appendChild(tileDiv);
        }
    }
}

function createTile(x, y) {
    const types = ['grass', 'water', 'obstacle'];
    const type = types[Math.floor(Math.random() * types.length)];
    const elevation = Math.floor(Math.random() * 11);
    return {
        x,
        y,
        type,
        elevation,
        distanceToObstacle: null
    };
}

function getRandomNonObstacleTile(size) {
    let tile;
    do {
        const x = Math.floor(Math.random() * size);
        const y = Math.floor(Math.random() * size);
        tile = maze[x][y];
    } while (tile.type === 'obstacle');
    return tile;
}

function computeAllObstacleDistances(size) {
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            maze[i][j].distanceToObstacle = findNearestObstacleDistance(i, j, size);
        }
    }
}

function findNearestObstacleDistance(x, y, size) {
    let minDistance = Infinity;
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            if (maze[i][j].type === 'obstacle') {
                const distance = Math.abs(x - i) + Math.abs(y - j);
                if (distance < minDistance) {
                    minDistance = distance;
                }
            }
        }
    }
    return minDistance === Infinity ? -1 : minDistance;
}

const solveMaze = async () => {
    console.log('Start Tile:', startTile);
    console.log('End Tile:', endTile);
    console.log('Maze with distances:', maze);

    // Send maze data to backend to solve the maze
    try {
        const response = await fetch('http://localhost:3000/solve-maze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                mazeData: maze,
                startTile,
                endTile,
                size: maze.length
            }),
        });


        const data = await response.json();
        console.log(data);

        if (data.success) {
            const path = data.path;
            const mazeContainer = document.getElementById('maze');
            path.forEach(tile => {
                const index = tile.x * maze.length + tile.y;
                const div = mazeContainer.children[index];
                div.classList.add('path');
            });
        } else {
            console.log("No path found.");
        }
    } catch (error) {
        console.error("Error solving maze:", error);
    }
};

document.getElementById('solveBtn').addEventListener('click', solveMaze);