let displayValue = '0';
let firstOperand = null;
let waitingForSecondOperand = false;
let operator = null;

function updateDisplay() {
    const display = document.getElementById('display');
    display.innerText = displayValue;
}

function clearDisplay() {
    displayValue = '0';
    firstOperand = null;
    waitingForSecondOperand = false;
    operator = null;
    updateDisplay();
}

function inputDigit(digit) {
    if (waitingForSecondOperand === true) {
        displayValue = digit;
        waitingForSecondOperand = false;
    } else {
        displayValue = displayValue === '0' ? digit : displayValue + digit;
    }
    updateDisplay();
}

function inputDecimal() {
    if (waitingForSecondOperand === true) {
        displayValue = '0.';
        waitingForSecondOperand = false;
    } else if (!displayValue.toString().includes('.')) {
        displayValue += '.';
    }
    updateDisplay();
}

function inputOperator(nextOperator) {
    const inputValue = parseFloat(displayValue);
    if (operator && waitingForSecondOperand) {
        operator = nextOperator;
        return;
    }
    if (firstOperand === null) {
        firstOperand = inputValue;
    } else if (operator) {
        const result = performCalculation[operator](firstOperand, inputValue);
        displayValue = `${parseFloat(result.toFixed(7))}`;
        firstOperand = result;
    }
    waitingForSecondOperand = true;
    operator = nextOperator;
    updateDisplay();
}

const performCalculation = {
    '/': (firstOperand, secondOperand) => firstOperand / secondOperand,
    '*': (firstOperand, secondOperand) => firstOperand * secondOperand,
    '+': (firstOperand, secondOperand) => firstOperand + secondOperand,
    '-': (firstOperand, secondOperand) => firstOperand - secondOperand,
    '%': (firstOperand, secondOperand) => firstOperand % secondOperand,
};

function calculate() {
    if (operator && !waitingForSecondOperand) {
        const result = performCalculation[operator](firstOperand, parseFloat(displayValue));
        displayValue = `${parseFloat(result.toFixed(7))}`;
        firstOperand = null;
        operator = null;
        waitingForSecondOperand = false;
        updateDisplay();
    }
}

updateDisplay();
