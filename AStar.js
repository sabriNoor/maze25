export const AStar=async(start, end, maze, size, perceptron, maxDistance)=> {
    console.log('A* Algorithm');
    const openList = [start]; // open list
    const closedList = new Set(); // closed list
    const cameFrom = new Map(); // to track path

    const gScore = new Map(); // cost to get to current node
    const fScore = new Map(); // estimated cost to get to goal

    gScore.set(getKey(start), 0); // cost to get to start is 0
    fScore.set(getKey(start), heuristic(start, end)); // estimated cost to get to goal from start

    // while open list is not empty
    while (openList.length > 0) {
        let currentTile = openList[0];
        console.log('Current Tile:', currentTile);
        // get best tile to expand with lowest f score and g score
        for (let i = 1; i < openList.length; i++) {
            const e1 = fScore.get(getKey(openList[i])) + gScore.get(getKey(openList[i]));
            const e2 = fScore.get(getKey(currentTile)) + gScore.get(getKey(currentTile));
            if (e1 < e2) {
                currentTile = openList[i];
            } else if (e1 == e2) {
                console.log('Tie Breaker');
                const f1 = fScore.get(getKey(openList[i]));
                const f2 = fScore.get(getKey(currentTile));
                currentTile = f1 < f2 ? openList[i] : currentTile;
                console.log('Current Tile form tie breaker:', currentTile);
            }
        }
        // remove current tile from open list
        openList.splice(openList.indexOf(currentTile), 1);

        // check if goal reached
        if (currentTile.x === end.x && currentTile.y === end.y) {   
            const path = [];
            let current = currentTile;
            // backtrack path from end to start and add to path
            while (current !== start) {
                path.push(current);
                // get parent of current
                current = cameFrom.get(getKey(current));
            }
            // add start to path
            path.push(start);
            // reverse path
            path.reverse();
            return path;
        }
        // get neighbors
        const neighbors = getNighbors(currentTile.x, currentTile.y, size, maze);
        for (const neighbor of neighbors) {
            console.log('Neighbor:', neighbor);
            // check if neighbor is obstacle
            if (neighbor.type === 'obstacle') {
                continue;
            }
            if (!(neighbor.x === end.x && neighbor.y === end.y)) {
                const inputs = [neighbor.type === 'grass' ? 0 : 1, neighbor.elevation, neighbor.distanceToObstacle];
                console.log('Inputs:', inputs);
                const prediction = perceptron.predict(inputs,maxDistance);
                console.log('Prediction:', prediction);
            
                // if unsafe and not the end tile, skip
                if (prediction === 0) {
                    continue;
                }
            }
            // calculate new g score and new f score
            const newGScore = gScore.get(getKey(currentTile)) + 1;
            const newFScore = heuristic(neighbor, end);
            // check if neighbor is already in open list
            const alreadyInOpenList = openList.some(tile => getKey(tile) === getKey(neighbor));
            // check if neighbor is already in closed list
            const alreadyInClosedList = closedList.has(getKey(neighbor));
            
            if (!alreadyInOpenList && !alreadyInClosedList) { 
                // if neighbor is not in open list or closed list add it to open list and seet gScore and fScore
                // also set cameFrom to current tile (parent)
                openList.push(neighbor);
                cameFrom.set(getKey(neighbor), currentTile);
                gScore.set(getKey(neighbor), newGScore);
                fScore.set(getKey(neighbor), newFScore);
            }
            // else if neighbor is in open list and gScore + fScore is less than gScore and fScore
            else if (newGScore + newFScore < gScore.get(getKey(neighbor)) + fScore.get(getKey(neighbor))) {
                // if already in open list remove it from open list
                if (alreadyInOpenList) {
                    let index = 0;
                    for (let i = 0; i < openList.length; i++) {
                        if (getKey(openList[i]) === getKey(neighbor)) {
                            index = i;
                            break;
                        }
                    }
                    openList.splice(index, 1);
                }
                // if already in closed list remove it from closed list
                if (alreadyInClosedList) {
                    closedList.delete(getKey(neighbor));
                }
                // set cameFrom to current tile (parent)
                cameFrom.set(getKey(neighbor), currentTile);
                // set gScore and fScore to new gScore and fScore
                gScore.delete(getKey(neighbor));
                fScore.delete(getKey(neighbor));
                gScore.set(getKey(neighbor), newGScore);
                fScore.set(getKey(neighbor), newFScore);
                // add neighbor to open list
                openList.push(neighbor);
            }
        }
        // add current tile to closed list
        closedList.add(getKey(currentTile));
    }

    // no path found
    return [];
}


const getNighbors = (x, y, size, maze) => {
    const neighbors = [];
    if (x > 0) neighbors.push(maze[x - 1][y]);
    if (x < size - 1) neighbors.push(maze[x + 1][y]);
    if (y > 0) neighbors.push(maze[x][y - 1]);
    if (y < size - 1) neighbors.push(maze[x][y + 1]);
    return neighbors;
};

const getKey=(tile)=> {
    return `${tile.x},${tile.y}`;
}

const heuristic=(a, b)=> {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}


