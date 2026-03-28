#!/bin/bash

# Generate PNG icons from SVG using ImageMagick
convert -background none icon16.svg icon16.png
convert -background none icon16.svg -resize 48x48 icon48.png
convert -background none icon16.svg -resize 128x128 icon128.png

echo "Icons generated successfully!"
