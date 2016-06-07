#! /usr/bin/make

ROOT_DIR := $(shell dirname $(realpath $(lastword $(MAKEFILE_LIST))))
PLUGIN_DIR_2 := ~/Library/Application\ Support/Sublime\ Text\ 2/Packages/Stepsize/
PLUGIN_DIR_3 := ~/Library/Application\ Support/Sublime\ Text\ 3/Packages/Stepsize/

install2:
	mkdir -p $(PLUGIN_DIR_2)
	cp $(ROOT_DIR)/SublimeStepsize.py $(PLUGIN_DIR_2)/SublimeStepsize.py

install3:
	mkdir -p $(PLUGIN_DIR_3)
	cp $(ROOT_DIR)/SublimeStepsize.py $(PLUGIN_DIR_3)/SublimeStepsize.py
