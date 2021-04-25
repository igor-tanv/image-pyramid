const Tiler = require("../src/utils")
const sharp = require("sharp")

test('max level equals 11', async () => {
  expect(Tiler.getMaxLevel(await sharp('./cat.jpg').metadata())).toEqual(11)
});

