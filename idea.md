Ask me one question at a time so we can develop a thorough, step-by-step spec for this idea. Each question should build on my previous answers, and our end goal is to have a detailed specification I can hand off to a developer. Let’s do this iteratively and dig into every relevant detail. Remember, only one question at a time.

Here’s the idea:
I want to create a CI dashboard that displays all the company's repositories and, for each of them, displays statistics such as:
* a chart of the last year's releases with each bar representing the monthly number
* the date of the last release
* how many days have passed since the last release
* the total number of builds done (not just release builds)
* etc.
The repositories are on GitHub, and we use git tags to release; each release has a tag in the form vX.Y.Z.