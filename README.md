# RSMS Feedback Assistant

<img width="421" height="397" alt="image" src="https://github.com/user-attachments/assets/eb9d3879-63fe-4ff1-bc5f-6a20a6e06163" />


> *Because clicking Option 1 seventeen times per subject is a surprisingly time-consuming academic activity.*

A small Firefox extension I made to automate filling out the **RSMS semester and course feedback forms**.

## Why?

First year, I actually took my time with end/mid-sem and course feedback. Read the questions, rated teachers and courses properly, even wrote strengths and weaknesses.

Then I got lazy.

Fortunately, all my teachers have been pretty cool, so by the end of the semester I'm usually just like, "Can't think of any faults at the moment."

Hence the feedback process had basically become:

**Option 1 → Option 1 → Option 1...**

and a single `" "` in the comment boxes.

The actual nightmare isn't the feedback itself.

It's **clicking the same option over and over again for every single subject when all you really want to do is to get to the ESE registration part.**

## What it does

### Teacher Feedback
- **Fill Current Subject** — selects Option 1 for all questions and fills the two required text fields with a space.
- **Run All Subjects** — does the same for every subject and submits each one.

### Course Feedback
- **Run current Course Feedback** — selects **Excellent** for each course-feedback question, waits for the required timer, and moves to the next question.
- **Stop Automation** — stops the automation if you change your mind.

No AI. No backend. Just some JavaScript and questionable decision-making.

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/sarj29/RSMS-Feedback-Bot.git
```

Or download and extract the repository.

### 2. Open Firefox

Go to:

```text
about:debugging#/runtime/this-firefox
```

Click **Load Temporary Add-on...**

Select:

```text
RSMS-Feedback-Bot/manifest.json
```

### 3. Use it

Open the relevant RSMS feedback page and click the extension.

**Teacher Feedback**
- **Fill Current Subject** — current subject only
- **Run All Subjects** — automatically processes all subjects
- **Stop Automation** — emergency exit

**Course Feedback**
- **Run Course Feedback** — selects Excellent, waits for the required timer, and moves through the questions automatically
- **Stop Automation** — stops the automation

## Disclaimer

The feedback system exists for the betterment of students and is a valuable opportunity to share meaningful feedback. If you have something to convey about a course or teacher, take the time to do it.

This project just automates the repetitive clicking of the same radio button n number of times. The actual feedback is still yours to give.
