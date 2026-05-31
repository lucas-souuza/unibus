#!/usr/bin/env python3
"""Gera 03-seed-linhas-gtfs.sql a partir de routes.txt (mesma lógica do RouteLongNameParser)."""
from __future__ import annotations

import csv
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
ROUTES = ROOT / "unibus-app" / "src" / "main" / "resources" / "data" / "gtfs" / "routes.txt"
OUT = Path(__file__).resolve().parent / "03-seed-linhas-gtfs.sql"


def parse_long_name(route_long_name: str) -> tuple[str, str]:
    if not route_long_name or not route_long_name.strip():
        return "", ""
    normalizado = route_long_name.strip()
    separador = " - "
    idx = normalizado.find(separador)
    if idx < 0:
        return normalizado, ""
    return normalizado[:idx].strip(), normalizado[idx + len(separador) :].strip()


def esc(value: str) -> str:
    return value.replace("\\", "\\\\").replace("'", "''")


def main() -> None:
    seen: set[str] = set()
    rows: list[tuple[str, str, str, str]] = []

    with ROUTES.open(encoding="utf-8", newline="") as f:
        for record in csv.DictReader(f):
            num = (record.get("route_short_name") or "").strip()
            if not num or num in seen:
                continue
            seen.add(num)
            long_name = (record.get("route_long_name") or "").strip()
            origem, destino = parse_long_name(long_name)
            nome = long_name or num
            rows.append((num, nome, origem, destino))

    values = [
        f"('{esc(n)}', '{esc(nome)}', '{esc(o)}', '{esc(d)}')"
        for n, nome, o, d in rows
    ]

    lines = [
        "-- Gerado por generate-linhas-gtfs.py a partir de routes.txt",
        f"-- Linhas unicas (route_short_name): {len(rows)}",
        "USE unibus;",
        "",
        "SET FOREIGN_KEY_CHECKS = 0;",
        "DELETE FROM ocorrencia;",
        "DELETE FROM linha;",
        "SET FOREIGN_KEY_CHECKS = 1;",
        "",
    ]

    chunk_size = 150
    for i in range(0, len(values), chunk_size):
        chunk = values[i : i + chunk_size]
        lines.append("INSERT INTO linha (numero_linha, nome_linha, origem, destino) VALUES")
        lines.append(",\n".join(chunk) + ";")
        lines.append("")

    OUT.write_text("\n".join(lines), encoding="utf-8")
    print(f"OK: {len(rows)} linhas -> {OUT}")


if __name__ == "__main__":
    main()
