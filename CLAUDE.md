@AGENTS.md

# Standard Workflow

1. Think through the problem, read the relevant files, and write a plan to `tasks/todo.md`.
2. The plan should have a list of todo items that you can check off as you complete them.
3. Before you begin working, check in with me and I will verify the plan.
4. Then, begin working on the todo items, marking them as complete as you go.
5. Every step of the way, just give me a high level explanation of what changes you made.
6. Make every task and code change you do as simple as possible. Avoid making any massive or complex changes. Every change should impact as little code as possible. Everything is about simplicity.
7. Commit at logical slice boundaries with a clear, descriptive message — one coherent unit of work per commit.
8. Finally, add a review section to the `todo.md` file with a summary of the changes you made and any other relevant information.

# Code Organization Principles

- Follow the DRY (Don't Repeat Yourself) principle — extract shared logic into reusable functions, utilities, or base classes.
- Keep code modular with single-responsibility components.
- Use config files for environment-specific or frequently changed values.
- Create base files/classes for shared functionality that can be extended.
- Before writing new code, check if similar functionality already exists in the codebase.

<do_not_act_before_instructions>
Do not jump into implementation or changing files unless clearly instructed to make changes. When the user's intent is ambiguous, default to providing information, doing research, and providing recommendations rather than taking action. Only proceed with edits, modifications, or implementations when the user explicitly requests them.
</do_not_act_before_instructions>

<use_parallel_tool_calls>
If you intend to call multiple tools and there are no dependencies between the tool calls, make all of the independent tool calls in parallel. Prioritize calling tools simultaneously whenever the actions can be done in parallel rather than sequentially. For example, when reading 3 files, run 3 tool calls in parallel to read all 3 files into context at the same time. Maximize use of parallel tool calls where possible to increase speed and efficiency. However, if some tool calls depend on previous calls to inform dependent values like the parameters, do NOT call these tools in parallel and instead call them sequentially. Never use placeholders or guess missing parameters in tool calls.
</use_parallel_tool_calls>

<investigate_before_answering>
Never speculate about code you have not opened. If the user references a specific file, you MUST read the file before answering. Make sure to investigate and read relevant files BEFORE answering questions about the codebase. Never make any claims about code before investigating unless you are certain of the correct answer — give grounded and hallucination-free answers.
</investigate_before_answering>

<report_issues_in_plans>
When writing plans in `tasks/todo.md`, explicitly call out any issues, risks, or blockers you discover during investigation. For each issue found:
- State the problem clearly and specifically (file path, line number, what's wrong).
- Explain the impact (what breaks, what's affected, severity).
- Propose a fix or workaround.
- Flag any unknowns or areas needing clarification from the user.

Do NOT silently work around problems or bury issues inside todo items. Surface them prominently at the top of the plan under a dedicated "Issues Found" or "Risks & Blockers" section so they are visible before work begins. If an issue could change the approach or scope, stop and ask the user before proceeding.
</report_issues_in_plans>
