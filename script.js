
let justCalculated = false;
const display = document.getElementById("display");
const buttons = document.querySelectorAll(".btn");

buttons.forEach(button => {
  button.addEventListener("click", () => {
    handleInput(button.value);
  });
});

function scrollDisplayToEnd() {
  display.scrollLeft = display.scrollWidth;
}

function isOperator(value) {
  return ["+", "-", "*", "/"].includes(value);
}

function getLastNonSpaceChar(value) {
  return value.trimEnd().slice(-1);
}


function handleNumberOrOperator(value) {


  const lastChar = getLastNonSpaceChar(display.value);

  // Prevent starting with an operator
  if (display.value === "" && isOperator(value)) {
    return;
  }

  // Replace operator instead of blocking
  if (isOperator(value) && isOperator(lastChar)) {
  display.value = display.value.trimEnd().slice(0, -1) + value;
  return;
}

  // Prevent multiple decimals in the current number
  if (value === ".") {
    const parts = display.value.split(/[\+\-\*\/()]/);
    const lastNumber = parts[parts.length - 1];

    if (lastNumber.includes(".")) {
      return;
    }

    // Prevent starting with just "."
    if (lastNumber === "" && display.value === "") {
      display.value = "0.";
      scrollDisplayToEnd();
      return;
    }

    // Allow things like 5 + . -> turn into 5 + 0.
    if (lastNumber === "") {
      display.value += "0.";
      scrollDisplayToEnd();
      return;
    }
  }

  // Prevent invalid "(" placement
  if (value === "(") {
    if (display.value === "") {
      display.value += value;
      return;
    }

    if (!isOperator(lastChar) && lastChar !== "(") {
      return;
    }
  }

  // Prevent invalid ")" placement
  if (value === ")") {
    const openCount = (display.value.match(/\(/g) || []).length;
    const closeCount = (display.value.match(/\)/g) || []).length;

    if (openCount <= closeCount) {
      return;
    }

    if (isOperator(lastChar) || lastChar === "(") {
      return;
    }
  }

  // Prevent operator right after "("
  if (isOperator(value) && lastChar === "(") {
    return;
  }

  display.value += value;
  scrollDisplayToEnd();
}

function handleInput(value) {
  if (display.value === "Error") {
    if (!isNaN(value) || value === "." || value === "(") {
      display.value = "";
    } else if (value === "AC") {
      display.value = "";
      return;
    } else {
      return;
    }
  }

  if (justCalculated) {
    if (!isNaN(value) || value === "." || value === "(") {
      display.value = "";
    }
    justCalculated = false;
  }

  if (value === "AC") {
    display.value = "";
    justCalculated = false;
  } 
  else if (value === "DE") {
    display.value = display.value.slice(0, -1);
    scrollDisplayToEnd();
    justCalculated = false;
  } 
  else if (value === "=") {
    calculate();
  } 
  else {
    handleNumberOrOperator(value);
  }
}


function tokenize(expression) {
  return expression.match(/(\d+\.?\d*|\.\d+|[+\-*/()])/g);
}

function evaluateTokens(tokens) {
  // First pass: handle * and /
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i] === "*" || tokens[i] === "/") {
      const left = parseFloat(tokens[i - 1]);
      const right = parseFloat(tokens[i + 1]);

      const result = tokens[i] === "*" ? left * right : left / right;

      tokens.splice(i - 1, 3, result.toString());
      i -= 1;
    }
  }

  // Second pass: handle + and -
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i] === "+" || tokens[i] === "-") {
      const left = parseFloat(tokens[i - 1]);
      const right = parseFloat(tokens[i + 1]);

      const result = tokens[i] === "+" ? left + right : left - right;

      tokens.splice(i - 1, 3, result.toString());
      i -= 1;
    }
  }

  return tokens[0];
}

function evaluateExpression(tokens) {
  while (tokens.includes("(")) {
    let start = -1;
    let end = -1;

    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i] === "(") {
        start = i;
      }

      if (tokens[i] === ")") {
        end = i;
        break;
      }
    }

    if (start === -1 || end === -1 || start > end) {
      throw new Error("Mismatched parentheses");
    }

    const innerTokens = tokens.slice(start + 1, end);
    const innerResult = evaluateTokens(innerTokens.slice());

    tokens.splice(start, end - start + 1, innerResult);
  }

  return evaluateTokens(tokens);
}

function calculate() {

  try {
    const expression = display.value.trim();

    if (expression === "" || expression.includes("Error")) {
      display.value = "Error";
      scrollDisplayToEnd();
      return;
    }

    const lastChar = expression.slice(-1);

    if (isOperator(lastChar) || lastChar === "(" || lastChar === ".") {
      display.value = "Error";
      scrollDisplayToEnd();
      return;
    }

    const openCount = (expression.match(/\(/g) || []).length;
    const closeCount = (expression.match(/\)/g) || []).length;

    if (openCount !== closeCount) {
      display.value = "Error";
      scrollDisplayToEnd();
      return;
    }

    const tokens = tokenize(expression);

    if (!tokens) {
      display.value = "Error";
      scrollDisplayToEnd();
      return;
    }

    const result = evaluateExpression(tokens.slice());

    if (result === undefined || isNaN(result)) {
      display.value = "Error";
      scrollDisplayToEnd();
      return;
    }

    display.value = result.toString();
    scrollDisplayToEnd();
    justCalculated = true;
  } catch (error) {
    display.value = "Error";
    scrollDisplayToEnd();
  }
}

document.addEventListener("keydown", (e) => {

   if (e.key === "Enter") {
    e.preventDefault();
    calculate();
    return;
  }

  const key = e.key;

  if (!isNaN(key) || isOperator(key) || key === "." || key === "(" || key === ")") {
  handleInput(key);
}

  
else if (key === "Backspace") {
    display.value = display.value.slice(0, -1);
  } 
  else if (key === "Escape") {
    display.value = "";
  }
});

