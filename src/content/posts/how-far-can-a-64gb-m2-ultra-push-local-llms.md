---
title: "How Far Can a 64 GB M2 Ultra Push Local LLMs?"
description: "A practical test of Qwen 3.8, a fast Qwen MoE, oMLX, MTP, screenshots, long context, and a 284B DeepSeek model streamed from SSD with DwarfStar."
published: 2026-09-03T10:00:00-07:00
draft: true
---

I wanted a local model I could actually use: a coding agent with thinking, reliable tool calls, screenshot input, and enough context for a real repository. I also wanted to know where my Mac stopped being fast and started merely proving that something was possible.

The experiment grew one model at a time. I began with a normal 27B Qwen model, moved to the quantizations curated by [oMLX author Jun Kim](https://huggingface.co/Jundot/models), tried speculative decoding, found a much faster MoE, and finally loaded a 284B DeepSeek model through [DwarfStar](https://github.com/antirez/ds4). The last model can allocate a million-token context on this machine. That does not mean I want to wait for it.

> **Photo placeholder — Mac Studio and desk setup.** A landscape image would work well as the article cover.

## The answer first

| Use | Model and mode | What I measured |
| --- | --- | ---: |
| Fast daily agent | Qwen3.6 35B-A3B oQ4e + MTP | **104.4 tok/s** |
| Harder coding | Qwen3.8 27B oQ4e + FP16 MTP | **39.9 tok/s** |
| Reproducible long-context work | Qwen3.8 27B oQ4e, MTP off | **29.6 tok/s** |
| Higher-precision dense baseline | Qwen3.8 27B oQ6e, MTP off | **23.8 tok/s** |
| Oversized research model | DeepSeek V4 Flash Q2 at 32K | **11–13 steady tok/s** |
| DeepSeek at 262K | 16 GB expert cache | **5.75 steady tok/s** |

My current split is simple: use the MoE for quick agent loops, escalate difficult work to Qwen3.8, and treat DeepSeek V4 as a long-context research project.

## The machine

| Component | Specification |
| --- | --- |
| Computer | Mac Studio (`Mac14,14`) |
| Chip | Apple M2 Ultra |
| CPU | 24 cores: 16 performance, 8 efficiency |
| GPU | 60 cores |
| Unified memory | 64 GB |
| Memory bandwidth | 800 GB/s ([Apple](https://www.apple.com/newsroom/2023/06/apple-introduces-m2-ultra/)) |
| Internal storage | Approximately 1 TB SSD |
| Metal working-set recommendation | 51.84 GiB, measured from `MTLDevice` |
| Operating system | macOS 26.2 |
| Main runtime | [oMLX 0.6.4](https://github.com/jundot/omlx) |

Unified memory is why this works at all. CPU and GPU share the same pool, which is central to [MLX's design](https://ml-explore.github.io/mlx/build/html/usage/unified_memory.html). It is also why every browser tab, VM, KV cache, and model weight competes for the same 64 GB.

## How I tested

I did not set out to build a scientific leaderboard. The goal was to collect useful measurements, preserve the prompts and raw outputs, and make a practical decision for this one machine.

Each model saw the same small set of tests:

- cold and warm 512-token generation;
- long prompts with facts hidden near the beginning, middle, and end;
- a second request sharing most of the same prefix;
- structured tool calls;
- a screenshot-reading task;
- three small Python implementations executed against hidden assertions;
- thinking with a bounded reasoning budget;
- MTP off and on, where supported;
- process footprint and macOS Swap.

The code gates are smoke tests, not proof that one model is smarter. I recorded failures because they reveal different behavior, not because three toy functions settle model quality.

I present the results first, explain what each graph means, and leave enough detail for someone to reproduce the experiment.

## First baseline: dense Qwen3.8

I started with `mlx-community/Qwen3.8-27B-8bit`. It generated around **21.5 tok/s**, correctly read my terminal screenshot, produced valid tool calls, and retrieved all three hidden values from a 23K-token prompt. A repeated warm request reached the first token in 0.86 seconds.

The surprise was not generation. It was caching. The cold 23K prompt took 145 seconds. Reusing 20,480 cached tokens cut the next request to 21 seconds. For an agent that repeatedly sends the same tool definitions and conversation prefix, cache behavior matters more than a small decode improvement.

That model came from the MLX community, but once I realized the oMLX author publishes his own [oQ builds](https://huggingface.co/Jundot/models), I switched to those for a consistent runtime and quantization pipeline. The oQ format assigns precision based on measured sensitivity rather than giving every tensor the same width ([oMLX quantization notes](https://github.com/jundot/omlx/blob/main/docs/oQ_Quantization.md)).

## q4, q6, and q8

The first clean comparison used Jundot's Qwen3.8 27B oQ4e, oQ6e, and oQ8e checkpoints. All retained the vision tower and matching MTP weights.

| Result | oQ4e | oQ6e | oQ8e |
| --- | ---: | ---: | ---: |
| Model size reported by oMLX | 16.60 GB | 23.19 GB | 29.34 GB |
| Warm decode, MTP off | **29.6** | 23.8 | 20.6 |
| Warm decode, MTP on | 32.3 | 22.8 | **31.3** |
| Peak footprint in the comparison | **25 GiB** | 33 GiB | 39 GiB |
| Long retrieval | 3/3 | 3/3 | 3/3 |
| Tool call and screenshot | Pass | Pass | Pass |
| Executable code gates | 3/3 | 3/3 | 2/3 |

<figure class="diagram-figure">
  <img src="/images/writing/m2-ultra-qwen-throughput.svg" alt="Grouped bar chart comparing warm generation throughput for five Qwen configurations with MTP disabled and enabled." />
  <figcaption>MTP was not a universal speed button. It helped q8 substantially, barely helped q4, and made q6 slightly slower in this prompt.</figcaption>
</figure>

The q8 code miss was mundane: it returned a tuple where the test requested a list of tuples. That is not evidence that lower precision is smarter. It is evidence that one deterministic sample can still be weird.

I then used q4 in an actual chat. A 12,865-token prompt followed by 6,819 generated tokens sustained **26.2 tok/s**. After a clean restart, a 16,384-token answer sustained **26.9 tok/s** for ten minutes. The shorter 29.6 tok/s benchmark was real, but 26–27 tok/s better describes a long thinking session.

That is close to what the hardware can reasonably deliver. Qwen3.8-27B is dense: every generated token works through the model body. At 23 GB of q6 weights and 800 GB/s of memory bandwidth, even the naive bandwidth ceiling is only about 35 weight reads per second before attention, state, dequantization, and dispatch overhead.

> **Screenshot placeholder — oMLX model page showing q4, q6, and q8 together.** Include model sizes and context settings.

## The model that finally felt fast

Next I tried `Jundot/Qwen3.6-35B-A3B-oQ4e-mtp`. It stores roughly 35B parameters but activates about 3B for each token. All weights still occupy memory; the active parameter count controls how much work each token performs.

The difference was immediate:

| Qwen3.6 MoE test | Result |
| --- | ---: |
| Warm decode, MTP off | 82.1 tok/s |
| Warm decode, MTP on | **104.4 tok/s** |
| Thinking completion | ~97 tok/s |
| 15,359-token prompt | 14.8 seconds |
| Peak footprint | 26 GiB |
| Tool and screenshot tests | Pass |
| Executable code gates | 2/3 |

The thinking test produced 1,582 completion tokens. oMLX separated 4,061 characters of reasoning from a clean 2,468-character answer, and the server finished in 16.3 seconds after loading.

This is the first configuration that felt like an agent rather than a very knowledgeable person typing carefully. It is also an older model generation. One code answer contained unnecessary dead code, and another made an arguable interpretation of “touching” integer intervals. Speed makes iteration cheap; it does not remove the need to run tests.

<figure class="diagram-figure">
  <img src="/images/writing/m2-ultra-speed-memory.svg" alt="Scatter plot comparing peak memory and generation throughput for the tested Qwen configurations." />
  <figcaption>The MoE changes the shape of the tradeoff. It is both fast and modest in working memory because only a small expert subset runs per token.</figcaption>
</figure>

This pushed me toward a multi-model workflow: use different models for different jobs instead of pretending one model is best at everything.

## A better MTP head for Qwen3.8

`Jundot/Qwen3.8-27B-oQ4e-fp16-mtp` sounds like a full FP16 model. It is not. The target remains oQ4e; the higher-precision MTP support adds less than 1 GiB.

That small change mattered:

| Qwen3.8 q4 variant | MTP off | MTP on |
| --- | ---: | ---: |
| Normal MTP checkpoint | 29.6 tok/s | 32.3 tok/s |
| FP16 MTP checkpoint | 31.1 tok/s | **39.9 tok/s** |

It passed all three executable code gates and produced a clean thinking answer at roughly 35 completion tok/s. Its speculative output was not byte-identical between runs, so I would disable MTP for reproducible evaluation and enable it for interactive work.

> **Screenshot placeholder — side-by-side thinking response from Qwen3.6 MoE and Qwen3.8 FP16-MTP.** Show separated reasoning, final answer, and throughput.

## A 284B model from an 81 GiB file

Then I changed the question from “what is fast?” to “how far can this machine go?”

[DwarfStar](https://github.com/antirez/ds4) is a specialized DeepSeek V4 and GLM runtime by Salvatore Sanfilippo. Unlike ordinary MLX model loading, it can keep selected MoE experts in memory and stream the rest from SSD. The DeepSeek V4 Flash checkpoint I tested has 284B logical parameters, 13B active parameters, and a specialized 80.76 GiB Q2 layout. Sensitive tensors remain at Q8 or F16 while routed experts take most of the compression ([DwarfStar model documentation](https://github.com/antirez/ds4/blob/main/README.md)).

At 32K context, a 40 GiB expert-cache target was the fastest isolated result:

| DwarfStar mode | Steady decode | Peak footprint | Practical result |
| --- | ---: | ---: | --- |
| 32K, 32 GB expert target | 11.25 tok/s | 36.3 GB | Safe with normal desktop workload |
| 32K, 40 GB expert target | **13.20 tok/s** | 44.9 GB | Forced ~8.8 GiB Swap during real server use |
| 64K, 39 GB expert target | 10.15 tok/s | 43.7 GB | Works, but cold prefill takes minutes |
| 131K, 16 GB expert target | 6.35 tok/s | Lower cache budget | Capacity mode |
| 262K, 16 GB expert target | 5.75 tok/s | Lower cache budget | Capacity mode |

The isolated 40 GB result looked attractive until I ran the server alongside my normal VM, Docker, browser, and desktop applications. The process reached 41 GB and macOS created nearly 9 GiB of Swap. The 32 GB cache added no further Swap and became the honest recommendation.

<figure class="diagram-figure">
  <img src="/images/writing/m2-ultra-ds4-context.svg" alt="Line chart showing DwarfStar DeepSeek V4 generation throughput declining as context grows from 32K to 262K and the expert cache is reduced." />
  <figcaption>Longer context consumes the room that could otherwise hold experts. The model still runs, but more SSD traffic and more context work lower decode speed.</figcaption>
</figure>

## One million tokens fits

A full **1,048,576-token allocation succeeded** with a 16 GiB expert-cache target.

| 1M allocation component | Planned memory |
| --- | ---: |
| KV state | 8.39 GiB |
| Context buffers | 8.00 GiB |
| Resident model components | 2.81 GiB |
| Dynamic expert cache | 12.62 GiB |
| Prefill reserve | 3.38 GiB |
| **Total** | **35.20 GiB** |

This is a good demonstration of compressed attention and explicit SSD streaming. It is not a good interactive configuration. The measured prefill rate dropped from 174.6 tok/s at 131K to 106.9 tok/s for the next segment at 262K, while steady generation fell below 6 tok/s. Filling a million-token session would take hours.

The useful way to operate that mode would be to pay the initial prefill once, persist checkpoints, and reuse the same enormous prefix. For normal coding, Qwen at 128K or 256K is much faster.

The DwarfStar vision checkpoint did not survive the same experiment. Its image tokens reached a Metal range that the SSD-streaming model map had not covered, and prefill failed. Full residency is impossible on 64 GB, so Qwen remains my screenshot model.

> **Screenshot placeholder — DwarfStar terminal showing the successful 1M allocation.** Follow it with a smaller crop of the vision mapping error.

The failure belongs in the results: showing the mechanism and measurement is more useful than hiding an inconvenient outcome.

## What I would use today

| Situation | Choice |
| --- | --- |
| Fast daily thinking agent | Qwen3.6 35B-A3B oQ4e, MTP on, 128K |
| Difficult coding or review | Qwen3.8 27B oQ4e FP16-MTP, 128K |
| Reproducible automation | Qwen3.8 27B oQ4e, MTP off |
| Maximum practical Qwen context | Qwen3.8 27B oQ4e, 256K ceiling |
| Higher-precision dense work | Qwen3.8 27B oQ6e, 128K |
| Oversized model research | DeepSeek V4 Q2, 32K and 32 GB expert cache |
| Million-token experiment | DeepSeek V4 Q2, 16 GB expert cache, patience |

The main lesson is not that one model won. Architecture won different rounds. Dense Qwen3.8 gave me stronger recent-model behavior at 20–40 tok/s. Qwen3.6 MoE crossed 100 tok/s and felt dramatically better for repeated agent steps. DwarfStar made an 81 GiB checkpoint and a million-token allocation possible on a 64 GB machine, but capacity and usability separated quickly.

The other lesson is that local inference is a whole-system test. A clean benchmark can say “no Swap” while the same configuration disrupts a real desktop. A model switch can temporarily keep two sets of weights resident. Prefix caching can save more time than speculative decoding. The number worth keeping is not the highest token rate; it is the configuration I still want to use the next day.

## Sources and reproducibility

1. Apple, [Apple introduces M2 Ultra](https://www.apple.com/newsroom/2023/06/apple-introduces-m2-ultra/).
2. Apple ML Research, [MLX](https://github.com/ml-explore/mlx) and [Unified Memory](https://ml-explore.github.io/mlx/build/html/usage/unified_memory.html).
3. Jun Kim, [oMLX](https://github.com/jundot/omlx), [oQ quantization](https://github.com/jundot/omlx/blob/main/docs/oQ_Quantization.md), and [Jundot model collection](https://huggingface.co/Jundot/models).
4. Qwen Team, [Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B).
5. Salvatore Sanfilippo, [DwarfStar](https://github.com/antirez/ds4) and its [DeepSeek V4 synopsis](https://github.com/antirez/ds4/blob/main/MODEL_CARD.md).
6. DeepSeek, [DeepSeek V4 Flash](https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash).
7. Raw prompts, logs, and result files: [`b1tank/ds4`, `research/m2-ultra-runtime-comparison`](https://github.com/b1tank/ds4/tree/research/m2-ultra-runtime-comparison/research/m2-ultra).

All throughput and memory figures are measurements from this one machine. They are useful for choosing my configuration, not a universal model ranking.
