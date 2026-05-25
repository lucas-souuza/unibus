/** Posição de ônibus retornada por GET /api/onibus/posicoes */
export interface BusPosition {
  ordem: string;
  linha: string;
  latitude: number;
  longitude: number;
  pontoPartida: string;
  pontoFinal: string;
  routeLongName: string;
  velocidade: string;
}

export interface BusApiError {
  message: string;
}
