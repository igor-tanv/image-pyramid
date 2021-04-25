
const Tiler = {
  getMaxLevel(metadata) {
    return Math.floor(
      Math.log2(
        Math.max(metadata.width, metadata.height)
      )
    ) + 1
  }
};

module.exports = Tiler 