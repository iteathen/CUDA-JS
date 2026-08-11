# Project Organization

Organize as though the project is already large. Small current size is not permission for flat or temporary structure.

## Placement decision

Before creating a durable artifact, determine:

- product area and semantic owner;
- public versus internal surface;
- dependency direction;
- lifecycle and release boundary;
- validation owner;
- generated versus hand-authored authority;
- eventual archive/removal disposition.

## Rules

- No production source in the repository root.
- No unowned `utils`, `common`, `shared`, `misc`, `helpers`, or equivalent dumping ground.
- Components expose declared public contracts; callers do not deep-import internals.
- Circular dependencies are forbidden.
- Cross-cutting facilities are components only when they have coherent ownership—not merely because several files use them.
- Repository/service/package splits require independent lifecycle, release, security, ownership, or consumer boundaries; file count alone is insufficient.
- Reserved directories and placeholder READMEs prevent drift but do not authorize implementation.
- Generated products live under a clearly owned generator/schema and are reproducible or explicitly external.
