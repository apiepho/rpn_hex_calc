// This code runs when the pop up opens

///////////////////////////////////////////////////////////
// CONSTANTS
///////////////////////////////////////////////////////////
var LEN_PROMPT      = 2;
var MAX_DIGITS      = 8;
var MAX_LINES_SHOWN = 4;

// GLOBAL VARIABLES
var stack = [];
var digits;
var fmtHex = true;

///////////////////////////////////////////////////////////
// TABLES
///////////////////////////////////////////////////////////
var ops = [
  "drop",   "clr", "ac", "%d",
  "1", "2", "3",   "+",  "|",
  "4", "5", "6",   "-",  "&amp;",
  "7", "8", "9",   "*",  "^",
  "A", "B", "C",   "/",  "~",
  "D", "E", "F",   "<<",  ">>",
  ".", "0", "enter"
];
var opNames = [
  "Drop",     "Clr", "ClrAll",     "Format",
  "1",   "2", "3",   "Plus",       "Or",
  "4",   "5", "6",   "Minus",      "And",
  "7",   "8", "9",   "Mul",        "Xor",
  "A",   "B", "C",   "Div",        "Not",
  "D",   "E", "F",   "ShiftLeft",  "ShiftRight",
  "Dot", "0", "Enter"
];
var operations = [
  "drop",   "clr", "ac", "%d",
                   "+",  "|",
                   "-",  "&amp;",
                   "*",  "^",
                   "/",  "~",
                   "<<",  ">>",
       "enter"
];
var opsHexOnly = [
                         "|",
                         "&amp;",
                         "^",
  "A", "B", "C",         "~",
  "D", "E", "F",   "<<", ">>",
  "."
];


///////////////////////////////////////////////////////////
// DIGIT LINE FUNCTIONS
///////////////////////////////////////////////////////////
function showDigits() {
  document.getElementById("digits").innerHTML = digits;
  document.getElementById("digits").focus();
}

function clearDigits() {
  digits = "> ";
  showDigits();
}

function pushDigit(digit) {
  if (digits.length < (LEN_PROMPT + MAX_DIGITS)) {
    digits = digits + digit
  }
  showDigits();
}

function popDigit() {
  digits = digits.slice(0, -1);
  showDigits();
}

function digitsEmpty() {
  return (digits.length <= "> ".length);
}

function popValueFromDigits() {
  var val;
  if (fmtHex) {
    val = parseInt(digits.substr(2), 16);
  }
  else {
    val = parseInt(digits.substr(2));
  }
  return val;
}

function pushValueToDigits(value) {
  if (fmtHex)
    digits = "> " + value.toString(16);
  else
    digits = "> " + value.toString(10);
}

///////////////////////////////////////////////////////////
// RESULT LINES FUNCTIONS
///////////////////////////////////////////////////////////
function showLines() {
  var val;
  var str;
  var line;
  for (i=0; i<MAX_LINES_SHOWN; i++) {
    val = stack[i];
    str = i+1 + ": ";
    if (val !== undefined) {
      if (fmtHex) {
        str += ("00000000" + val.toString(16).substr(-8));
        str = str.toUpperCase();
      }
      else {
        str +=  val.toString(10);
      }
    }
    line = "line" + i;
    document.getElementById(line).innerHTML = str;
  }
}

function formatLines(fmt) {
  showLines();
}

function clearLines() {
  stack = [];
  showLines();
}

function pushLine() {
  var val;
  if (digitsEmpty()) {
    val = stack[0];
  } else {
    val = popValueFromDigits();
  }
  stack.unshift(val);
  showLines();
  clearDigits();
}

function popLine() {
  val = stack.shift();
  showLines();
  return (val === undefined ? 0 : val);
}

function clearAll() {
  clearDigits();
  clearLines();
}

///////////////////////////////////////////////////////////
// OPERANDS FUNCTIONS
///////////////////////////////////////////////////////////
function getOneOperand() {
  var val1;
  if (digitsEmpty()) {
    val1 = popLine();
  } else {
    val1 = popValueFromDigits();
  }
  return val1;
}

function getTwoOperands() {
  var val1, val2;
  if (digitsEmpty()) {
    val1 = popLine();
    val2 = popLine();
  } else {
    val1 = popValueFromDigits();
    clearDigits();
    val2 = popLine();
  }
  return {val1, val2};
}

///////////////////////////////////////////////////////////
// CLICK FUNCTIONS
///////////////////////////////////////////////////////////
function digitClick(digit) {
  pushDigit(digit);
}

function formatClick() {
  op = $("#buttonFormat")[0].innerText;
  switch (op) {
    case "%d": $("#buttonFormat").html("%x"); fmtHex = false; break;
    case "%x": $("#buttonFormat").html("%d"); fmtHex = true;  break;
  }
  for (i = 0; i < opsHexOnly.length; i++) {
    str = "#" + buttonIdName(opsHexOnly[i]);
    if (fmtHex)
      $(str).removeAttr("disabled");
    else
      $(str).attr("disabled", "true");
  }
  // disable . for now
  $("#buttonDot").attr("disabled", "true");
  formatLines(op);
}

function operationClick(op) {
  console.log("operationClick " + op);
  switch (op) {
    case "drop":
      popLine();
      break;
    case "clr":
      popDigit();
      break;
    case "ac":
      clearAll();
      break;
    case "enter":
      pushLine();
      break;
    case "+":
      var {val1, val2} = getTwoOperands();
      pushValueToDigits(val1 + val2);
      pushLine();
      break;
    case "-":
      var {val1, val2} = getTwoOperands();
      pushValueToDigits(val1 - val2);
      pushLine();
      break;
    case "*":
      var {val1, val2} = getTwoOperands();
      pushValueToDigits(val1 * val2);
      pushLine();
      break;
    case "/":
      var {val1, val2} = getTwoOperands();
      pushValueToDigits(Math.round(val1 / val2));
      pushLine();
      break;
    case "|":
      var {val1, val2} = getTwoOperands();
      pushValueToDigits(val1 | val2);
      pushLine();
      break;
    case "&amp;":
      var {val1, val2} = getTwoOperands();
      pushValueToDigits(val1 & val2);
      pushLine();
      break;
    case "~":
      var val1 = getOneOperand();
      pushValueToDigits(~val1);
      pushLine();
      break;
    case "<<":
      var val1 = getOneOperand();
      pushValueToDigits(val1 << 1);
      pushLine();
      break;
    case ">>":
      var val1 = getOneOperand();
      pushValueToDigits(val1 >> 1);
      pushLine();
      break;
  }
}

function buttonClickFunction(op) {
  result = function() {digitClick(op)}; // default
  if (operations.indexOf(op) >= 0)
    result = function() {operationClick(op)};
  if (op == "%d")
    result = formatClick;
  return result;
}

///////////////////////////////////////////////////////////
// BUILD HTML
///////////////////////////////////////////////////////////
function buttonIdName(op) {
  return "button" + opNames[ops.indexOf(op)];
}

function buttonWidthString(op) {
  result = "button-";
  switch (op) {
    case "drop":
      result += "double";
      break;
    case "enter":
      result += "triple";
      break;
    default:
      result += "single";
      break;
  }
  return result;
}

function buildHtml() {
  // build results area
  var calc=$("#calculator");
  var results = $("<div></div>").addClass("results");
  for (i = MAX_LINES_SHOWN-1; i >= 0; i--) {
    line = $("<p></p>").addClass("result-line").attr("id", "line" + i);
    results.append(line);
  }

  // build input line
  line = $("<p></p>").addClass("result-line").attr("id", "digits");
  results.append(line);
  calc.append(results);

  // build buttons
  container = $("<div></div>").addClass("button-container");
  for (i = 0; i < ops.length; i++) {
    op = ops[i];
    btn = $("<button></button>")
          .addClass("button")
          .addClass(buttonWidthString(op))
          .attr("id", buttonIdName(op))
          .html(op)
          .click(buttonClickFunction(op));
    container.append(btn);
  }
  calc.append(container);
  // disable . for now
  $("#buttonDot").attr("disabled", "true");
}

///////////////////////////////////////////////////////////
// MAIN
///////////////////////////////////////////////////////////
buildHtml();
clearDigits();
clearLines();
