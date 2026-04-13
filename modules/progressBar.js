function getProgress(current = 0, required = 20) {
  const totalBars = 10;
  const filledBars = Math.round((current / required) * totalBars);
  const emptyBars = totalBars - filledBars;

  const bar = "█".repeat(filledBars) + "░".repeat(emptyBars);
  const percent = Math.min(100, Math.floor((current / required) * 100));

  return { bar, percent };
}

module.exports = getProgress;
