/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

/**
 * Sets the trail of app.workspace: Projects > project > Workspace when the workspace is the selected project's,
 * otherwise Workspaces > name.
 *
 * @method setWorkspaceBreadcrumb
 * @param {Prometheus.Services.BreadCrumbService} breadcrumb
 * @param {Prometheus.Services.TrackedProject} trackedProject
 * @param {Workspace} workspace
 */
export function setWorkspaceBreadcrumb(breadcrumb, trackedProject, workspace) {
    if (trackedProject.workspaceShortCode === workspace.shortCode?.toLowerCase()) {
        breadcrumb.setParent('app.workspace', 'app.project');
        breadcrumb.setTitle('app.workspace', 'views.app.workspace.detail.breadcrumb');
    } else {
        breadcrumb.setParent('app.workspace', 'app.workspaces.index');
        breadcrumb.setTitle('app.workspace', workspace.name);
    }
}
