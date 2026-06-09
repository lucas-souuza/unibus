#!/usr/bin/env python3
"""
Gera gráficos (latência, vazão, concorrência) a partir do NDJSON do k6 e do summary JSON.
Atualiza docs/report-data.json e docs/index.html (embed de métricas).
"""
from __future__ import annotations

import argparse
import json
import re
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt  # noqa: E402

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
CHARTS = ROOT / "results" / "charts"
INTERVALS_SEC = (1, 5, 10, 30, 60)


def load_ndjson(path: Path) -> list[dict]:
    rows = []
    if not path.exists():
        return rows
    with path.open(encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                rows.append(json.loads(line))
            except json.JSONDecodeError:
                continue
    return rows


def http_points(rows: list[dict]) -> list[dict]:
    out = []
    for row in rows:
        if row.get("type") != "Point" or row.get("metric") != "http_reqs":
            continue
        data = row.get("data") or {}
        tags = data.get("tags") or {}
        if tags.get("expected_response") == "false":
            continue
        t = data.get("time")
        if t is None:
            continue
        out.append({"t": parse_time(t), "vu": data.get("tags", {}).get("vu")})
    return out


def duration_points(rows: list[dict]) -> list[dict]:
    out = []
    for row in rows:
        if row.get("type") != "Point" or row.get("metric") != "http_req_duration":
            continue
        data = row.get("data") or {}
        t = data.get("time")
        val = data.get("value")
        if t is None or val is None:
            continue
        out.append({"t": parse_time(t), "ms": float(val)})
    return out


def vu_points(rows: list[dict]) -> list[dict]:
    out = []
    for row in rows:
        if row.get("type") != "Point" or row.get("metric") != "vus":
            continue
        data = row.get("data") or {}
        t = data.get("time")
        val = data.get("value")
        if t is None or val is None:
            continue
        out.append({"t": parse_time(t), "vus": float(val)})
    return out


def parse_time(value) -> float:
    if isinstance(value, (int, float)):
        return float(value) / 1e9 if value > 1e12 else float(value)
    s = str(value)
    try:
        dt = datetime.fromisoformat(s.replace("Z", "+00:00"))
        return dt.timestamp()
    except ValueError:
        return 0.0


def bucket_avg(points: list[dict], value_key: str, window: int) -> tuple[list[float], list[float]]:
    if not points:
        return [], []
    t0 = min(p["t"] for p in points)
    buckets: dict[int, list[float]] = defaultdict(list)
    for p in points:
        idx = int((p["t"] - t0) // window)
        buckets[idx].append(p[value_key])
    xs = sorted(buckets)
    ys = [sum(buckets[i]) / len(buckets[i]) for i in xs]
    return [i * window for i in xs], ys


def bucket_rate(points: list[dict], window: int) -> tuple[list[float], list[float]]:
    if not points:
        return [], []
    t0 = min(p["t"] for p in points)
    buckets: dict[int, int] = defaultdict(int)
    for p in points:
        idx = int((p["t"] - t0) // window)
        buckets[idx] += 1
    xs = sorted(buckets)
    ys = [buckets[i] / window for i in xs]
    return [i * window for i in xs], ys


def vu_series(vus: list[dict]) -> tuple[list[float], list[float]]:
    """Retorna (xs_relativos, ys_vus) prontos para plotar."""
    if not vus:
        return [], []
    t0 = min(p["t"] for p in vus)
    return [p["t"] - t0 for p in vus], [p["vus"] for p in vus]


def throughput_by_interval(reqs: list[dict]) -> dict[str, float]:
    if len(reqs) < 2:
        return {f"{w}s": 0.0 for w in INTERVALS_SEC}
    t0, t1 = reqs[0]["t"], reqs[-1]["t"]
    span = max(t1 - t0, 1e-6)
    total = len(reqs)
    avg = total / span
    return {f"{w}s": round(avg, 3) for w in INTERVALS_SEC}


def plot_three(service: str, durations: list[dict], reqs: list[dict], vus: list[dict]) -> dict:
    """
    Gera dois gráficos com eixo Y duplo:
      - <service>-latencia-vus.png : Latência média (ms) + VUs simultâneos
      - <service>-vazao-vus.png    : Vazão (req/s) + VUs simultâneos
    """
    CHARTS.mkdir(parents=True, exist_ok=True)
    docs_charts = DOCS / "charts"
    docs_charts.mkdir(parents=True, exist_ok=True)

    vu_xs, vu_ys = vu_series(vus)

    # ── Gráfico 1: Latência média + VUs ──────────────────────────────────────
    fig1, ax1_lat = plt.subplots(figsize=(10, 4))
    fig1.suptitle(f"Latência média × Concorrência — {service}", fontsize=13)

    if durations:
        xs, ys = bucket_avg(durations, "ms", 5)
        ax1_lat.plot(xs, ys, color="#2563eb", linewidth=1.5, label="Latência média (ms)")
    ax1_lat.set_xlabel("Tempo relativo (s)")
    ax1_lat.set_ylabel("Latência (ms)", color="#2563eb")
    ax1_lat.tick_params(axis="y", labelcolor="#2563eb")
    ax1_lat.grid(True, alpha=0.25)

    ax1_vu = ax1_lat.twinx()
    if vu_xs:
        ax1_vu.plot(vu_xs, vu_ys, color="#dc2626", linewidth=1.2,
                    linestyle="--", label="VUs")
    ax1_vu.set_ylabel("VUs simultâneos", color="#dc2626")
    ax1_vu.tick_params(axis="y", labelcolor="#dc2626")

    # Legenda unificada
    lines1, labels1 = ax1_lat.get_legend_handles_labels()
    lines2, labels2 = ax1_vu.get_legend_handles_labels()
    ax1_lat.legend(lines1 + lines2, labels1 + labels2, loc="upper left", fontsize=9)

    fig1.tight_layout()
    name_lat = f"{service}-latencia-vus.png"
    fig1.savefig(CHARTS / name_lat, dpi=120)
    (docs_charts / name_lat).write_bytes((CHARTS / name_lat).read_bytes())
    plt.close(fig1)

    # ── Gráfico 2: Vazão + VUs ────────────────────────────────────────────────
    fig2, ax2_req = plt.subplots(figsize=(10, 4))
    fig2.suptitle(f"Vazão × Concorrência — {service}", fontsize=13)

    if reqs:
        xs, ys = bucket_rate(reqs, 5)
        ax2_req.plot(xs, ys, color="#16a34a", linewidth=1.5, label="Vazão (req/s)")
    ax2_req.set_xlabel("Tempo relativo (s)")
    ax2_req.set_ylabel("Vazão (req/s)", color="#16a34a")
    ax2_req.tick_params(axis="y", labelcolor="#16a34a")
    ax2_req.grid(True, alpha=0.25)

    ax2_vu = ax2_req.twinx()
    if vu_xs:
        ax2_vu.plot(vu_xs, vu_ys, color="#dc2626", linewidth=1.2,
                    linestyle="--", label="VUs")
    ax2_vu.set_ylabel("VUs simultâneos", color="#dc2626")
    ax2_vu.tick_params(axis="y", labelcolor="#dc2626")

    lines1, labels1 = ax2_req.get_legend_handles_labels()
    lines2, labels2 = ax2_vu.get_legend_handles_labels()
    ax2_req.legend(lines1 + lines2, labels1 + labels2, loc="upper left", fontsize=9)

    fig2.tight_layout()
    name_vazao = f"{service}-vazao-vus.png"
    fig2.savefig(CHARTS / name_vazao, dpi=120)
    (docs_charts / name_vazao).write_bytes((CHARTS / name_vazao).read_bytes())
    plt.close(fig2)

    return {
        "chart_latencia_vus": f"charts/{name_lat}",
        "chart_vazao_vus": f"charts/{name_vazao}",
        "throughput_intervals": throughput_by_interval(reqs),
        "max_vus": max(vu_ys, default=0),
        "avg_latency_ms": round(
            sum(p["ms"] for p in durations) / len(durations), 2
        ) if durations else None,
        "total_requests": len(reqs),
    }


def load_summary(path: Path) -> dict:
    if not path.exists():
        return {}
    return json.loads(path.read_text(encoding="utf-8"))


def summary_metrics(summary: dict) -> dict:
    m = summary.get("metrics") or {}
    def avg(name):
        metric = m.get(name) or {}
        values = metric.get("values") or {}
        return values.get("avg")

    return {
        "http_req_duration_avg": avg("http_req_duration"),
        "http_reqs_rate": avg("http_reqs"),
        "http_req_failed_rate": avg("http_req_failed"),
        "vus_max": (m.get("vus_max") or {}).get("values", {}).get("max"),
    }


def update_report_data(service: str, stats: dict, summary_path: Path) -> None:
    data_file = DOCS / "report-data.json"
    if data_file.exists():
        data = json.loads(data_file.read_text(encoding="utf-8"))
    else:
        data = {"generated_at": None, "services": {}}

    data["generated_at"] = datetime.now(timezone.utc).isoformat()
    data["services"][service] = {
        **stats,
        "summary_file": summary_path.name,
        "measured_at": datetime.now().strftime("%d/%m/%Y"),
    }
    data_file.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--service", required=True, choices=["posicoes", "ocorrencias"])
    parser.add_argument("--summary", required=True)
    parser.add_argument("--raw", required=True)
    args = parser.parse_args()

    raw_path = Path(args.raw)
    summary_path = Path(args.summary)
    rows = load_ndjson(raw_path)
    durations = duration_points(rows)
    reqs = http_points(rows)
    vus = vu_points(rows)

    stats = plot_three(args.service, durations, reqs, vus)
    stats.update(summary_metrics(load_summary(summary_path)))
    update_report_data(args.service, stats, summary_path)
    print(f"Gráficos e report-data atualizados para {args.service}")


if __name__ == "__main__":
    main()
