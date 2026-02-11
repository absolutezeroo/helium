# AGENTS.md — Helium

Instructions universelles pour tout assistant IA (Cursor, Windsurf, Codex, Copilot, Claude, etc.)

## Projet

Helium : port TypeScript/PixiJS v8 du client Habbo Hotel Flash. Monorepo pnpm avec `helium-engine` (moteur, zéro UI) et `helium-client` (SolidJS).

```bash
pnpm install && pnpm dev    # Serveur de développement
pnpm build                   # Build de production
```

## La règle fondamentale

**Lire le code source AS3 avant d'écrire TOUTE implémentation.**

- Primaire : `sources/win63_version/habbo/<module>/<Classe>.as`
- Secondaire : `sources/flash_version/com/sulake/habbo/<module>/<Classe>.as`

Pas de source AS3 lue = implémentation invalide. Point final.

## Protocole de travail (phases obligatoires)

Inspiré de la méthode BMAD (Breakthrough Method for Agile AI Driven Development). Chaque tâche d'implémentation DOIT suivre ces phases dans l'ordre. Aucune phase ne peut être sautée.

### Phase 1 — Recherche (BLOQUANTE)

Tant que cette phase n'est pas complète, l'écriture de code est INTERDITE.

- [ ] Lire `docs/CONTEXT.md` pour comprendre l'architecture
- [ ] Trouver et lire INTÉGRALEMENT le fichier AS3 source :
  - Déclaration de classe (`extends`, `implements`)
  - Tous les imports (révèlent les dépendances)
  - TOUTES les méthodes et leur implémentation complète
  - TOUTES les propriétés
  - La logique du constructeur
- [ ] Lire l'interface AS3 (`I<Classe>.as`)
- [ ] Vérifier les patterns handler/listener dans le sous-dossier `handler/`
- [ ] Consulter `docs/IMPLEMENTATION_STATUS.md` pour le statut actuel

### Phase 2 — Plan

- [ ] Identifier toutes les classes, interfaces et relations depuis l'AS3
- [ ] Mapper l'héritage AS3 vers les équivalents TypeScript
- [ ] Identifier les fichiers ENGINE à porter (ignorer les fichiers VIEW)
- [ ] Lister les dépendances nécessaires

### Phase 3 — Implémentation

- [ ] Suivre les conventions de `docs/STYLEGUIDE.md` (Allman, nommage, etc.)
- [ ] Suivre les templates de `docs/PATTERNS.md` pour Composers/Parsers/Events/Managers
- [ ] Code engine → `packages/helium-engine/src/`
- [ ] Code client → `packages/helium-client/src/`
- [ ] Respecter les noms de classes, méthodes, interfaces et chaînes d'héritage AS3

### Phase 4 — Validation

- [ ] Vérifier la compilation avec `pnpm dev`
- [ ] Mettre à jour `docs/IMPLEMENTATION_STATUS.md` (changer ❌ → ✅, maj pourcentages)

## Frontières d'architecture

```
helium-engine (ZÉRO connaissance UI)         helium-client (dépend de engine)
├── core/    Bas-niveau, communication       ├── components/  Composants SolidJS
├── habbo/   Logique de jeu                  ├── stores/      État réactif
├── room/    Moteur de room                  ├── hooks/       Hooks SolidJS
└── iid/     Symboles DI                     └── api/         Pont engine ↔ UI
```

**CRITIQUE** : L'engine ne doit JAMAIS importer du client. Le flux va uniquement client → engine.

Pattern de données : `Engine émet un event → Store écoute et met à jour un signal → Composant lit le signal`

## Style de code (résumé)

- Accolades **Allman** (ouvrante sur sa propre ligne)
- Interfaces : `I` + PascalCase (`IRoomSession`)
- Champs privés : `_` + camelCase (`_roomId`)
- Constantes : UPPER_SNAKE_CASE
- Named exports uniquement (jamais `export default`)
- `import type` pour les imports de types
- `dispose()` toujours en dernière méthode, vérifie `_disposed`

Référence complète : `docs/STYLEGUIDE.md`

## Sources AS3

| Dossier | Priorité | Racine des packages | Fichiers |
|---------|----------|---------------------|----------|
| `sources/win63_version/` | PRIMAIRE | `habbo/`, `room/` | ~4 465 |
| `sources/flash_version/` | Secondaire | `com/sulake/habbo/` | ~7 160 |

Classification des fichiers AS3 :
- **ENGINE** : Logique métier, modèles de données, handlers, parsers, composers → **À IMPLÉMENTER**
- **VIEW** : Fenêtres UI, dialogs, composants d'affichage → **À IGNORER** (SolidJS remplace)

Consulter `docs/architectures/<module>-architecture.md` pour la classification de chaque fichier.

## Patterns clés

Voir `docs/PATTERNS.md` pour les templates complets avec exemples de code.

- **Composers** : `extends MessageComposer<TupleType>` avec `_data` et `getMessageArray()`
- **Parsers** : `implements IMessageParser` avec `flush()` + `parse(wrapper)`
- **Events** : `extends MessageEvent` avec paramètre `callback` dans le constructeur
- **Managers** : DI Component avec enregistrement IID

## Pièges connus

1. **Ne jamais overrider `get events()`** dans les sous-classes de Component (casse le système d'events DI — utiliser un nom de propriété différent comme `sessionEvents`)
2. **Utiliser `createObjectInternal()`** pas `createRoomObject()` depuis les classes container (récursion infinie)
3. **La frontière engine ↔ client est stricte** : l'engine a ZÉRO connaissance UI
4. **Les fichiers VIEW AS3 sont IGNORÉS** : SolidJS remplace l'UI Flash
