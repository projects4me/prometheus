# Role list — Prometheus

The Roles page is a QuickList browser: the list of roles on the left, the open role's detail on the right. There is
no role `level` / `type` field in the API, so access % is derived from the permission catalog returned for that role.

Gaia permission list contract: sibling repo `gaia/docs/architecture/rbac/` and `PermissionController::listAction`.

```
app.role (list + search + paging)
      │  query roles (one page)
      │  query userrole?rels=user   (roles of the page)
      │  for each role of the page: query permission?roleId=
      ▼
allPermissions + allUserroles
      │  coverageByRole / membersByRole
      ▼
QuickList rows  (initials, name, access labels, description, members)

app.role.index → opens the first listed role (replaceWith app.role.page)
app.role.page  → role detail (fields, permissions, members)
```

## Layout

- **List** — `QuickList` with search (`EzSearchCompact`, saved searches), sort, grouping and paging, plus the add-role
  action behind `role.create`.
- **Detail** — `app.role.page` renders beside the list. Opening `app.role` with no role open redirects to the first
  listed role, replacing the index entry so Back does not return to it.

## Row contents

- **Initials box** — up to two initials of the name; colour follows the access tier.
- **Name** and **description** (placeholder when empty).
- **Access labels** — granted % and denied %, tier-coloured.
- **Members** — avatar stack of the role's users, or a "no members" label.

## Queries per page

Only the roles of the page being shown are enriched: one `userrole` query (with `user`) for the page's role ids, and one
`permission` query per role (Gaia merges the default catalog with applied rows **only when `roleId` is present**).
Changing page, sort or search reloads only the list, not the route.

## Ownership in this repo

| Piece | Job |
|---|---|
| `app/routes/app/role.js` | Load the first page of roles and hand it to the controller. |
| `app/routes/app/role/index.js` | Open the first listed role. |
| `app/controllers/app/role.js` | List state, rows, `coverageByRole`, `membersByRole`, loading permissions and userroles per page. |
| `app/templates/app/role.hbs` | QuickList, search and row layout. |
| `app/utils/role/access.js` | Coverage, tiers, members and initials helpers. |
| `app/utils/role/browser-defaults.js`, `browser-requests.js` | Query-param defaults and list/userrole requests. |
| `app/components/project/member-avatars.*` | Avatar stack in the row. |
| `app/styles/modules/role.scss` | Row layout and tier colours for the initials box and labels. |

## Access / colour tiers

| Coverage | Tier | Colour |
|---|---|---|
| 75–100% | `high` | `$primaryColor` |
| 50–74% | `elevated` | `$warningColor` |
| 25–49% | `medium` | `$secondaryColor` |
| 0–24% | `low` | `$mediumColor` |
| no data | `none` | `$mediumColor` |

Rows carry `role-row--{tier}`.

## Coverage formula

Only **module action** resources count (`{module}.{get|create|update|delete}`).

```
coverage% = round( allowedActions / totalActionsInThatRoleCatalog × 100 )
```

Empty / unset `allowed` counts as granted (permissive UI default). Explicit `'0'` is denied. `'1'` / `'2'` are granted.

## Constraints / non-goals

- No Gaia schema change (no role `level` / `type`).
- Detail-page permission / member edits refresh the listed role's coverage via the controller.

## Related files

- Gaia: `app/api/v1/controllers/PermissionController.php`
- Prometheus ACL: `app/services/acl.js`
- Module scopes (detail UI): `app/utils/acl/module-types.js`
