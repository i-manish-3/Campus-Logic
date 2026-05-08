
for (let i = 0; i < 12; i++) {
  const d = new Date(2026, i, 1);
  console.log(`${i}: ${d.toLocaleString('default', { month: 'short' })}`);
}
