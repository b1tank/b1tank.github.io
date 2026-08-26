---
title: "What Belongs in an App Store for Agents?"
description: "A practical map of the inputs, action tools, presentation tools, and monitoring an agent needs to do useful work."
published: 2026-01-31T10:16:05-08:00
draft: false
---

OpenSnipping ([yummyjars.com/opensnipping](https://yummyjars.com/opensnipping/), a browser-based screenshot and annotation tool) and OpenMathBoard ([lezhi.school](https://lezhi.school), an open-source math whiteboard) began as software for people. But why should they only be personal applications? A screenshot editor can also be an agent tool. A math whiteboard can become a surface where an agent helps prepare or explain a lesson.

An agent can sometimes write a temporary tool for itself. That does not mean every agent should rebuild a screenshot editor, browser, or media pipeline whenever it needs one. People can provide reliable APIs and SDKs that an agent runtime can call.

Those tools may be some of the most useful software to build.

## The four gaps

I see four basic gaps around an agent:

1. an input interface
2. action tools
3. result-presentation tools
4. monitoring for the agent itself

<figure class="diagram-figure">
  <img src="/images/writing/agent-tool-loop.svg" alt="A complete agent loop connecting human intent, input, the agent, action tools, files and services, result presentation, and observability." />
  <figcaption>The model sits in the middle, but useful work depends on input, action, presentation, and a visible trajectory.</figcaption>
</figure>

The model sits in the middle, but a useful product depends on the whole loop.

## Input is more than a chat box

Chat will remain the main input for many tasks. It is flexible and familiar. The agent also needs a way to stop and ask a focused question when the task is ambiguous. A small question tool can be more useful than another long message because it makes the decision explicit and gives the agent a structured answer.

The human should not need to micromanage every step. The basic relationship may feel like working with an assistant, a colleague, or a clone. I still need to assign the work, answer important questions, and decide whether the result is acceptable.

If the human is the bottleneck, launching many agents does not automatically help. A session manager should reduce the amount of coordination I perform, delegate work, inspect results, and improve how it uses the available agents.

## Action tools need reliable contracts

Agents already use complex general tools such as [Bash](https://www.gnu.org/software/bash/), browsers, and [FFmpeg](https://ffmpeg.org/). They also need narrower domain tools. OpenSnipping ([yummyjars.com/opensnipping](https://yummyjars.com/opensnipping/)) can provide image annotation and export. OpenMathBoard ([lezhi.school](https://lezhi.school)) can provide geometry and a teaching canvas. A repository tool can provide commits, issues, and pull requests without making the agent scrape a website.

The [Model Context Protocol](https://modelcontextprotocol.io/) gives tool providers a common way to expose capabilities and structured results. A protocol helps discovery and transport, but it does not make a tool good. The API still needs clear actions, bounded permissions, stable results, and useful errors.

A focused screenshot tool might expose a contract as small as this:

```json
{
  "name": "annotate_screenshot",
  "description": "Crop and annotate a screenshot, then return the saved image.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "image": { "type": "string" },
      "instructions": { "type": "string" }
    },
    "required": ["image", "instructions"]
  }
}
```

The contract tells the agent what it can do without forcing the model to understand the editor's internal implementation.

An agent tool store would make these capabilities easier to find. The human analogy is an assistant going to a store to get a printer instead of manufacturing a printer before finishing the assigned work.

## Results need their own tools

Completing an action is only half the job. The agent must present the result in a form that a person can inspect.

Different results need different surfaces:

- text for an explanation or decision
- a [Mermaid](https://mermaid.js.org/) diagram for a system relationship
- a chart for measurements or comparisons
- an image for a visual change
- a video for a workflow or interaction
- a live application when the result itself is interactive

Presentation tools should make verification easier. A generated diagram that hides the important detail is not better than plain text. A screenshot without the relevant state is not evidence. The output format should fit the question the human needs to answer.

## The agent also needs monitoring

A person cannot inspect only the final message and understand everything an agent did. We need a way to see the trajectory: model calls, tool calls, failures, retries, delegation, timing, and the evidence used to reach a conclusion.

This is where [OpenTelemetry](https://opentelemetry.io/) and agent observability become part of the tool system. Monitoring is not only for debugging the runtime. It helps the human decide whether the result deserves trust.

The monitoring surface should remain separate from the agent's ordinary output. Otherwise, the agent can end up reading its own observability results, writing them back into telemetry, and creating a feedback loop.

## What an agent store is really selling

A useful agent store would not only contain actions. It would contain the pieces needed for the full working relationship:

- ways to receive work
- tools that can act safely
- surfaces that can present evidence
- monitoring that can explain what happened

The store metaphor can be made more human. Action tools are equipment. Work can arrive from a direct manager, a freelance marketplace, or a benchmark. Results can be presented through text, images, video, or an interactive artifact.

The important part is not the metaphor itself. It is recognizing that a smarter model does not remove the need for well-designed tools. As agents become more capable, the quality of their inputs, actions, outputs, and monitoring will matter even more.
