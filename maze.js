
let maze = [];
let startTile = null;
let endTile = null;
let maxDistance = -1;

document.getElementById('generateBtn').addEventListener('click', generateMaze);

function generateMaze() {
    startTile = null;
    endTile   = null;
    maxDistance = -1;
    const size = parseInt(document.getElementById('size').value);
    const mazeContainer = document.getElementById('maze');
     const resultDiv = document.getElementById('result');
     resultDiv.textContent = "";
    mazeContainer.innerHTML = '';
    mazeContainer.style.gridTemplateColumns = `repeat(${size}, 40px)`;

    maze = [];

    for (let i = 0; i < size; i++) {
        const row = [];
        for (let j = 0; j < size; j++) {
            const tile = createTile(i, j);
            row.push(tile);
        }
        maze.push(row);
    }

    computeAllObstacleDistances(size);

    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            const tile = maze[i][j];
            const tileDiv = document.createElement('div');
            tileDiv.className = `tile ${tile.type}`;
            tileDiv.innerHTML = `${tile.elevation}<br>h=${tile.distanceToObstacle}`;

             tileDiv.dataset.x = i;
             tileDiv.dataset.y = j;
                tileDiv.addEventListener('click', (e) => {
                     if (e.shiftKey) {
                    const selectedType = document.getElementById('tileType').value;
                    tile.type = selectedType;

                    tileDiv.className = `tile ${selectedType}`;
                    tileDiv.classList.remove('start', 'end', 'path', 'tested');
                    tileDiv.innerHTML = `${tile.elevation}<br>h=${tile.distanceToObstacle}`;

                    computeAllObstacleDistances(size);

                    document.querySelectorAll('.tile').forEach(div => {
                        const t = maze[+div.dataset.x][+div.dataset.y];
                        if (!div.classList.contains('start') && !div.classList.contains('end')) {
                            div.innerHTML = `${t.elevation}<br>h=${t.distanceToObstacle}`;
                        }
                    });

                    return;
                }

                    if (tile.type === 'obstacle') return;

                    document.querySelectorAll('.path, .tested').forEach(d => {
                    d.classList.remove('path', 'tested');
                     });

                    if (!startTile) {
                        startTile = tile;
                        tileDiv.classList.add('start');
                        tileDiv.textContent = 'S';
                    }
                    else if (!endTile && (tile.x !== startTile.x || tile.y !== startTile.y)) {
                        endTile = tile;
                        tileDiv.classList.add('end');
                        tileDiv.textContent = 'E';
                    }
                    else if (startTile && endTile) {
                        document.querySelectorAll('.start, .end').forEach(d => {
                            d.classList.remove('start','end');
                            const t = maze[+d.dataset.x][+d.dataset.y];
                            d.innerHTML = `${t.elevation}<br>h=${t.distanceToObstacle}`;
                        });
                        startTile = tile;
                        endTile = null;
                        tileDiv.classList.add('start');
                        tileDiv.textContent = 'S';
                    }
                });

            mazeContainer.appendChild(tileDiv);
        }
    }
}

function createTile(x, y) {
    const weightedTypes = [
        ...Array(65).fill('grass'),
        ...Array(25).fill('water'),
        ...Array(10).fill('obstacle')
      ];
      
    const type = weightedTypes[Math.floor(Math.random() * weightedTypes.length)];
    const elevation = Math.floor(Math.random() * 10)+1;
    
    return {
        x,
        y,
        type,
        elevation,
        distanceToObstacle: null
    };
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
    if(minDistance > maxDistance) maxDistance = minDistance;
    return minDistance === Infinity ? -1 : minDistance;
}

const solveMaze = async () => {
    console.log('Start Tile:', startTile);
    console.log('End Tile:', endTile);
    console.log('Maze with distances:', maze);
    const resultDiv = document.getElementById('result');
     resultDiv.textContent = "";

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
                size: maze.length,
                maxDistance: maxDistance
            }),
        });


        const data = await response.json();
        console.log(data);

        if (data.success) {
            const { path, testedTiles } = data;
            const mazeContainer = document.getElementById('maze');
            // color all tested tiles
            testedTiles.forEach(tile => {
                const index = tile.x * maze.length + tile.y;
                const div = mazeContainer.children[index];
                if (!div.classList.contains('start') && !div.classList.contains('end')) {
                    div.classList.add('tested'); 
                }
            });

            // color the final solution path
            path.forEach(tile => {
                const index = tile.x * maze.length + tile.y;
                const div = mazeContainer.children[index];
                if (!div.classList.contains('start') && !div.classList.contains('end')) {
                    div.classList.remove('tested'); 
                    div.classList.add('path');
                }
            });
        } else {
            console.log("No path found.");
            const resultDiv = document.getElementById('result');
            resultDiv.textContent = "No path found.";
        }
    } catch (error) {
        console.error("Error solving maze:", error);
    }
};

document.getElementById('solveBtn').addEventListener('click', solveMaze);