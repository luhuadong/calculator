let displayValue = '0';
let firstOperand = null;
let waitingForSecondOperand = false;
let operator = null;
let calculationHistory = []; // 存储历史计算记录，最多2条
let displayExpression = ''; // 存储显示的表达式（包含运算符）

function updateDisplay() {
    const display = document.getElementById('display');
    // 如果有表达式，显示表达式，否则显示当前值
    if (displayExpression) {
        display.innerText = displayExpression;
    } else {
        display.innerText = displayValue;
    }
}

function updateHistory() {
    // 更新历史记录显示，实现向上滚动效果
    const historyItem1 = document.getElementById('history-item-1');
    const historyItem2 = document.getElementById('history-item-2');
    
    // 检查是否需要滚动（当前已有2条记录，且新记录是第3条）
    const shouldAnimate = calculationHistory.length > 2 && 
                          historyItem1.textContent !== '' && 
                          historyItem2.textContent !== '';
    
    // 保存当前第二条的内容（如果需要滚动）
    const oldItem2Content = shouldAnimate ? historyItem2.textContent : null;
    
    // 只保留最近2条历史记录
    if (calculationHistory.length > 2) {
        calculationHistory.shift();
    }
    
    if (calculationHistory.length >= 2) {
        if (shouldAnimate) {
            // 当需要滚动时：第一条向上移出，第二条移到第一条位置，新记录从下方移入
            // 第一步：第一条向上移出，第二条向上移动到第一条位置
            historyItem1.style.transform = 'translateY(-35px)';
            historyItem1.style.opacity = '0';
            historyItem2.style.transform = 'translateY(-35px)';
            
            setTimeout(() => {
                // 第二步：更新内容
                // 第一条显示原来的第二条内容
                historyItem1.textContent = oldItem2Content;
                // 第二条显示新记录，从下方移入
                historyItem2.textContent = calculationHistory[1];
                
                // 第一条已经在正确位置，直接显示
                historyItem1.style.transform = 'translateY(0)';
                historyItem1.style.opacity = '1';
                
                // 第二条从下方移入
                historyItem2.style.transform = 'translateY(35px)';
                historyItem2.style.opacity = '0';
                
                // 触发重排，然后让第二条平滑移入
                requestAnimationFrame(() => {
                    setTimeout(() => {
                        historyItem2.style.transform = 'translateY(0)';
                        historyItem2.style.opacity = '1';
                    }, 10);
                });
            }, 300);
        } else {
            // 不需要滚动时，直接更新内容
            historyItem1.textContent = calculationHistory[0];
            historyItem2.textContent = calculationHistory[1];
            historyItem1.style.transform = 'translateY(0)';
            historyItem2.style.transform = 'translateY(0)';
            historyItem1.style.opacity = '1';
            historyItem2.style.opacity = '1';
        }
    } else if (calculationHistory.length === 1) {
        // 只有一条记录时，直接显示在第二个位置
        historyItem1.textContent = '';
        historyItem2.textContent = calculationHistory[0];
        historyItem2.style.transform = 'translateY(0)';
        historyItem2.style.opacity = '1';
    } else {
        historyItem1.textContent = '';
        historyItem2.textContent = '';
    }
}

function clearDisplay() {
    displayValue = '0';
    firstOperand = null;
    waitingForSecondOperand = false;
    operator = null;
    displayExpression = '';
    updateDisplay();
}

function inputDigit(digit) {
    // 确保 displayValue 是字符串类型
    if (typeof displayValue !== 'string') {
        displayValue = displayValue.toString();
    }
    
    // 如果刚完成计算或等待第二个操作数，清空显示并输入新数字
    if (waitingForSecondOperand === true) {
        displayValue = digit.toString();
        waitingForSecondOperand = false;
        displayExpression = ''; // 清空表达式
    } else {
        // 如果显示的是错误信息，直接替换
        if (displayValue === '错误') {
            displayValue = digit.toString();
            displayExpression = '';
        } else {
            // 确保是字符串拼接，不是数字相加
            displayValue = displayValue === '0' ? digit.toString() : displayValue.toString() + digit.toString();
        }
    }
    updateDisplay();
}

function inputDecimal() {
    if (waitingForSecondOperand === true) {
        displayValue = '0.';
        waitingForSecondOperand = false;
        displayExpression = ''; // 清空表达式
    } else if (!displayValue.toString().includes('.')) {
        displayValue += '.';
    }
    updateDisplay();
}

function inputOperator(nextOperator) {
    // 处理特殊操作符
    if (nextOperator === '+/-') {
        if (displayValue !== '0') {
            displayValue = displayValue.startsWith('-') 
                ? displayValue.substring(1) 
                : '-' + displayValue;
        }
        displayExpression = '';
        updateDisplay();
        return;
    }
    
    if (nextOperator === '%') {
        const inputValue = parseFloat(displayValue);
        if (!isNaN(inputValue)) {
            displayValue = (inputValue / 100).toString();
            displayExpression = '';
            updateDisplay();
        }
        return;
    }
    
    const inputValue = parseFloat(displayValue);
    
    // 如果已经有操作符且正在等待第二个操作数，只更新操作符（不进行计算）
    if (operator && waitingForSecondOperand) {
        operator = nextOperator;
        // 更新表达式显示
        displayExpression = `${firstOperand} ${getOperatorSymbol(nextOperator)}`;
        updateDisplay();
        return;
    }
    
    // 如果已经有第一个操作数和操作符，且已经输入了第二个操作数，先计算
    // 但只有在用户已经输入了第二个操作数（waitingForSecondOperand = false）时才计算
    // 注意：这里只在连续输入运算符时进行计算，比如 2+3- 会先计算 2+3=5，然后等待输入
    if (firstOperand !== null && operator && !waitingForSecondOperand) {
        const result = performCalculation(operator, firstOperand, inputValue);
        if (result === null) {
            return; // 计算错误，不继续
        }
        displayValue = formatResult(result);
        firstOperand = result;
    } else {
        // 如果没有第一个操作数，或者没有操作符，设置第一个操作数
        firstOperand = inputValue;
    }
    
    waitingForSecondOperand = true;
    operator = nextOperator;
    
    // 更新表达式显示：显示第一个操作数和运算符
    displayExpression = `${firstOperand} ${getOperatorSymbol(nextOperator)}`;
    updateDisplay();
}

function performCalculation(op, first, second) {
    let result;
    
    switch(op) {
        case '+':
            result = first + second;
            break;
        case '-':
            result = first - second;
            break;
        case '*':
            result = first * second;
            break;
        case '/':
            if (second === 0) {
                displayValue = '错误';
                updateDisplay();
                return null;
            }
            result = first / second;
            break;
        case '%':
            result = first % second;
            break;
        default:
            return null;
    }
    
    return result;
}

function formatResult(result) {
    // 处理无穷大和 NaN
    if (!isFinite(result)) {
        return '错误';
    }
    
    // 格式化结果，去除不必要的零
    const formatted = parseFloat(result.toFixed(10));
    return formatted.toString();
}

function calculate() {
    if (operator && !waitingForSecondOperand && firstOperand !== null) {
        const secondOperand = parseFloat(displayValue);
        const result = performCalculation(operator, firstOperand, secondOperand);
        
        if (result === null) {
            return; // 计算错误
        }
        
        // 保存历史记录
        const historyText = `${firstOperand} ${getOperatorSymbol(operator)} ${secondOperand} = ${formatResult(result)}`;
        calculationHistory.push(historyText);
        updateHistory();
        
        // 显示结果
        displayValue = formatResult(result);
        displayExpression = ''; // 清空表达式
        updateDisplay();
        
        // 计算完成后，重新开始新的计算
        firstOperand = null;
        operator = null;
        waitingForSecondOperand = false;
        
        // 设置标志，下次输入数字时清空显示
        waitingForSecondOperand = true;
    }
}

function getOperatorSymbol(op) {
    const symbols = {
        '+': '+',
        '-': '-',
        '*': '×',
        '/': '÷',
        '%': '%'
    };
    return symbols[op] || op;
}

updateDisplay();
