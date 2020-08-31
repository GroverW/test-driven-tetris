const adjustColors = (obj, adjAmt, numSteps) => {
  const adjustedColors = {};
  Object.entries(obj).forEach(([type, rgb]) => {
    let [r, g, b] = rgb;
    r = Math.min(255, r + Math.floor(((255 - r) / numSteps) * adjAmt));
    g = Math.min(255, g + Math.floor(((255 - g) / numSteps) * adjAmt));
    b = Math.min(255, b + Math.floor(((255 - b) / numSteps) * adjAmt));
    adjustedColors[type] = `rgb(${r}, ${g}, ${b})`;
  });

  return adjustedColors;
};

const mapColors = (colors, numSteps) => (
  new Array(numSteps + 1)
    .fill(null)
    .map((_, i) => adjustColors(colors, i, numSteps))
);

module.exports = {
  adjustColors,
  mapColors,
};
