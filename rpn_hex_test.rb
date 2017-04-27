#
# Copyright (C) 2017 ThatNameGroup, LLC. and Al Piepho
#               All Rights Reserved
#
require 'optparse'
require 'ostruct'
require 'watir'

require './test_format.rb'
require './test_clr.rb'
require './test_clrall.rb'
require './test_enter_drop.rb'
require './test_simple_plus.rb'
require './test_simple_minus.rb'
require './test_simple_mul.rb'
require './test_simple_div.rb'
require './test_simple_or.rb'
require './test_simple_and.rb'
require './test_simple_xor.rb'
require './test_simple_not.rb'
require './test_simple_shiftleft.rb'
require './test_simple_shiftright.rb'
require './test_random.rb'

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
  expected = expected.gsub(".", "F") # HACK don't know why getting ..FFFF32 instead of FFFFFF32
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
# MAIN
###########################################################
$browser = Watir::Browser.new(:chrome)
$browser.window.resize_to(900, 800)
#$browser.window.move_to(400, 0)
$browser.goto($options.src)

puts "Title = " + $browser.title

# TESTS
test_ToggleFormat
test_Clr
test_ClrAll
test_EnterEachNumberThenDrop
test_SimplePlus
test_SimpleMinus
test_SimpleMul
test_SimpleDiv
test_SimpleOr
test_SimpleAnd
test_SimpleXor
test_SimpleNot
test_SimpleShiftLeft
test_SimpleShiftRight
test_Random

# DEBUG optional force hang
if $options.debug
  puts "  DEBUG: force hang"
  forceHang
end
