# git
before start init a git repo

# hexagonal architecture
Review the project files spec.md, prompt_plan.md, and todo.md, taking into account that I want to apply Hexagonal Architecture and would like a folder structure under src with
* domain: for functions and classes that are pure domain, with no framework dependencies (e.g., repository abstractions)
* usecase: for the application's usecases, again pure domain, with no framework dependencies
* infrastructure: must contain things like repositories and framework and library dependencies

# todo
I don't like how you organized the todo list. It seems like a plan where you develop one layer at a time, but the result is only visible at the end.
Try reorganizing the todo list so that each development leads to a visible increase in functionality.

# auth with feature flag
Implement feature 1. Usa a feature flag to enable or disable authentication (default disabled)