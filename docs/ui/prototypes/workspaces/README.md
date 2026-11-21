# Workspaces prototype

The clickable prototype of Workspaces, drawn on 20 Nov 2026 as the design canvas *Workspaces prototype*
(claude.ai artifact `8EmSuMcMUGarH5v8qc6ErG`, private). It shows where workspaces appear in the app: the navigation,
the project-level scope switches, and the workspace's own Overview, Settings and dialogs.

Use it for **layout, content and flow**. It is not Prometheus markup: the artboards use their own stylesheet
(`html/prototype.css`), div tables, inline SVG icons and Source Sans 3. When building a screen, map each part to the
design system and the existing components ([`../../design-system.md`](../../design-system.md)); the design system
wins on classes, components, icons (Font Awesome 4) and colours.

Dashed blue outlines and the NEW / RENAMED flags mark what the prototype adds to today's app.

## Screens

| Screen | PNG | Artboard | What it shows |
|---|---|---|---|
| Header | [header.png](screens/header.png) | [Header](html/Header.dc.html) | Header with the project switcher, unchanged |
| Sidebar | [sidebar.png](screens/sidebar.png) | [Sidebar](html/Sidebar.dc.html) | "Workspace" group renamed **Home**; one **Workspace** link at the end of the Project group; Admin keeps Settings and Developer |
| Project switcher | [project-switcher.png](screens/project-switcher.png) | [Switcher](html/Switcher.dc.html) | Flat list as today, the workspace name in grey on the right |
| Projects list | [projects-list.png](screens/projects-list.png) | [Projects](html/Projects.dc.html) | Workspace column and a Workspace filter |
| New project | [new-project.png](screens/new-project.png) | [NewProject](html/NewProject.dc.html) | Workspace choice: its own (default) or an existing one |
| Issues | [issues-scope.png](screens/issues-scope.png) | [Issues](html/Issues.dc.html) | Scope = This project / Whole workspace; the wider scope adds a Project column and project chips |
| Gantt | [gantt-scope.png](screens/gantt-scope.png) | [Gantt](html/Gantt.dc.html) | The same Scope switch; lanes per project and cross-project blockers |
| Dashboard | [dashboard-filter.png](screens/dashboard-filter.png) | [Dashboard](html/Dashboard.dc.html) | Workspace filter |
| Workspace Overview | [workspace-overview.png](screens/workspace-overview.png) | [Main](html/Main.dc.html) | Header box, member projects, activities, members, environment, milestones |
| Settings: projects and members | [settings-projects-members.png](screens/settings-projects-members.png) | [WsSettings](html/WsSettings.dc.html) | Settings tabs; member projects, members, workspace details form |
| Settings: environment | [settings-environment.png](screens/settings-environment.png) | [WsEnvironment](html/WsEnvironment.dc.html) | Runtime, repositories and base branches |
| Settings: agents, tools and skills | [settings-agents-tools-skills.png](screens/settings-agents-tools-skills.png) | [WsAgents](html/WsAgents.dc.html) | Agents, tool servers and skills of the workspace (moved from Admin) |
| Dialog: add a project | [dialog-add-project.png](screens/dialog-add-project.png) | [JoinDialog](html/JoinDialog.dc.html) | Members shared both ways, environment |
| Dialog: move a project out | [dialog-move-project-out.png](screens/dialog-move-project-out.png) | [LeaveDialog](html/LeaveDialog.dc.html) | Gated while work is in progress |
| Dialog: remove a member | [dialog-remove-member.png](screens/dialog-remove-member.png) | [RemoveMember](html/RemoveMember.dc.html) | Who takes over their open issues |
| Dialog: delete the workspace | [dialog-delete-workspace.png](screens/dialog-delete-workspace.png) | [DeleteWorkspace](html/DeleteWorkspace.dc.html) | Blocked while it owns runs, agents, skills, tools, workflows or cross-project milestones |

The `.dc.html` files are the canvas's Design Component format: markup with `{{…}}` holes, `<sc-for>` / `<sc-if>`
and a `Component` script holding the sample data. They need the canvas runtime to render (not included); read them
for structure, copy and sample data. `WsSettings` had an unescaped quote in its dates (`'18 Nov '26'`) that broke
its script; this copy writes `'18 Nov 2026'`.

## New, as drawn

1. Sidebar: one "Workspace" link at the end of the Project group; it opens the workspace of the selected project.
   That is the only new sidebar entry.
2. Sidebar: the "Workspace" group (Dashboard, Projects) is renamed "Home", so the word isn't used twice.
3. Project switcher: the workspace name in grey on the right. No grouping.
4. Projects list: Workspace column and Workspace filter.
5. New project: Workspace choice, defaulting to a new workspace with the project's name.
6. Issues and Gantt: Scope = This project (default) / Whole workspace. The wider scope adds a Project column and
   project chips, and only covers projects you are a member of, with your project permissions.
7. One colour per project, used in tags, lanes and bars (new palette entries).
8. Workspace Overview.
9. Workspace Settings with tabs: Projects and members, Environment, Agents/tools/skills, Delete. Agents and
   Workflows move here from Admin.
10. Dialogs: add project, move a project out (gated), remove member, delete (gated).
11. Dashboard: Workspace filter.

Dropped since the first round: the Workspace sidebar group, Home › Workspaces, the grouped switcher, and the
workspace Issues, Planning and Knowledge pages.

## Still open (drawn as one option)

1. Every project has a workspace: drawn as yes. A new project gets its own, and moving a project out creates one
   for it.
2. Same agent in two workspaces: drawn as a separate agent per workspace, with "Copy to workspace" in the row menu.
3. Deleting a workspace that owns agents, skills, tools or workflows: drawn as blocked until they are removed or
   moved.
4. One runtime serving several workspaces: drawn as allowed.
5. Milestones that span projects: kept on the Overview and in the whole-workspace Gantt. Drop them if per-project
   milestones are enough.

Item 7 (project colours) would add colours to the palette, which the design system doesn't allow without a decision;
treat it as a proposal.
