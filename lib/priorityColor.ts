// Prioritas itu dinamis (bisa ditambah user), jadi warnanya dihitung dari
// `urutan`, bukan dari nama — makin tinggi urutan, makin "panas" warnanya
// (biru -> hijau -> oranye -> merah), supaya urgensi langsung kebaca sekilas.
export function priorityHue(urutan: number) {
  return Math.max(0, 210 - (urutan - 1) * 70);
}

export function priorityColor(urutan: number) {
  const hue = priorityHue(urutan);
  return {
    text: `hsl(${hue} 85% 65%)`,
    border: `hsl(${hue} 70% 45%)`,
    glow: `hsl(${hue} 85% 55% / 0.35)`,
  };
}
