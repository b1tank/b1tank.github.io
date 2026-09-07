---
title: "The Missing Half of AI Education"
description: "AI can personalize learning, but it can also help teachers and domain experts turn hard-won knowledge into trusted, interactive material."
published: 2026-09-06T22:30:00-07:00
draft: true
---

AI can reduce the amount of work people need to do. That is one of its great promises. But work has also been one of the main ways people learn. We learn by drafting, calculating, debugging, revising, explaining, and trying again. When AI performs those steps for us, it can remove drudgery, but it can also remove the practice through which judgment is formed.

At the same time, AI is changing the job market faster than most educational systems can adapt. Some tasks will disappear. Existing roles will absorb new tools. New roles will demand combinations of skills that did not previously belong together. The result is a paradox: AI may reduce how much work humans perform directly, while increasing how much and how often humans need to learn.

> **As AI does more of our work, it can also take away the learning that work provides. In a changing job market, we must learn more, not less - and wield AI to advance education, not replace it.**

This is not an argument against AI in education. It is an argument for using it deliberately. AI can help teachers create, help learners practice, and make excellent instruction available to more people. But the goal should be deeper human understanding, not merely faster completion.

## Education has two hard paths

I increasingly see two distinct problems in education:

1. How does valuable knowledge become trustworthy learning material?
2. How does that material become a learning experience suited to one person?

The second problem receives much of the attention. Once a body of material exists, AI can help plan a path, adjust the pace, generate examples, answer questions, and provide feedback. [LearnVector](https://learnvector.ai/), founded by Andrew Ng, describes this as moving learning from one-to-many toward one-to-one. It plans to combine personalized guidance with authoritative material, including material from Coursera.

That is an important direction. A learner should not have to follow the same sequence, explanation, and pace as everyone else.

But there is another half of the equation: where does the trustworthy material come from in the first place?

## Good knowledge is often trapped at the source

Some of the best teaching material is not on the public web. It lives in the head of an experienced teacher, in handwritten notes, in old Word documents, in classroom examples refined over decades, or in explanations that have only ever been delivered in person.

My dad taught mathematics for many years. His material contains more than formulas and answers. It contains choices about sequence, recurring student mistakes, useful diagrams, and methods that became clearer through repeated teaching. That knowledge is valuable because a human expert has tested and refined it.

The problem is not that he lacks material. The problem is the path from his material to something that students can easily discover, navigate, and learn from.

That is why I built [乐之翁](https://lezhiweng.com). I used software and coding agents to turn his handwritten and word-processed material into a structured web experience with polished formulas, diagrams, navigation, and multiple learning paths. AI made the conversion dramatically easier. It could help transcribe, restructure, format, and implement. But it did not supply the underlying teaching judgment. That still came from my dad.

Without access to agents and engineering skills, teachers like him have few practical ways to make this transition. They can upload a PDF, record a video, or hand material to a publisher, but each option loses something. A PDF is difficult to navigate and adapt. A video is hard to revise and search. Traditional publishing is slow and selective. Building a rich interactive site remains beyond the reach of most individual teachers.

This looks like a large and underserved market gap: the path from teacher or expert to high-quality learning material.

## AI can be the production system, not the authority

The wrong version of this idea is a machine that generates endless generic courses from the open web. We already have more generated explanations than anyone can read. Increasing the volume does not guarantee accuracy, coherence, or educational value.

The more useful model starts with a trusted human source. A teacher, researcher, maintainer, craftsperson, or domain expert supplies the knowledge and remains the editorial authority. AI helps turn that knowledge into forms that are easier to distribute and learn from.

Such a system could help an expert:

- ingest handwritten notes, documents, slides, recordings, examples, and exercises;
- organize them into concepts, prerequisites, lessons, and learning paths;
- convert formulas, diagrams, and demonstrations into interactive web content;
- generate alternative explanations and practice while preserving the source;
- identify gaps, inconsistencies, and places that need human review;
- publish once and adapt the presentation for different learners;
- maintain provenance so learners know what came from the expert and what AI produced.

The expert should approve the structure and final material. The agent should make production cheaper without pretending to be the source of truth.

In that sense, the opportunity is not merely an AI course generator. It is infrastructure for distilling and distributing human expertise.

## The other side is personal learning

Once trusted material exists, AI can make it personal. This is where the direction described by [LearnVector](https://learnvector.ai/) becomes complementary rather than competitive. Its stated focus is a trustworthy, one-to-one learning guide that plans a path with the learner, adapts to how the learner learns, and stays until the learner has mastered the skill.

I think both sides are necessary:

- **Expert to material:** help people who know something deeply turn that knowledge into a durable learning resource.
- **Material to learner:** help each person navigate trustworthy material according to a goal, current ability, and preferred way of learning.

A strong education platform could connect the two. It could preserve the authority of the teacher while using AI to make the material interactive and adaptive. It could serve teachers and institutions as a business product, while also serving individual learners directly. In that sense, the same platform could support both business and consumer use without forcing either side into a generic chatbot.

## Learning paths can also close the hiring gap

The same structure applies to technical hiring.

Suppose I want to work at a company whose product requires a specialized combination of terminal internals, native application development, remote sessions, systems programming, and agent workflows. A conventional computer science course is too broad. A list of interview questions is too shallow. Reading a large codebase without a path is too slow.

[Superlogical](https://www.superlogical.com/) is an example that interests me. It is building a terminal multiplexer intended to connect local development, remote environments, production systems, people, and agents. Preparing to contribute to a product like that requires more than passing a general coding interview. It requires domain knowledge and evidence that I can apply it.

The candidate and the company have opposite sides of the same problem. I want a credible path into the domain. The company wants people who can become effective in a specialized domain, but the pool of obvious experts is small.

A learning platform could turn a domain into a structured, project-based path. Public repositories, architecture documents, talks, issue histories, and expert explanations could become a curriculum. Learners could build smaller versions of important subsystems, test them, explain tradeoffs, and produce artifacts that demonstrate real understanding.

That would not guarantee a job, and it should not pretend to. It would do something more useful than another interview-preparation site: help motivated engineers become plausible contributors to difficult systems.

## Why I started Learn Ghostty

This is one reason I started [Learn Ghostty](https://b1tank.github.io/learn-ghostty/), an early and experimental project that reconstructs a terminal one observable subsystem at a time.

I have at least three motivations for building it.

First, I want to learn the domain myself. Rebuilding a small terminal forces me to understand process ownership, pseudoterminals, input and output, rendering, native windows, and the boundaries between them. Reading alone does not create the same pressure to understand.

Second, I am genuinely curious about the technology. Even if I imagine myself retired and no longer optimizing for a job, I would still want to know how these systems work. Curiosity is enough reason to learn.

Third, I would like the work to make me a stronger candidate for a company operating in this space. A public learning project can show agency, persistence, technical depth, and the ability to explain a system. Those qualities are difficult to communicate through a resume line or an algorithm exercise.

These motivations reinforce one another. The project is useful to me even if no company ever notices it. If others can learn from it, the value grows. If it eventually helps connect me to relevant work, that is another outcome built on the same honest effort.

## The precedents are already visible

This idea does not begin from nothing. [CodeCrafters](https://codecrafters.io/) teaches experienced developers by having them rebuild tools such as Redis, Git, and SQLite. [Build Your Own X](https://github.com/codecrafters-io/build-your-own-x) collects tutorials for learning technologies through implementation. Both recognize that building a smaller version of a real system can turn abstract knowledge into working ability.

There should be more material like this, across more domains and subjects. There should also be better infrastructure for experts to create it.

LeetCode-style preparation solved a problem for an earlier hiring market. It made algorithm practice legible, repeatable, and easy to evaluate. That remains useful, but it is not sufficient for a market that increasingly values agency and deep domain knowledge.

A startup founder can point to a product built from nothing. An open source maintainer can point to years of decisions, reviews, and responsibility inside a real system. Those are strong signals because they show more than isolated problem solving. They show the ability to enter an ambiguous domain, learn what matters, make tradeoffs, and finish useful work.

Most candidates do not have the time or opportunity to become founders or core maintainers before applying for their next role. Better project-based learning could give more people a credible path to develop and demonstrate the same underlying qualities.

## What the platform might become

I can imagine a platform with three connected participants.

**Experts and educators** bring knowledge, source material, and judgment. The platform helps them distill that knowledge into structured, interactive content without requiring a software team.

**Learners** bring goals. The platform helps them choose a path, understand prerequisites, practice actively, receive feedback, and create evidence of mastery.

**Organizations** bring real domains and capability gaps. They can support learning paths around the systems, tools, and problems they need people to understand.

The product could begin narrowly. It might first help one teacher turn private notes into a mathematics course, or help one engineer turn an open source codebase into a reconstruction workshop. Over time, the same primitives could support many subjects:

- source ingestion and provenance;
- human review and approval;
- curriculum and prerequisite mapping;
- interactive examples and exercises;
- adaptive explanations and practice;
- project environments and automated feedback;
- publishing, discovery, and distribution;
- portfolios that show what a learner can actually do.

The business model could also span both sides. Educators, schools, and companies could pay for creation, management, and private distribution. Individual learners could pay for guided paths, feedback, and advanced environments. Public material could remain freely accessible where the creator chooses.

## Principles I would not want to lose

If I build further in this direction, several principles matter to me.

### Start with human-curated knowledge

AI should help express and organize expertise, not erase its origin. Learners should be able to see the sources and understand who stands behind the material.

### Optimize for learning, not answer production

A tool that finishes every task may improve short-term output while weakening long-term ability. The system should choose when to explain, when to ask, when to demonstrate, and when to let the learner struggle productively.

### Make knowledge active

The best technical learning often ends in something that runs. The best mathematics learning ends in a method the student can apply. Content should lead toward practice, feedback, and creation.

### Keep the human in control

Teachers should control what is taught. Learners should understand when and how AI is helping. Organizations should not reduce education to an opaque filter for candidates.

### Reward the source

If a teacher or expert contributes the knowledge that makes a learning experience valuable, the system should preserve attribution and create a path for that person to benefit.

## My bet

My bet is that AI makes education more important, not less.

It will automate tasks and remove some of the practice that used to come naturally through work. It will reshape jobs and force people to learn new combinations of skills. It will also make it far cheaper to turn expert knowledge into polished material and to adapt that material to an individual learner.

The opportunity is to connect those forces responsibly: help humans preserve what they know, help other humans learn it deeply, and use AI to strengthen the path between them.

Today, I am doing that on a very small scale. I am turning my dad's mathematics material into [乐之翁](https://lezhiweng.com), and I am turning my own curiosity about terminal systems into [Learn Ghostty](https://b1tank.github.io/learn-ghostty/). Both projects are early, but together they point toward the same idea.

There may be millions of experts with valuable knowledge trapped in private materials, and millions of learners trying to enter domains that existing courses do not reach. AI can help bridge that gap. The hard and worthwhile part is making sure that human knowledge, human judgment, and human learning remain at the center.
