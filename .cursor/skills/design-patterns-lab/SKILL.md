---
name: design-patterns-lab
description: >-
  Implement or refactor Design Patterns coursework (shapes, Factory Method,
  validators, services). Use when building lab tasks from Task*.md, reviewing
  layering, or preparing defense explanations for pattern choices.
---

# Design Patterns lab

## When to use

- New figure variant from assignment text
- Refactor “for defense” (simpler, still pattern-correct)
- Explain why a structure matches the brief

## Workflow

1. Read the variant requirements (area/volume, “is figure”, plane checks, file format).
2. Map to layers before coding:
   - entity fields only
   - factory: parse line → validators → entity | null
   - service: formulas + classification
   - calculation validator for results
3. Keep Factory Method: abstract creator + concrete factory per entity type.
4. Share `Point`/`Shape`/`Geometry` across 2D and 3D; set `z = 0` for planar figures.
5. Add invalid lines to `data/*.txt` and assert factories return null.
6. Add Jest cases with several expects and varied matchers.
7. Run `npm test` and `npm run lint` in the task folder.

## Do / Don't

- Do inject dependencies (geometry, validators) into services/factories.
- Do use custom exceptions for domain failures.
- Don't put area/perimeter methods on entity classes.
- Don't add patterns (Singleton, Observer, etc.) unless the assignment asks or they remove real duplication.
- Don't split Point into 2D/3D types just for purity when one 3D point with default z is enough.

## Defense checklist

For each change, be ready to say:

1. Which pattern (Factory Method / inheritance of Shape).
2. Which requirement in Task.md it satisfies.
3. Where invalid input is skipped.
4. Where business logic lives (service, not entity).
