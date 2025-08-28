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
   - Go to "Create/Edit List" tab to modify the checklist
   - Add your own notes, reminders, or custom items
   - Use the export/import feature to backup your customizations

## Checklist Format

Use the following format to create your checklist:

```
# Category Name
- Item text
  - Sub-item text
- Another item
```

### Item Types

You can use prefixes to specify item types:

- `::task::` - Regular task
- `::missable::` - Urgent/missable task
- `::item_uncommon::` - Special item
- `::item_story::` - Important note/character

### Spoiler Protection

Hide sensitive content with double pipes:

- `||hidden text||` - Creates a clickable spoiler box
- Renders as `???` that reveals content when clicked
- Perfect for hiding character names, locations, and important plot points

### Adding Links

You can add links to your checklist items using markdown format:

```
- ::task:: Check the [character recruitment guide](https://example.com/characters)
```

This will render as a clickable link that opens in a new tab.

## Branch System

The branch system allows you to create conditional checklist content based on user choices. This is perfect for games with multiple paths, character choices, or different difficulty modes.

### Basic Branch Syntax

```
::branch::variable_name::Option 1|Option 2|Option 3

::branch_start::option_value
- Content specific to this option
- More content for this choice
::branch_end::option_value

::branch_start::other_option
- Different content for other choice
::branch_end::other_option
```

### How It Works

1. **Branch Declaration**: `::branch::variable_name::Option 1|Option 2` creates a selection UI
2. **Branch Sections**: Content between `::branch_start::` and `::branch_end::` is conditional
3. **Variable Names**: Use descriptive names that explain the choice (e.g., `character_choice`, `difficulty_mode`)
4. **Option Values**: Simple identifiers for each choice (e.g., `recruit`, `skip`, `normal`, `hard`)

### Variable Naming Conventions

Use descriptive, consistent naming for branch variables:

```
✅ Good Examples:
::branch::character_recruitment::Recruit|Skip
::branch::difficulty_mode::Normal|Hard|Maniac
::branch::story_path::Path A|Path B|Path C
::branch::alignment_choice::Light|Dark|Neutral

❌ Avoid:
::branch::choice1::Yes|No
::branch::option::A|B|C
::branch::var1::Opt1|Opt2
```

### Nesting Branches

Branches can be nested infinitely - selections made in one branch can affect what branches appear later:

```
::branch::main_path::Forest|Mountain|River

::branch_start::forest
- Forest path content
::branch_start::forest

::branch_start::mountain
- Mountain path content
::branch_end::mountain

::branch_start::river
- River path content
::branch_end::river
```

### Branch Behavior

- **Default State**: No content shown until user makes a selection
- **Selection Persistence**: Choices are saved per profile and remembered
- **Dynamic Updates**: Checklist updates immediately when options are selected
- **Visual Feedback**: Selected option is highlighted, others appear smaller

### Use Cases

#### Game Routes (Fire Emblem Sacred Stones)

```
::branch::lord_selection::Ephraim Path|Eirika Path

::branch_start::ephraim_path
# Chapter 9 (Ephraim) - Fort Rigwald
- ::task:: Ephraim-specific objectives
::branch_end::ephraim_path

::branch_start::eirika_path
# Chapter 9 (Eirika) - Hamill Canyon
- ::task:: Eirika-specific objectives
::branch_end::eirika_path
```

#### Character Recruitment Choices

```
::branch::character_choice::Recruit|Ignore

::branch_start::recruit
- ::missable:: Talk to character within 5 turns
- ::item_story:: Character joins party
::branch_end::recruit

::branch_start::ignore
- Character becomes enemy or NPC
::branch_end::ignore
```

#### Difficulty-Specific Content

```
::branch::difficulty::Normal|Hard|Maniac

::branch_start::normal
- Standard enemy difficulty
- Normal item rewards
::branch_end::normal

::branch_start::hard
- Increased enemy stats
- Better item rewards
- Additional challenges
::branch_end::hard
```

### Best Practices

1. **Clear Variable Names**: Use descriptive names that explain the choice
2. **Consistent Option Values**: Keep option values simple and consistent
3. **Logical Grouping**: Group related choices together
4. **Progressive Disclosure**: Use branches to avoid overwhelming users with all options at once
5. **Test Thoroughly**: Verify all branch combinations work as expected

### Technical Notes

- Branch selections are stored per profile in browser localStorage
- Branch UI appears directly in the checklist flow, interrupting it at the branch point
- Only one option per branch can be selected at a time
- Nested branches work by evaluating outer branches first, then inner branches
- Branch choices persist across browser sessions for each profile

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
# Chapter 1 - Village Defense
- ::task:: Complete main objectives
  - ::task:: Defeat all enemies
  - ::task:: Protect villagers
- ::item_uncommon:: ||Iron Sword|| (from defeated soldier)
- ::missable:: Rescue villagers before they are defeated
- ::item_story:: ||New Character|| joins after chapter
- ::task:: Visit [strategy guide](https://example.com/strategy) for more tips
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
5. Spoiler protection: Use ||text|| to hide sensitive content
6. Links can be added using markdown format: [Link text](https://example.com)

Example:
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
