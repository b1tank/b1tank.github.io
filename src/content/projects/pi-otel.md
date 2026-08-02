---
title: "pi-otel"
description: "Vendor-neutral OpenTelemetry instrumentation for the Pi coding agent, exporting traces, metrics, and structured logs over OTLP."
status: "coming-soon"
category: "agent-systems"
featured: true
order: 2
updated: 2026-07-31T14:06:46-07:00
tags: ["opentelemetry", "pi", "agents", "typescript"]
---

pi-otel maps Pi’s agent lifecycle onto OpenTelemetry GenAI semantic conventions. Each interaction becomes a causal trace across model calls and tool executions, accompanied by latency, usage, cost, and lifecycle signals.

Content capture is opt-in, exporter failures never change agent behavior, and observability-tool results are redacted by default to prevent recursive telemetry feedback loops. The repository will become public with its first release.
