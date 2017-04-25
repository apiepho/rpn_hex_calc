// This code runs when the pop up opens

var LEN_PROMPT      = 2;
var MAX_DIGITS      = 8;
var MAX_LINES_SHOWN = 4;
var stack = [];
var digits;
var fmtHex = true;

var ops = [
  "drop",   "clr", "ac", "%d",
  "1", "2", "3",   "+",  "|",
  "4", "5", "6",   "-",  "&amp;",
  "7", "8", "9",   "*",  "^",
  "A", "B", "C",   "/",  "~",
  "D", "E", "F",   "<<",  ">>",
  "0", "enter"
];

var opsHexOnly = [
                         "|",
                         "&amp;",
                         "^",
  "A", "B", "C",         "~",
  "D", "E", "F",   "<<", ">>"
];

function buttonIdName(op) {
  result = "button";
  switch (op) {
    case "drop":  result += "Drop";       break;
    case "clr":   result += "Clr";        break;
    case "ac":    result += "ClrAll";     break;
    case "%d":    result += "Format";     break;
    case "+":     result += "Plus";       break;
    case "|":     result += "Or";         break;
    case "-":     result += "Minus";      break;
    case "&amp;": result += "And";        break;
    case "*":     result += "Mul";        break;
    case "^":     result += "Xor";        break;
    case "/":     result += "Div";        break;
    case "~":     result += "Not";        break;
    case "<<":    result += "ShiftLeft";  break;
    case ">>":    result += "ShiftRight"; break;
    case "enter": result += "Enter";      break;
    default:
      result += op;
      break;
  }
  return result;
}

function buttonWidthString(op) {
  result = "button-";
  switch (op) {
    case "drop":
    case "enter":
      result += "double";
      break;
    default:
      result += "single";
      break;
  }
  return result;
}

function showDigits() {
  console.log('show digits\n');
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

function showLines() {
  var val;
  var str;
  var line;
  console.log('show lines\n');
  for (i=0; i<MAX_LINES_SHOWN; i++) {
    val = stack[i];
    str = ".";
    if (val !== undefined) {
      if (fmtHex) {
        str = ("00000000" + val.toString(16).substr(-8));
        str = str.toUpperCase();
      }
      else {
        str = val.toString(10);
      }
    }
    line = "line" + i;
    document.getElementById(line).innerHTML = str;
  }
}

function formatLines(fmt) {
  console.log('format line for %s\n', fmt);
  showLines();
}

function clearLines() {
  stack = [];
  showLines();
}

function pushLine() {
  if (fmtHex) {
    val = parseInt(digits.substr(2), 16);
  }
  else {
    val = parseInt(digits.substr(2));
  }
  stack.unshift(val);
  showLines();
  clearDigits();
}

function popLine() {
  stack.shift();
  showLines();
}

function clearAll() {
  clearDigits();
  clearLines();
}

function digitClick(digit) {
  console.log(digit);
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
  formatLines(op);
}

function operationClick(op) {
  console.log(op);
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
    default:
      break;
  }
}

function buttonClickFunction(op) {
  result = "";
  switch (op) {
    case "drop":
    case "clr":
    case "ac":
    case "enter":
      result = function() {operationClick(op)};
      break;
    case "%d":
      result = formatClick;
      break;
    case "0":
    case "1":
    case "2":
    case "3":
    case "4":
    case "5":
    case "6":
    case "7":
    case "8":
    case "9":
    case "A":
    case "B":
    case "C":
    case "D":
    case "E":
    case "F":
    result = function() {digitClick(op)};
    break;
    case "+":
    case "|":
    case "-":
    case "&amp;":
    case "*":
    case "^":
    case "/":
    case "~":
    case "<<":
    case ">>":
    result = function() {operationClick(op)};
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
}

// build everything
buildHtml();
clearDigits();
clearLines();
