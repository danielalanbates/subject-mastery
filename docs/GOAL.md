# Subject Mastery — goal (Daniel, 2026-10-02, authoritative)

Copyright (c) 2026 Daniel Bates / Bates LLC. All rights reserved. · help@batesai.org · https://batesai.org

## Verbatim goal

- Create a world class website eventually named subjectmastery.com or .org.
- It should keep track of the user's knowledge by subject.
- Every page should have a "Already Known" button that the user can click to auto skip it and mark that page's content as known.
- We are creating a massive database of knowledge for users to learn from.
- Each subject should have its own bar always present at the top of the screen that says (subject) knowledge.
- It should move upwards in % when the user completes a single page.
- Pages should continuously auto-play and mark pages as known as the user listens to them.
- The user should also have the option to click mark as known at the bottom of the page's text.
- Each subject should be able to be referenced by individual subjects, broken down as many times as necessary to get each individual page's content to 10 minutes of audio at 1x.
- When the user selects a subject to learn, it should auto place them where they left off (or the beginning). But the user should have the option to start and continue from anywhere.
- The user should have the ability to make a Study Plan, that they can drag and drop subjects into on their own profile page.
- They should have a fully customizable profile page that has an estimated IQ points under their name.
- IQ should start at high school level graduate and go up from there.
- The study plan should also be a separate tab that allows the user to click it and just play through their study plan.
- For example if the user wants to learn 3 lessons of biology and 1 lesson of math, they should drag in 3 biology blocks followed by 1 math block. This would auto play 3 consecutive lessons in biology followed by 1 math if the user clicks play on their study plan.
- This should also be an open source GitHub project.
- The content we should start building should start out at entry level college and go up from there.

Earlier decisions the same day: brand "Subject Mastery". No domain is bought yet; Daniel approves any purchase. Interim home is https://batesai.org/subjectmastery/. Simple Google login keeps each user's progress. The four pilot subjects are Economics, Biology, World History, and Biblical Studies & Theology.

## Domain check (2026-10-02, WHOIS only — confirm at a registrar before buying)

| Domain | Status |
|---|---|
| subjectmastery.com | Taken (created 2026-05-04, expires 2027-05-04) |
| subjectmastery.org | WHOIS "Domain not found" → likely available |
| subjectmastery.net | WHOIS "No match" → likely available |
| subject-mastery.org | WHOIS "Domain not found" → likely available |

## How each requirement maps to the build

| Requirement | Implementation |
|---|---|
| "Page" | One lesson. At most 10 min of audio at 1x, which is about ≤1,500 words at 150 wpm. Pilot lessons run 600–1,000 words. |
| Subjects broken down as needed | Arbitrarily nested topic tree (CONTRACT v2). Every node with lessons under it is itself a "subject" with its own knowledge bar and its own resume point. |
| (Subject) knowledge bar | A sticky top bar on every subject, topic and lesson screen: "Biology knowledge 23%". It equals (known + completed lessons) ÷ lessons with text in that subject. It animates up when a page completes. |
| Already Known | Shown at the top of every page and again at the bottom of the text as "Mark as known". It marks the page `known` and advances. |
| Continuous auto-play | Autoplay-next is on by default. Finishing the audio marks the page `completed`, which counts as known for the bar, and starts the next page. |
| Resume / start anywhere | Selecting a subject jumps to the first unfinished page, or the beginning. Any page in the tree can be started directly. |
| Study Plan | On the profile, drag-and-drop subject blocks. Each block means "next unfinished page of subject X". There is also a separate Study Plan tab with a Play button that plays the blocks in order. The plan is stored on the server when signed in. |
| Customizable profile + estimated IQ | Display name, avatar (Google photo or initials and colour), bio, accent colour, banner, featured subjects and privacy. "Estimated IQ" sits under the name. It starts at 100, the high-school-graduate baseline, and rises with knowledge (formula in CONTRACT v2). It is labelled as a playful learning score, not a clinical IQ test. |
| Open source | Public GitHub repo `danielalanbates/subject-mastery`. **Licence note:** Daniel's default licence (PolyForm Noncommercial + 10% rider) is *source-available*, not OSI "open source". The repo uses his default until he says otherwise (see README). |
| Entry-level college upward | Outlines follow intro-college syllabi such as the OpenStax intro texts, then progress to advanced. |
