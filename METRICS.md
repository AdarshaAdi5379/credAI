# METRICS.md

## North Star metric
Completed audits per week.

Why: this is a single-use tool where value is delivered quickly; completions measure real delivered value, not vanity traffic.

## Input metrics (drivers)
1. Audit completion rate (landing → results)
2. Share rate (results → “copy link” / public report)
3. High-savings lead capture rate (> $500/mo savings audits → email submitted)

## What to instrument first
- Form start, form submit success/fail
- Time-to-results (audit engine + summary latency)
- Share click/copy success
- Lead form submission success/fail

## Pivot threshold
If after 2 weeks:
- >1,000 unique visitors
- but <3% complete the audit
…then the product is not communicating value clearly enough, and the landing+flow need a redesign before adding more features.
