/**
 * Perfil de carga padrão: rampa de concorrência (VUs) + sustentação.
 * Ajuste stages conforme capacidade da máquina de teste.
 */
export const defaultStages = [
  { duration: '30s', target: 5 },
  { duration: '1m', target: 15 },
  { duration: '1m', target: 30 },
  { duration: '30s', target: 30 },
  { duration: '30s', target: 0 },
];

export function buildOptions(tags) {
  return {
    stages: defaultStages,
    thresholds: {
      http_req_failed: ['rate<0.05'],
      http_req_duration: ['p(95)<15000'],
    },
    tags,
    summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(90)', 'p(95)', 'p(99)'],
  };
}
