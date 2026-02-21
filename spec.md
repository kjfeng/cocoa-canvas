# Overview

This is an interactive web application built with React and TypeScript (with tailwind CSS) that allows users and AI to better collaborate with each other. It features an interactive node-based canvas, to which users can add cards. The application supports multi-user real-time collaboration, allowing multiple users to view and edit the same canvas and notebooks simultaneously (similar to Figma or Google Docs).

## Agent notebooks
Each card represents a task that user can assign the agent. In the card, the agent first drafts out an artifact called an agent notebook. The notebook includes a thoughtful list of steps (typically 3-7 for a focused task) that the agent and user can take together to complete their task. Each step has the following components:
- Editable description: the agent will draft out a description for each step, but the user can edit it to better fit their needs. If a user edits a step description after downstream steps have already been executed, those downstream results are preserved but marked with a subtle warning badge indicating they may be stale. The user must explicitly re-run those steps to refresh them.
- Run button: on the left side of the step, a user can click a run button to execute the step, similar to executing a code cell in a Jupyter notebook. The agent then completes that step and updates the notebook with results. The results appear inline underneath the step, but can be collapsed.
- Step assignment toggle: on the right side of the step, a user can toggle whether that step is assigned to the agent or the user. The agent has some default assignments when it drafts the notebook, but the user can change the assignments as they see fit. When a user clicks the run button for a step, the agent will check whether that step is assigned to itself or the user. If it's assigned to the agent, the agent will execute that step. If it's assigned to the user, then the agent will prompt the user in an encouraging way to complete the step and add their results to the notebook. Agent and user steps may be interleaved, and the agent will not execute any steps assigned to the user, so the user can complete their steps at their own pace.

### Task input
To create a new card, the user provides a task description as free-form text and can optionally attach files, images, or URLs as additional context. The agent uses this input to draft the initial notebook plan.

### Step results
Step results support rich markdown rendering including code blocks, tables, lists, and inline formatting. Results also include interactive UI affordances: collapsible sections, copy buttons, editable text areas, and toggles. There is no in-browser code execution — interactivity is limited to UI elements.

### User-assigned steps
When a user-assigned step is activated (via Run or Run All), the user is presented with an input area where they can:
- Type rich text as their result for that step
- Attach files or images
- Click a "Help" button, which prompts the agent to ask the user thoughtful guiding questions to help them complete the step. The agent does not fill in the result — it helps the user think through the step themselves.

### Final results
After the final step in a notebook is completed, the agent makes a separate API call to synthesize all step results into a polished, cohesive deliverable. This final synthesis appears in a "final results" section at the bottom of the card. The user can edit this final output after it's generated.

A paper containing an example of what an agent notebook looks like can be found in the same directory as this spec, with the filename `reference-paper.pdf`. Figure 2 offers a screenshot.

## Notebook controls
The agent notebook has a "Run All" button at the top, which executes all steps in sequential order. When the agent encounters a step assigned to itself, it executes it. When it encounters a step assigned to the user, it pauses execution, surfaces the user input prompt inline, and waits for the user to provide their input (or interact with the Help button). Once the user submits their result, execution continues with the next step. The user can also delete or add steps as they see fit.

## Canvas

### Card layout
The canvas allows the user to add cards, each of which contains an agent notebook. The user can create as many cards as they want, and move them around the canvas.

Cards display in a compact summary view by default, showing the title and a collapsed step list. Users can expand a card to focus on it, which opens a detailed view (overlay or zoom) showing the full notebook with all step descriptions and results.

### Card copying
Users can copy cards, which creates a duplicate of that card and all of its contents. This allows users to easily reuse and modify agent notebooks for similar tasks. Copied cards maintain a visible link to the original card they were copied from, but can be edited independently.

## Agent context management
To create the plan and also to execute each step, the agent makes API calls using the Anthropic key provided in `.env`. The agent maintains a sliding window of recent step descriptions and results as conversation history, along with the original task description, when making API calls for step execution. This balances providing sufficient context for later steps to reference earlier results while managing token costs.
