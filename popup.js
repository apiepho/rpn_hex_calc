// This code runs when the pop up opens

var LEN_PROMPT      = 2;
var MAX_DIGITS      = 8;
var MAX_LINES_SHOWN = 4;
var stack = [];
var digits;
var fmtHex = true;


var ops = [];


document.getElementById("buttonFormat").onclick = formatClick;
document.getElementById("buttonDrop").onclick   = function() {operationClick("drop")};
document.getElementById("buttonClr").onclick    = function() {operationClick("clr")};
document.getElementById("buttonClrAll").onclick = function() {operationClick("ac")};
document.getElementById("buttonEnter").onclick  = function() {operationClick("enter")};

document.getElementById("button0").onclick = function() {digitClick("0")};
document.getElementById("button1").onclick = function() {digitClick("1")};
document.getElementById("button2").onclick = function() {digitClick("2")};
document.getElementById("button3").onclick = function() {digitClick("3")};
document.getElementById("button4").onclick = function() {digitClick("4")};
document.getElementById("button5").onclick = function() {digitClick("5")};
document.getElementById("button6").onclick = function() {digitClick("6")};
document.getElementById("button7").onclick = function() {digitClick("7")};
document.getElementById("button8").onclick = function() {digitClick("8")};
document.getElementById("button9").onclick = function() {digitClick("9")};
document.getElementById("buttonA").onclick = function() {digitClick("A")};
document.getElementById("buttonB").onclick = function() {digitClick("B")};
document.getElementById("buttonC").onclick = function() {digitClick("C")};
document.getElementById("buttonD").onclick = function() {digitClick("D")};
document.getElementById("buttonE").onclick = function() {digitClick("E")};
document.getElementById("buttonF").onclick = function() {digitClick("F")};

document.getElementById("buttonPlus").onclick  = function() {operationClick("+")};
document.getElementById("buttonMinus").onclick = function() {operationClick("-")};
document.getElementById("buttonMul").onclick   = function() {operationClick("*")};
document.getElementById("buttonDiv").onclick   = function() {operationClick("/")};

document.getElementById("buttonOr").onclick         = function() {operationClick("|")};
document.getElementById("buttonAnd").onclick        = function() {operationClick("&")};
document.getElementById("buttonXor").onclick        = function() {operationClick("^")};
document.getElementById("buttonNot").onclick        = function() {operationClick("~")};
document.getElementById("buttonShiftLeft").onclick  = function() {operationClick("<<")};
document.getElementById("buttonShiftRight").onclick = function() { operationClick(">>")};

function formatClick() {
  var op = document.getElementById("buttonFormat").innerHTML;
  console.log(op);
  switch (op) {
    case "%d":
      document.getElementById("buttonFormat").innerHTML = "%x";
      document.getElementById("buttonA").setAttribute("disabled", "true");
      document.getElementById("buttonB").setAttribute("disabled", "true");
      document.getElementById("buttonC").setAttribute("disabled", "true");
      document.getElementById("buttonD").setAttribute("disabled", "true");
      document.getElementById("buttonE").setAttribute("disabled", "true");
      document.getElementById("buttonF").setAttribute("disabled", "true");
      document.getElementById("buttonOr").setAttribute("disabled", "true");
      document.getElementById("buttonAnd").setAttribute("disabled", "true");
      document.getElementById("buttonXor").setAttribute("disabled", "true");
      document.getElementById("buttonNot").setAttribute("disabled", "true");
      document.getElementById("buttonShiftLeft").setAttribute("disabled", "true");
      document.getElementById("buttonShiftRight").setAttribute("disabled", "true");
      fmtHex = false;
      break;
    case "%x":
      document.getElementById("buttonFormat").innerHTML = "%d";
      document.getElementById("buttonA").removeAttribute("disabled");
      document.getElementById("buttonB").removeAttribute("disabled");
      document.getElementById("buttonC").removeAttribute("disabled");
      document.getElementById("buttonD").removeAttribute("disabled");
      document.getElementById("buttonE").removeAttribute("disabled");
      document.getElementById("buttonF").removeAttribute("disabled");
      document.getElementById("buttonOr").removeAttribute("disabled");
      document.getElementById("buttonAnd").removeAttribute("disabled");
      document.getElementById("buttonXor").removeAttribute("disabled");
      document.getElementById("buttonNot").removeAttribute("disabled");
      document.getElementById("buttonShiftLeft").removeAttribute("disabled");
      document.getElementById("buttonShiftRight").removeAttribute("disabled");
      fmtHex = true;
      break;
    default:
      break;
  }
  formatLines(op);
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

function buildHtml() {
  // build results area
  var calc=$("#calculator");
  var results = $("<div></div>");
  results.addClass("results");
  for (i = MAX_LINES_SHOWN-1; i >= 0; i--) {
    line = $("<p></p>").addClass("result-line").attr("id", "line" + i);
    results.append(line);
  }
  line = $("<p></p>").addClass("result-line").attr("id", "digits");
  results.append(line);
  calc.append(results);

  // build rows of buttons
}

function setup() {
  buildHtml();
  clearDigits();
  clearLines();
}

setup();
