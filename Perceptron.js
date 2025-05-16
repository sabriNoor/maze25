// const { random } = require('lodash');
import lodash from 'lodash';
const { random } = lodash;
export class Perceptron {
    constructor(activationType, learningRate,epochs) {
        this.activationType = activationType;
        this.weights = [random(-0.5, 0.5), random(-0.5, 0.5), random(-0.5, 0.5)]; 
        this.learningRate = learningRate; 
        this.threshold = random(-0.5, 0.5); 
        this.sign= -1;
        this.epochs = epochs;
    }
    sum(inputs) {
        let sumx = 0;
        for (let i = 0; i < inputs.length; i++) {
            sumx += inputs[i] * this.weights[i];
        }
        return sumx + this.sign * this.threshold; 
    }
    stepFunction(x) {
        return x >= 0 ? 1 : 0; 
    }
    sigmoidFunction(x) {
        return 1 / (1 + Math.exp(-x)); 
    }
    linearFunction(x) {
        return x; 
    }
    signFunction(x) {
        return x >= 0 ? 1 : -1; 
    }
    activationFunction(x) {
        switch (this.activationType) {
            case 'step':
                return this.stepFunction(x);
            case 'sigmoid':
                return this.sigmoidFunction(x);
            case 'linear':
                return this.linearFunction(x);
            case 'sign':
                return this.signFunction(x);
            default:
                throw new Error('Invalid activation function type');
        }
    }
    
    train(inputs, desiredOutputs, maxDistance) {
        const errors = new Array(desiredOutputs.length).fill(0);
        for(let i = 0; i < inputs.length; i++) {
            inputs[i][1]/=10;
            inputs[i][2]/=maxDistance;
            const actualOutput = this.activationFunction(this.sum(inputs[i]));
            const expectedOutput = desiredOutputs[i];
            const error = expectedOutput - actualOutput;
            errors[i] = error;
            for (let j = 0; j < this.weights.length; j++) {
                this.weights[j] += this.learningRate * error * inputs[i][j]; 
            }
            this.threshold += this.learningRate * error * this.sign;            
        }
        const totalError = errors.reduce((acc, error) => acc + Math.abs(error), 0);
        if (totalError === 0) {
            console.log('Training complete: No errors found.');
        } else {
            console.log(`Total error: ${totalError}`);
        }
        return totalError;
    }
    test(inputs) {
        let outputs = new Array(inputs.length).fill(0);
        for(let i = 0; i < inputs.length; i++) {
            inputs[i][1]/=10;
            inputs[i][2]/=10;
            const output = this.activationFunction(this.sum(inputs[i]));
            outputs[i] = output;
        }
        return outputs;
    }
    stopCondition() {
        let stop = true;
        
        return stop;
    }
    
    trainMultipleEpochs(train_x, train_y, maxDistance) {
        for (let i = 0; i < this.epochs; i++) {
            const totalError=this.train(train_x, train_y, maxDistance); 
            if (totalError === 0) {
                console.log(`Training complete at epoch ${i}`);
                break;
            }
            if (i % 10 === 0) { 
                console.log(`Epoch ${i}: Weights: ${this.weights}, Threshold: ${this.threshold}`);
            }
        }
    }
    predict(input, maxDistance) {
        input[1]/=10;
        input[2]/=maxDistance;
        const output = this.activationFunction(this.sum(input));
        return output;
    }
}

