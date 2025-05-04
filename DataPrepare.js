import XLSX from 'xlsx';
import _ from 'lodash';

const FILE_PATH = 'Data.xlsx';
// This function reads an Excel file and returns the data as an array of objects.
const readFile = (fileName) => {
    const workbook = XLSX.readFile(fileName);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    return data;

}
// This function reads the data from the Excel file and returns the inputs and outputs.
const inOut = () => {
    const Data = readFile(FILE_PATH);
    const inputs = Data.map(row => {
        return [row['Terrain'], row['Elevation'], row['ObstacleDistance']];
    });
    const outputs = Data.map(row => {
        return row['Label'];
    });
    return { inputs, outputs };
}

// This function combines the inputs and outputs into an array of objects.
const combineData=() => {
    const { inputs, outputs } = inOut();
    const combinedData = inputs.map((input, index) => {
        return { input, output: outputs[index] };
    });
    return combinedData;
}

// This function splits the combined data into training and testing sets.
// It uses 80% of the data for training and 20% for testing.
export const splitData = () => {
    const data = combineData();
    const testSize = Math.floor(data.length * 0.2); 
    const shuffled = _.shuffle(data);
    const testSet = shuffled.slice(0, testSize);
    const trainSet = shuffled.slice(testSize);
    const train_x = trainSet.map(row => row.input);
    const train_y = trainSet.map(row => row.output);
    const test_x = testSet.map(row => row.input);
    const test_y = testSet.map(row => row.output);
    return { train_x, train_y, test_x, test_y };
}

