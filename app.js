import express from 'express';
import cors from 'cors';
import { Perceptron } from './Perceptron.js';
import { splitData } from './DataPrepare.js';
import { AStar } from './AStar.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Endpoint to solve the maze
app.post('/solve-maze',async (req, res) => {
    const { mazeData, startTile, endTile, size } = req.body;
    // Prepare data for Perceptron and A* algorithm
    const { train_x, train_y, test_x, test_y } = splitData();

    // Train Perceptron
    const perceptron = new Perceptron('step', 0.1, 1000);
    perceptron.trainMultipleEpochs(train_x, train_y);
    const predictions = perceptron.test(test_x);

    let isCorrectPrediction = predictions.map((pred, i) => {
        return pred === test_y[i];
    });

    console.log('Predictions:', isCorrectPrediction);

    // Solve the maze using A*
    const path =await AStar(startTile, endTile, mazeData, size, perceptron);

    if (path) {
        res.json({ success: true, path });
    } else {
        res.status(400).json({ success: false, message: 'No path found.' });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
