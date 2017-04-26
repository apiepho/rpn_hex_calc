#
# Copyright (C) 2017 ThatNameGroup, LLC. and Al Piepho
#               All Rights Reserved
#
require 'optparse'
require 'ostruct'
require 'watir'

APP_VERSION = "0.1"

#url = "file:///Users/Al/Projects/chrome_extensions/rpn_hex_calc/popup.html"

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

def enterEachNumberThenDrop
  puts "Each number with 'enter'"
  for i in 1..15 do
    $browser.button(:id => "button%X" % i).click
    $browser.button(:id => 'buttonEnter').click
    # TODO add test here
    puts $browser.p(:id => 'line0').text
  end

  puts "drop previous numbers from stack"
  for i in 1..15 do
    # TODO add test here
    puts $browser.p(:id => 'line0').text
    $browser.button(:id => 'buttonDrop').click
    # TODO add test here
    puts $browser.p(:id => 'line0').text
  end
end

$browser = Watir::Browser.new(:chrome)
$browser.window.resize_to(900, 800)
$browser.window.move_to(400, 0)
$browser.goto($options.src)

puts "Title = " + $browser.title

enterEachNumberThenDrop

forceHang if $options.debug
