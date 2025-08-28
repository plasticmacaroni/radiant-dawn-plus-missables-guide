# Spoiler-Free Game Checklist Tool

A community-created checklist system for tracking game content, items, and other missables without spoilers. Supports multiple games with community-contributed checklists.

## Checklist Reference Guide

This section contains all the formatting rules and features for creating checklists.

### Basic Structure

```
# Category Name
- Item text
  - Sub-item text
- Another item
```

### Content Types

#### Item Type Prefixes

- `::task::` - Regular task (clipboard icon)
- `::missable::` - Urgent/time-sensitive task (clock icon)
- `::item_uncommon::` - Special item (gem icon)
- `::item_story::` - Important note/character (book icon)

#### Spoiler Protection

Hide sensitive content with double pipes:

```
- ::task:: Recruit ||character name|| in the ||secret location||
```

- Renders as `???` boxes that reveal content when clicked
- Perfect for character names, locations, and plot points

#### Links

Add external links using markdown format:

```
- ::task:: Check the [strategy guide](https://example.com/guide)
```

Links open in a new tab when clicked.

### Notes System

Add informational blocks that appear above checklist content. Perfect for credits, sources, warnings, or general information.

#### Basic Syntax

```markdown
::note:: Note Title
Note content here
Can span multiple lines
[Links work too](https://example.com)
**Bold text** is supported

# Chapter 1 - Continue Checklist

- ::task:: Regular checklist items continue below
```

#### List Item Notes

```markdown
- ::note:: Important Warning
  This is a critical note about the upcoming section
- ::task:: Continue with regular tasks
```

#### Best Practices

**✅ Use for:**

- Attribution and source credits
- Important warnings or tips
- General information blocks
- Strategy notes and reminders

**❌ Avoid:**

- Using notes for regular checklist items (use `::task::` instead)
- Overusing notes (keep them concise and relevant)

### Branch System

Create conditional content based on user choices. Perfect for multiple game paths, character decisions, or difficulty modes.

#### Basic Syntax

```markdown
::branch::variable_name::Option 1|Option 2|Option 3

::branch_start::Option 1

- Content only shown when Option 1 is selected
- More content for this choice
  ::branch_end::Option 1

::branch_start::Option 2

- Different content for Option 2
  ::branch_end::Option 2
```

#### Nesting Rules

Branches can be infinitely nested. Inner branches only appear when their parent branch is selected:

```markdown
::branch::main_route::Forest Path|Mountain Path

::branch_start::Forest Path

- Forest-specific content

  ::branch::forest_choice::Stealth|Combat

  ::branch_start::Stealth

  - Sneak through quietly
    ::branch_end::Stealth

  ::branch_start::Combat

  - Fight your way through
    ::branch_end::Combat

::branch_end::Forest Path

::branch_start::Mountain Path

- Mountain-specific content
  ::branch_end::Mountain Path
```

### Complete Example

```markdown
# Chapter 8 - Route Split

::branch::lord_selection::Ephraim Path|Eirika Path

::branch_start::Ephraim Path

# Chapter 9 (Ephraim) - Fort Rigwald

- ::task:: Capture the fortress
- ::item_story:: ||Forde|| joins automatically

  ::branch::strategy_choice::Direct Assault|Stealth Approach

  ::branch_start::Direct Assault

  - ::missable:: Complete within 15 turns for bonus
  - ::item_uncommon:: ||Steel Lance|| (reward for speed)
    ::branch_end::Direct Assault

  ::branch_start::Stealth Approach

  - ::task:: Avoid triggering reinforcements
  - ::item_uncommon:: ||Sleep Staff|| (found in hidden room)
    ::branch_end::Stealth Approach

::branch_end::Ephraim Path

::branch_start::Eirika Path

# Chapter 9 (Eirika) - Hamill Canyon

- ::task:: Cross the canyon safely
- ::item_story:: ||Kyle|| joins automatically
- ::missable:: Save villagers from ||monster|| attacks
  ::branch_end::Eirika Path

# Chapter 10 (Both Routes Converge)

- ::task:: Objectives continue for both paths
```

## Example

### Generic Game Example

```
# Prologue - Tutorial Level

- ::task:: Obtain starting equipment
  - ::item_story:: ||Main Character|| (Level 1 ||Basic Class||)
  - ::item_story:: ||Companion 1|| (Level 2 ||Support Class||)
  - ::item_story:: ||Companion 2|| (Level 2 ||Combat Class||)
- ::task:: Collect dropped items
  - ::item_uncommon:: 1 Health Potion (from middle enemy)

# Chapter 1 - First Mission

- ::task:: Recruit new party members
  - ::item_story:: ||New Recruit|| (Level 3 ||Special Class||, automatic)
- ::task:: Collect dropped items
  - ::item_uncommon:: 1 Iron Sword (from boss ||Boss Name||)
- ::missable:: Hidden items - must search specific areas
  - ::missable:: 1 ||Rare Item|| (in hidden chest)
```

### Custom Checklist Example

```
::note:: Game Information
This is a checklist for an RPG game.
**Difficulty:** Hard Mode recommended for optimal experience.

# Chapter 1 - Town Defense
- ::task:: Complete main objectives
  - ::task:: Defeat all enemies
  - ::task:: Protect civilians
- ::item_uncommon:: ||Iron Sword|| (from defeated enemy)
- ::missable:: Rescue civilians before they are defeated
- ::item_story:: ||New Character|| joins after chapter
- ::task:: Visit [strategy guide](https://example.com/strategy) for more tips
- ::note:: Boss Strategy
  The boss has high defense but low resistance.
  Use magic or ranged attacks for best results.
```

## Schema for AI-Generated Checklists

If you're using an AI tool to generate a checklist, you can provide this schema description:

```
Create a checklist using this format:
1. Categories are denoted with "# Category Name" -- only use top-level categories, no "## Second-level"
2. Items are listed with "- " prefix
3. Sub-items are indented with two spaces before the "- " prefix
4. Each item should have a type prefix:
   - ::task:: for regular tasks
   - ::missable:: for urgent/time-sensitive tasks
   - ::item_uncommon:: for special items
   - ::item_story:: for important notes/characters
5. Notes can be added with "::note:: Note Title" for informational blocks
6. Spoiler protection: Use ||text|| to hide sensitive content
7. Links can be added using markdown format: [Link text](https://example.com)

Example:
::note:: Chapter Information
This chapter contains missable content and time-sensitive objectives.
**Important:** Save frequently!

# Chapter Objectives
- ::task:: Complete main story objectives
  - ::task:: Defeat all enemies
  - ::task:: Protect key characters
  - ::missable:: Collect items before chapter ends
# Extra Objectives
- ::task:: Complete side quests
- ::missable:: Find hidden treasure before chapter ends
- ::task:: Check [character guide](https://example.com/characters) for recruitment tips
- ::task:: Meet the new ||secret character|| in the ||hidden location||

Convert the following list into a properly formatted checklist:
[YOUR LIST HERE]
```

## Storage

Your checklists are saved in your browser's local storage. They will persist across browser sessions, but clearing your browser data will remove them. Use the Export/Import feature to back up your checklists.
