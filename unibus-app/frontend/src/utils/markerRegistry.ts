import type { BusPosition } from '../types/bus';

/**
 * Mantém o conjunto estável de veículos (ordem) para evitar recriar marcadores a cada poll.
 */
export function mergeBusPositions(
  previous: Map<string, BusPosition>,
  incoming: BusPosition[]
): Map<string, BusPosition> {
  const next = new Map(previous);

  for (const bus of incoming) {
    next.set(bus.ordem, bus);
  }

  const incomingOrders = new Set(incoming.map((b) => b.ordem));
  for (const ordem of next.keys()) {
    if (!incomingOrders.has(ordem)) {
      next.delete(ordem);
    }
  }

  return next;
}
