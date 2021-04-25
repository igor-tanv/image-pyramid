# Image Pyramid

Generate a pyramid of tiles for an image

## Installation

Require: node v14.15.1

## Usage

node index.js cat.jpg

## Tradeoffs

- Performance could be optimized by tiling the images in parallel. For very large images this may cause memory and performance issues.
- For production purposes, pyramid logic should be moved to a separate directory rather than the index entry file.
- Add more unit tests
