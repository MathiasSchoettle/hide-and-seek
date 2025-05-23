# Latex Makefile using latexmk

JOB = slides
INPUT = main.tex
OUTPUT = build

.PHONY: all clean

all: paper

paper: $(INPUT)
	mkdir -p $(OUTPUT)
	# -lualatex                 use lualatex for processing files to pdf and turn dvi/ps modes off
	latexmk -lualatex -interaction=nonstopmode -jobname=$(OUTPUT)/$(JOB) $(INPUT)

clean:
	rm -rf build
