#
# Copyright (C) 2017 ThatNameGroup, LLC. and Al Piepho
#               All Rights Reserved
#
require 'optparse'
require 'ostruct'
require 'watir'

# TODO - could nokogiri help speed up testing?

###########################################################
# CONSTANTS and GLOBAL VARIABLES
###########################################################
APP_VERSION = "0.1"

$buttonAllIds = [
  "buttonDrop",           "buttonClr",   "buttonClrAll",     "buttonFormat",
  "button1",   "button2", "button3",     "buttonPlus",       "buttonOr",
  "button4",   "button5", "button6",     "buttonMinus",      "buttonAnd",
  "button7",   "button8", "button9",     "buttonMul",        "buttonXor",
  "buttonA",   "buttonB", "buttonC",     "buttonDiv",        "buttonNot",
  "buttonD",   "buttonE", "buttonF",     "buttonShiftLeft",  "buttonShiftRight",
  "buttonDot", "button0", "buttonEnter",                     "buttonChs"
]

$buttonHexOnlyIds = [
                                                             "buttonOr",
                                                             "buttonAnd",
                                                             "buttonXor",
  "buttonA",   "buttonB", "buttonC",                         "buttonNot",
  "buttonD",   "buttonE", "buttonF",     "buttonShiftLeft",  "buttonShiftRight",
  "buttonDot"
]

$resultIds = [
  "line3",
  "line2",
  "line1",
  "line0",
  "digits"
]

$fmtHex = true

#url = "file:///Users/Al/Projects/chrome_extensions/rpn_hex_calc/popup.html"

###########################################################
# program OPTIONS
###########################################################
$options = OpenStruct.new
parser = OptionParser.new do |opt|
    opt.on('-s', '--src <url>',  'url to web app')                  { |o| $options.src          = o    }
    opt.on('-D', '--Debug',      'debug mode, force hang at end')   { |o| $options.debug        = true }
    opt.on('-v', '--Version',    'show the current version.')       { |o| $options.version      = true }
end
parser.parse!

if $options.version
    puts "rpn_hex_test: version %s" % APP_VERSION
    exit
end
if $options.src.nil?
    puts "WARNING: please provide a src url"
    exit
end

def forceHang
  puts "WARNING: forcing hang!!! (use 'right-click-inspect' in Chrome to debug)"
  while true
    sleep(10)
  end
end

###########################################################
# BROWSER support
###########################################################
# do the browser click for given id
def click(id)
  $browser.button(:id => id).click
end

def resultValueStr(id)
  val = $browser.p(:id => id).text[3..-1]
  #val = val.to_i(16) if  $fmtHex
  #val = val.to_i(10) if !$fmtHex
  val
end

def inputValueStr()
  val = $browser.p(:id => "digits").text[2..-1]
  #val = val.to_i(16) if  $fmtHex
  #val = val.to_i(10) if !$fmtHex
  val
end

###########################################################
# ASSERT support
###########################################################
def assertResultVal(id, expected)
  # given expected int, convert to string
  # and compare vs string at id
  str = resultValueStr(id)
  expected = "%08X" % expected if     $fmtHex
  expected = "%d"   % expected if not $fmtHex
  puts "  DEBUG: result '%s'   expected '%s'" % [str, expected] if $options.debug
  if not expected.eql?(str)
    puts "ERROR: result '%s' != expected '%s'" % [str, expected]
    forceHang
  end
end

def assertResultEmp(id)
  # given expected string
  # compare vs string at id
  str = resultValueStr(id)
  puts "  DEBUG: result '%s'" % [str] if $options.debug
  if not str.nil? and str.length > 0
    puts "ERROR: result '%s' not empty" % [str]
    forceHang
  end
end

def assertInputValue(expected)
end

###########################################################
# TEST - format button
###########################################################
def test_ToggleFormat
  puts "SUITE: test_ToggleFormat"
  puts "  TEST: (hex) check disabled buttons"
  # only . should be disabled
  $buttonAllIds.each do |id|
    disabledVal = $browser.button(:id => id).attribute_value("disabled")
    puts "  DEBUG: id %s   result '%s'" % [id, disabledVal] if $options.debug
    if not id.eql?("buttonDot") and not disabledVal.nil?
      puts "ERROR: '%s' is disabled" % [id]
      forceHang
    end
    if id.eql?("buttonDot") and disabledVal.nil?
      puts "ERROR: '%s' is not disabled" % [id]
      forceHang
    end
  end

  puts "  TEST: toggle format to %d"
  $fmtHex = false
  click("buttonFormat")

  puts "  TEST: (dec) check disabled buttons"
  $buttonAllIds.each do |id|
    disabledVal = $browser.button(:id => id).attribute_value("disabled")
    puts "  DEBUG: id %s   result '%s'" % [id, disabledVal] if $options.debug
    if not $buttonHexOnlyIds.include?(id) and not disabledVal.nil?
      puts "ERROR: '%s' is disabled" % [id]
      forceHang
    end
    if $buttonHexOnlyIds.include?(id) and disabledVal.nil?
      puts "ERROR: '%s' is not disabled" % [id]
      forceHang
    end
  end

  puts "  TEST: toggle format to %x"
  $fmtHex = true
  click("buttonFormat")
end

###########################################################
# TEST - enter and drop
###########################################################
def test_EnterEachNumberThenDrop
  puts "SUITE: test_EnterEachNumberThenDrop"
  puts "  TEST: (hex) Each number with 'enter'"
  for i in 1..15 do
    click("button%X" % i)
    #puts inputValueStr()
    click("buttonEnter")
    assertResultVal("line0", i)
  end

  puts "  TEST: (hex) drop previous numbers from stack"
  for i in 0..14 do
    assertResultVal("line0", 15-i)
    click("buttonDrop")
    assertResultVal("line0", 15-i-1) if i  < 14
    assertResultEmp("line0")         if i == 14
  end

  puts "  TEST: toggle format to %%d"
  $fmtHex = false
  click("buttonFormat")

  puts "  TEST: (dec) Each number with 'enter'"
  for i in 1..9 do
    click("button%X" % i)
    #puts inputValueStr()
    click("buttonEnter")
    assertResultVal("line0", i)
  end

  puts "  TEST: (dec) drop previous numbers from stack"
  for i in 0..8 do
    assertResultVal("line0", 9-i)
    click("buttonDrop")
    assertResultVal("line0", 9-i-1) if i  < 8
    assertResultEmp("line0")        if i == 8
  end

  puts "  TEST: toggle format to %%x"
  $fmtHex = true
  click("buttonFormat")
end

###########################################################
# MAIN
###########################################################
$browser = Watir::Browser.new(:chrome)
$browser.window.resize_to(900, 800)
#$browser.window.move_to(400, 0)
$browser.goto($options.src)

puts "Title = " + $browser.title

# TESTS
test_ToggleFormat
#test_Clr
#test_ClrAll
test_EnterEachNumberThenDrop
#test_SimplePlus
  # hex/dec, op modes, chs
#test_SimpleMinus
#test_SimpleMul
#test_SimpleDiv
#test_SimpleOr
#test_SimpleAnd
#test_SimpleXor
#test_SimpleNot
#test_SimpleShiftLeft
#test_SimpleShiftRight
#test_Random

# DEBUG optional force hang
if $options.debug
  puts "  DEBUG: force hang"
  forceHang
end
