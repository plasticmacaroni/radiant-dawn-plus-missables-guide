# Fire Emblem: Radiant Dawn+ Checklist

A community-created checklist tool for Fire Emblem: Radiant Dawn+ from Gallade and Kalen with edits thanks to Windward. Track items, characters, and missables without spoiilers. Thanks for Ask_B_007 on GameFAQs for the guide content so far.

## How to Use

### Getting Started with Fire Emblem: Radiant Dawn+

1. **Automatic Setup**

   - The tool automatically loads the complete Fire Emblem: Radiant Dawn+ Community Edit checklist when you first visit
   - Character names, classes, and key items are hidden behind community-enhanced spoiler protection
   - Click on `???` boxes to reveal hidden content

2. **Navigate the Checklist**

   - Browse through all available acts: Silver Haired Maiden (Act I), Of Countries and Kings (Act II), Intersecting Vows (Act III), and Crossroads (Act IV)
   - Use the table of contents to jump to specific chapters
   - Each chapter includes complete item tracking, character recruitment guides, and missable locations
   - Filter items by type: tasks, missables, special items, story elements

3. **Track Your Progress**

   - Check off items as you complete them in-game
   - Use "Hide Completed" to focus on remaining tasks
   - View progress statistics in the header

4. **Spoiler Protection**

   - Character names, classes, and important items are hidden by default
   - Click on any `???` box to reveal the hidden content
   - Use this feature to avoid spoilers during your playthrough

5. **Multiple Playthroughs**

   - Create separate profiles for different playthroughs
   - Switch between profiles using the dropdown at the top right
   - Each profile tracks its own progress independently

6. **Customization**
   - Go to "Edit List" tab to modify the checklist
   - Add your own notes, reminders, or custom items
   - Use the export/import feature to backup your customizations

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

#### How It Works

1. **Note Declaration** (`::note::`): Creates a styled information block
2. **Content**: Any text following the note marker until the next structural element
3. **Markdown Support**: Links, bold text, and basic formatting
4. **List Integration**: Notes can also be used within checklist items

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

#### Technical Behavior

- **Static Content**: Notes are non-interactive information blocks
- **List Management**: Follows same insertion rules as branches
- **Markdown Processing**: Supports links and basic formatting
- **Branch Integration**: Respects branch visibility rules

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

#### How It Works

1. **Branch Declaration** (`::branch::`): Creates option buttons for user selection
2. **Branch Sections** (`::branch_start::` / `::branch_end::`): Content shown only when that option is selected
3. **Variable Names**: Use descriptive identifiers (e.g., `character_route`, `difficulty_mode`)
4. **Option Values**: Must exactly match between declaration and section markers

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

#### Validation and Error Handling

The system automatically validates branch structure and shows error messages for:

- **Unmatched markers**: `::branch_end::` without corresponding `::branch_start::`
- **Unclosed sections**: `::branch_start::` that are never closed
- **Improper nesting**: Branches trying to close before nested branches are complete
- **Missing sections**: Branch declarations without any content sections
- **Option mismatches**: Declared options that don't have corresponding sections

Error messages appear with specific line numbers and branch names to help fix issues.

#### Best Practices

**✅ Good Variable Names:**

```markdown
::branch::character_recruitment::Recruit|Skip
::branch::difficulty_mode::Normal|Hard|Maniac
::branch::story_path::Eirika Route|Ephraim Route
::branch::alignment_choice::Light|Neutral|Dark
```

**❌ Avoid:**

```markdown
::branch::choice1::Yes|No
::branch::option::A|B|C
::branch::var1::Opt1|Opt2
```

**Structural Guidelines:**

1. Use descriptive variable names that explain the choice
2. Keep option values simple but clear
3. Ensure proper nesting - close inner branches before outer branches
4. Test all branch combinations thoroughly
5. Use branches to avoid overwhelming users with too many options at once

#### Technical Behavior

- **Default State**: Content hidden until user makes selection
- **Selection Persistence**: Choices saved per profile in browser localStorage
- **Dynamic Updates**: Checklist refreshes immediately when options selected
- **Visual Feedback**: Selected buttons highlighted blue, others appear smaller and grayed
- **Profile Isolation**: Each profile maintains independent branch selections

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

### Fire Emblem: Radiant Dawn Style

```
# Prologue - Under Gray Skies (Act I)

- ::task:: Obtain starting units
  - ::item_story:: ||Micaiah|| (Level 1 ||Light Mage||)
  - ::item_story:: ||Edward|| (Level 4 ||Myrmidon||)
  - ::item_story:: ||Leonardo|| (Level 4 ||Archer||, joins on turn 3)
- ::task:: Collect dropped items
  - ::item_uncommon:: 1 Herb (from middle bandit)

# Chapter 1 - Maiden of Miracles (Act I)

- ::task:: Recruit new units
  - ::item_story:: ||Nolan|| (Level 9 ||Fighter||, automatic)
- ::task:: Collect dropped items
  - ::item_uncommon:: 1 Steel Sword (from boss ||Isaiya||)
- ::missable:: Hidden items - must wait on specific spaces
  - ::missable:: 1 ||Beastfoe|| (1 left, 1 down from top left healing jar)
```

### Custom Checklist Example

```
::note:: Game Information
This is a Fire Emblem: The Sacred Stones checklist.
**Difficulty:** Hard Mode recommended for optimal experience.

# Chapter 1 - Village Defense
- ::task:: Complete main objectives
  - ::task:: Defeat all enemies
  - ::task:: Protect villagers
- ::item_uncommon:: ||Iron Sword|| (from defeated soldier)
- ::missable:: Rescue villagers before they are defeated
- ::item_story:: ||New Character|| joins after chapter
- ::task:: Visit [strategy guide](https://example.com/strategy) for more tips
- ::note:: Boss Strategy
  The boss has high defense but low resistance.
  Use magic or bows for best results.
```

## Schema for AI-Generated Checklists

If you're using an AI tool to generate a checklist, you can provide this schema description:

```
Create a checklist using this format:
1. Categories are denoted with "# Category Name"
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

## Fire Emblem: Radiant Dawn Content Coverage

This checklist includes coverage of:

### Complete Game Coverage

- Act I: Silver Haired Maiden - All chapters
- Act II: Of Countries and Kings - All chapters
- Act III: Intersecting Vows - Coverage to come
- Act IV: Crossroads - Coverage to come

### Spoiler Protection

- All character names are hidden by default
- All class names and promotions are protected
- Special weapon names (Wind Edge, Wo Dao, Beastfoe, etc.)
- Rare item names (Thani, Red Gem, Paragon Skill, etc.)
- Stat-boosting items (Energy Drop, Speedwing, Talisman, etc.)
- Skill-teaching items (Arms Scroll, Discipline Scroll, etc.)
- Special equipment (Brave Sword, Silver Axe, Dracoshield, etc.)
- Boss names and locations are concealed
- Conversation-specific items are protected
- Click any `???` to reveal when ready

### Progress Tracking

- Visual completion statistics
- Chapter-by-chapter progress
- Item collection tracking
- Character recruitment status
- Missable content verification

## Storage

Your checklists are saved in your browser's local storage. They will persist across browser sessions, but clearing your browser data will remove them. Use the Export/Import feature to back up your checklists.
