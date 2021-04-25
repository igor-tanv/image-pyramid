// Dependencies
const sharp = require('sharp');
const path = require("path")
const fs = require("fs").promises
const Tiler = require("./utils")

// Constants
const INPUT_IMAGE_PATH = process.argv[2];
const VERBOSE = process.argv.includes("--verbose")
const TILE_SIZE = 256;

// Validate the image path
if (!INPUT_IMAGE_PATH) {
  console.error("Please enter an image path. Usage: node index.js cat.jpg")
  process.exit(1)
  return;
}
// Create <image>-tiles-output directory
const IMAGE_OUTPUT_DIR = `${path.basename(INPUT_IMAGE_PATH).split(".")[0]}-tiles-output`;

// Enable verbose logs
const log = (...args) => {
  if (VERBOSE) {
    console.log(...args)
  }
}
// Try to create a directory and fail silently with a warning instead
const tryMkdir = async path => {
  try {
    await fs.mkdir(path)
  } catch (e) {
    console.warn(`${path} already exists. Tile content will be overridden.`)
  }
};

(async () => {
  // 1. Read the image
  let image = sharp(INPUT_IMAGE_PATH);

  // 2. Read the metadata
  let metadata = await image.metadata();
  log("Read the metadata scucessfully.")

  // 3. Get the max level
  const maxLevel = Tiler.getMaxLevel(metadata)
  log(`MaxLevel is: ${maxLevel}`)

  // 4. Create the image output directory
  await tryMkdir(IMAGE_OUTPUT_DIR)

  // 5. Start looping the levels
  for (let level = 0; level <= maxLevel; ++level) {

    // 6. Create the level directory
    const LEVEL_PATH = `${IMAGE_OUTPUT_DIR}/${level}`
    await tryMkdir(LEVEL_PATH)

    // 7. Compute how many rows & columns are for the current resolution
    const columns = Math.ceil(metadata.width / TILE_SIZE)
    const rows = Math.ceil(metadata.height / TILE_SIZE)

    // 8. Iterate the columns and the rorws
    for (let c = 0; c < columns; ++c) {
      for (let r = 0; r < rows; ++r) {
        const tile = {
          x: c * TILE_SIZE,
          y: r * TILE_SIZE,
          w: TILE_SIZE,
          h: TILE_SIZE
        }

        if (tile.w + tile.x > metadata.width) {
          tile.w = metadata.width - tile.x
        }

        if (tile.h + tile.y > metadata.height) {
          tile.h = metadata.height - tile.y
        }

        const currentTilePath = `${LEVEL_PATH}/${tile.x}_${tile.y}.jpg`

        // TODO Can be optimized with parallel promises
        await image.clone().extract({
          left: tile.x,
          top: tile.y,
          width: tile.w,
          height: tile.h,
        }).toFile(currentTilePath)
      }
    }

    image = sharp(await image.resize({
      width: Math.round(metadata.width / 2),
      height: Math.round(metadata.height / 2)
    }).toBuffer());
    metadata = await image.metadata();
  }
})()
