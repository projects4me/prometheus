# Role cards — Prometheus

Role list cards show access coverage and assigned members. There is no role
`level` / `type` field in the API, so access % is derived from the permission
catalog returned for that role.

Gaia permission list contract: sibling repo
`gaia/docs/architecture/rbac/` and
`PermissionController::listAction`.

```
app.role (list)
      │  query roles
      │  query userrole?rels=user
      │  for each role: query permission?roleId=
      ▼
allPermissions + allUserroles
      │
      │  coverageByRole / membersByRole
      ▼
Role::Card  @coverage  @members
```

## Ownership in this repo

| Piece | Job |
|---|---|
| `app/routes/app/role.js` | Load roles, userroles (+ user), permissions per role. |
| `app/controllers/app/role.js` | `coverageByRole`, `membersByRole`, `isActionAllowed`. |
| `app/templates/app/role.hbs` | Pass `@coverage` / `@members`; column classes on `LinkTo`. |
| `app/components/role/card.{js,hbs}` | Icon, name, access pill, description, members, modified. |
| `app/components/project/member-avatars.*` | Avatar stack; `@maxVisible={{2}}` on role cards. |
| `app/styles/modules/role.scss` | Card layout and tier colours for icon + access pill. |

Gaia merges the default catalog with applied rows **only when `roleId` is
present**. Without `roleId`, the response cannot drive per-role coverage.

## Card UI

```
┌─────────────────────────────────────────────┐
│  [IN]  Role Name          96% ACCESS      › │
│                                             │
│  Description text…                          │
│                                             │
│  👤👤 +41                    Modified: date │
└─────────────────────────────────────────────┘
```

- **Icon** — rounded square with name initials; colour follows access tier.
- **Access pill** — `{percent}% ACCESS`, colour-coded by coverage tier.
- **Members** — `Project::MemberAvatars` with `maxVisible=2`, then `+N`.
- **Modified** — `dateModified` (fallback `dateCreated`).
- **Active card** — sibling fade + chevron when detail pane is open.
- No progress bar, tier chip, role ID, or permission tags.

### Access / colour tiers

| Coverage | Modifier | Colour |
|---|---|---|
| 75–100% | `role-card--high` | `$primaryColor` |
| 50–74% | `role-card--elevated` | `$warningColor` |
| 25–49% | `role-card--medium` | `$secondaryColor` |
| 0–24% | `role-card--low` | `$mediumColor` |
| no data | `role-card--no-coverage` | `$lightColor` |

## Coverage formula

Only **module action** resources count (`{module}.{get|create|update|delete}`).

```
coverage% = round( allowedActions / totalActionsInThatRoleCatalog × 100 )
```

Empty / unset `allowed` counts as granted (permissive UI default). Explicit
`'0'` is denied. `'1'` / `'2'` are granted.

## Constraints / non-goals

- No Gaia schema change (no role `level` / `type`).
- One permission request per role on the list page.
- Detail-page permission / member edits do not live-refresh list cards until
  the list model reloads.

## Related files

- Gaia: `app/api/v1/controllers/PermissionController.php`
- Prometheus ACL: `app/services/acl.js`
- Module scopes (detail UI): `app/utils/acl/module-types.js`
