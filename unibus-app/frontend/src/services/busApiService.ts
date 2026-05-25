import type { BusApiError, BusPosition } from '../types/bus';

const POSICOES_URL = '/api/onibus/posicoes';

export async function fetchBusPositions(): Promise<BusPosition[]> {
  const response = await fetch(POSICOES_URL, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    credentials: 'same-origin',
  });

  if (!response.ok) {
    let message = 'Não foi possível carregar as posições dos ônibus.';
    try {
      const body = (await response.json()) as BusApiError;
      if (body.message) {
        message = body.message;
      }
    } catch {
      // mantém mensagem padrão
    }
    throw new Error(message);
  }

  return (await response.json()) as BusPosition[];
}
