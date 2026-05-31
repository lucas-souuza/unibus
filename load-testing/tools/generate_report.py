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


def throughput_by_interval(reqs: list[dict]) -> dict[str, float]:
    if len(reqs) < 2:
        return {f"{w}s": 0.0 for w in INTERVALS_SEC}
    t0, t1 = reqs[0]["t"], reqs[-1]["t"]
    span = max(t1 - t0, 1e-6)
    total = len(reqs)
    avg = total / span
    return {f"{w}s": round(avg, 3) for w in INTERVALS_SEC}


def plot_three(service: str, durations: list[dict], reqs: list[dict], vus: list[dict]) -> dict:
    CHARTS.mkdir(parents=True, exist_ok=True)
    prefix = CHARTS / service

    fig, axes = plt.subplots(3, 1, figsize=(10, 9), sharex=False)
    fig.suptitle(f"Teste de carga — {service}", fontsize=14)

    if durations:
        xs, ys = bucket_avg(durations, "ms", 5)
        axes[0].plot(xs, ys, color="#2563eb", linewidth=1.5)
    axes[0].set_ylabel("ms")
    axes[0].set_title("Latência média (janelas de 5s)")
    axes[0].grid(True, alpha=0.3)

    if reqs:
        xs, ys = bucket_rate(reqs, 5)
        axes[1].plot(xs, ys, color="#16a34a", linewidth=1.5)
    axes[1].set_ylabel("req/s")
    axes[1].set_title("Vazão (requisições por segundo, janela 5s)")
    axes[1].grid(True, alpha=0.3)

    if vus:
        xs = [p["t"] - min(p["t"] for p in vus) for p in vus]
        axes[2].plot(xs, [p["vus"] for p in vus], color="#dc2626", linewidth=1.2)
    axes[2].set_ylabel("VUs")
    axes[2].set_xlabel("Tempo relativo (s)")
    axes[2].set_title("Concorrência (usuários virtuais simultâneos)")
    axes[2].grid(True, alpha=0.3)

    plt.tight_layout()
    chart_name = f"{service}-evolucao.png"
    chart_path = CHARTS / chart_name
    fig.savefig(chart_path, dpi=120)
    plt.close(fig)

    docs_charts = DOCS / "charts"
    docs_charts.mkdir(parents=True, exist_ok=True)
    (docs_charts / chart_name).write_bytes(chart_path.read_bytes())

    return {
        "chart": f"charts/{chart_name}",
        "throughput_intervals": throughput_by_interval(reqs),
        "max_vus": max((p["vus"] for p in vus), default=0),
        "avg_latency_ms": round(
            sum(p["ms"] for p in durations) / len(durations), 2
        )
        if durations
        else None,
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
