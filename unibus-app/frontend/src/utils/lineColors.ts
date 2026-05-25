/** Cores por linha — extensível para favoritos e alertas */
const LINE_COLORS: Record<string, string> = {
  '302': '#F5CF27',
  '415': '#27F5EB',
  '108': '#0B0B0B',
  '636': '#F14F95',
  '629': '#1B47B9',
  '774': '#1DA527',
};

const DEFAULT_COLOR = '#2563eb';

export function getLineColor(linha: string): string {
  return LINE_COLORS[linha] ?? DEFAULT_COLOR;
}
