# Marathon Plan Collection Guide

A reference for collecting new training plans so they drop cleanly into the app. No coding needed — just fill out the two pieces below for each plan and keep the labels exact.

You can collect each plan in a spreadsheet or a doc. What matters is that it has **(A) a summary block** and **(B) an 18-week schedule grid**, formatted as described here.

---

## Every plan needs two parts

### Part A — Summary block (the "card" details)

Six fields per plan. These show up on the plan-selection screen.

| Field | What it is | Example |
|-------|-----------|---------|
| **id** | A short lowercase code, no spaces. Use `level` + number. | `intermediate1` |
| **name** | Display name | `Intermediate 1` |
| **description** | One short sentence — who/what it's for | `Stepping up mileage with cross training.` |
| **runsPerWeek** | Number of running days per week | `5` |
| **peakMileage** | Highest weekly total in the plan | `45` |
| **bestFor** | Short audience tag | `Some experience, ready for more` |

> **id naming:** stick to the existing family — `novice1`, `novice2`, `intermediate1`, `intermediate2`, `advanced1`, `advanced2`. For new ones, keep the same style (e.g. `advanced3`, `recovery1`). All lowercase, no spaces.

### Part B — The 18-week schedule grid

**Every plan must be exactly 18 weeks long and have exactly 7 days per week.** If a source plan is a different length, flag it — don't pad or trim it yourself.

Lay it out as a grid: **18 rows (weeks) × 7 columns (days)**. Each cell is one short workout label.

**Column order matters.** The **last column (Day 7) is the weekend long run**, and it's where races land. Read the source plan so the long run / race always sits in the last column.

- **Week 18, Day 7 must be exactly `Marathon`.** This is race day. Every plan ends here.
- A tune-up race mid-plan goes in a Day-7 cell as `Half Marathon`.

---

## Cell label cheat sheet

Use these exact spellings. The app reads the text literally, so `Rest` works but `rest day` or `OFF` will not.

| You want… | Write it as… | Notes |
|-----------|-------------|-------|
| Rest day | `Rest` | |
| Cross-training | `Cross` | cycling, swim, elliptical, yoga, etc. |
| An easy/standard run | `5 mi run` | number + `mi run` |
| A long run (last column) | `15 mi run` *or* just `15` | a bare number is read as a run of that many miles |
| Marathon-pace run | `6 mi pace` | number + `mi pace` |
| Marathon-pace (alt label) | `6 m @ MP` | same meaning, used in advanced plans |
| Long run with pace miles | `20 mi w/10 @ MP` | "20-miler with 10 at marathon pace" |
| Tempo run | `35 tempo` | minutes + `tempo` |
| Hill repeats | `5 x hill` | reps + `x hill` |
| 800m intervals | `6 x 800` | reps + `x 800` (also `x 400`, `x 1600`, `x 1K`) |
| Tune-up race | `Half Marathon` | mid-plan only; goes in Day 7 |
| Race day | `Marathon` | Week 18, Day 7 only — exact spelling |

**Units:** `mi` is preferred (e.g. `5 mi run`). The older novice plans use `m` (`5 m run`) and that still works, but **use `mi` for anything new** so it stays consistent.

Anything you write that doesn't match a pattern above still gets saved as a generic workout with your text as its description — so when in doubt, be descriptive, but try to use the labels above.

---

## Filled example (first 2 weeks of "Novice 1")

This is exactly how the app stores Novice 1 today — use it as your template.

**Summary block:**

```
id:           novice1
name:         Novice 1
description:  The most popular plan for first-time marathoners.
runsPerWeek:  4
peakMileage:  40
bestFor:      First-timers, completion focus
```

**Schedule grid (showing weeks 1, 2, and the final week 18):**

| Week | Day 1 | Day 2 | Day 3 | Day 4 | Day 5 | Day 6 | Day 7 (long/race) |
|------|-------|-------|-------|-------|-------|-------|-------------------|
| 1 | Rest | 3 mi run | 3 mi run | 3 mi run | Rest | 6 mi run | Cross |
| 2 | Rest | 3 mi run | 3 mi run | 3 mi run | Rest | 9 mi run | Cross |
| … | … | … | … | … | … | … | … |
| 18 | Rest | 3 mi run | 4 mi run | 2 mi run | Rest | Rest | **Marathon** |

> Note: in Novice 1 the *long run* actually sits in Day 6 and Day 7 is `Cross` — that's fine. The rule is only that **the marathon itself lands on Week 18, Day 7**. Match whatever the source plan's weekly rhythm is; just keep race day in that final cell.

---

## Blank template (copy one per plan)

```
=== SUMMARY ===
id:
name:
description:
runsPerWeek:
peakMileage:
bestFor:

=== SCHEDULE (18 weeks × 7 days) ===
Week 1:   __ | __ | __ | __ | __ | __ | __
Week 2:   __ | __ | __ | __ | __ | __ | __
Week 3:   __ | __ | __ | __ | __ | __ | __
Week 4:   __ | __ | __ | __ | __ | __ | __
Week 5:   __ | __ | __ | __ | __ | __ | __
Week 6:   __ | __ | __ | __ | __ | __ | __
Week 7:   __ | __ | __ | __ | __ | __ | __
Week 8:   __ | __ | __ | __ | __ | __ | __
Week 9:   __ | __ | __ | __ | __ | __ | __
Week 10:  __ | __ | __ | __ | __ | __ | __
Week 11:  __ | __ | __ | __ | __ | __ | __
Week 12:  __ | __ | __ | __ | __ | __ | __
Week 13:  __ | __ | __ | __ | __ | __ | __
Week 14:  __ | __ | __ | __ | __ | __ | __
Week 15:  __ | __ | __ | __ | __ | __ | __
Week 16:  __ | __ | __ | __ | __ | __ | __
Week 17:  __ | __ | __ | __ | __ | __ | __
Week 18:  __ | __ | __ | __ | __ | __ | Marathon
```

---

## Quick checklist before handing a plan back

- [ ] All six summary fields filled in
- [ ] `id` is lowercase, no spaces
- [ ] Exactly **18 weeks**, exactly **7 days** each
- [ ] Long run / race sits in the **last column (Day 7)** per the plan's rhythm
- [ ] Week 18, Day 7 is exactly `Marathon`
- [ ] Every cell uses a label from the cheat sheet (or is intentionally descriptive)
- [ ] Source/credit noted (where the plan came from), so we can attribute it

---

*Tip for the collector: also jot down the original source of each plan (book, website, coach) in a note. We don't store it in the app, but it helps us verify accuracy and give credit.*
