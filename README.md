# Fire Emblem: Radiant Dawn Plus Spoiler-Free (ehhhh) Checklist

A specialized checklist tool designed for Fire Emblem: Radiant Dawn+, featuring comprehensive game content with built-in spoiler protection. Track items, characters, missables, and progress.

## Features

- **🎯 Complete Fire Emblem: Radiant Dawn Coverage** - The first two acts with detailed item, character, and missable tracking
- **🔒 Built-in Spoiler Protection** - Click-to-reveal spoilers for character names, classes, items, and locations
- **📊 Progress Tracking** - Visual completion statistics and filtering options
- **🎮 Game-Specific Content** - Automatically loads comprehensive FE:Radiant Dawn checklist
- **📱 Mobile-Friendly** - Responsive design that works on all devices
- **👥 Multiple Profiles** - Manage different playthroughs or checklist versions
- **💾 Import/Export** - Backup and share your checklists
- **🔗 Rich Content** - Support for links, different item types, and nested categories
- **⚡ Fast Loading** - Optimized for quick access to game information

## How to Use

### Getting Started with Fire Emblem: Radiant Dawn

1. **Automatic Setup**

   - The tool automatically loads the complete Fire Emblem: Radiant Dawn checklist when you first visit
   - Character names, classes, and key items are hidden behind spoiler protection
   - Click on `???` boxes to reveal hidden content

2. **Navigate the Checklist**

   - Browse through all three acts: Silver Haired Maiden, Of Countries and Kings, and Intersecting Vows
   - Use the table of contents to jump to specific chapters
   - Filter items by type: tasks, missables, special items, story elements

3. **Track Your Progress**

   - Check off items as you complete them in-game
   - Use "Hide Completed" to focus on remaining tasks
   - View progress statistics in the header

4. **Spoiler Protection**

   - Character names, classes, and important items are hidden by default
   - Click on any `???` box to reveal the hidden content
   - Perfect for avoiding spoilers during your playthrough

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
- ::task:: Check the [project documentation](https://example.com/docs)
```

This will render as a clickable link that opens in a new tab.

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

### Generic Example

```
# Shopping List
- ::task:: Buy groceries
  - ::task:: Milk
  - ::task:: Eggs
  - ::missable:: Fresh bread (expires soon!)
# Work Tasks
- ::task:: Complete project report
- ::missable:: Submit timesheet by Friday
- ::task:: Review [company guidelines](https://example.com/guidelines)
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
# Shopping List
- ::task:: Buy groceries
  - ::task:: Milk
  - ::task:: Eggs
  - ::missable:: Fresh bread (expires soon!)
# Work Tasks
- ::task:: Complete project report
- ::missable:: Submit timesheet by Friday
- ::task:: Check [company policy](https://example.com/policy)
- ::task:: Meet the new ||secret employee|| in the ||hidden office||

Convert the following list into a properly formatted checklist:
[YOUR LIST HERE]
```

## Fire Emblem: Radiant Dawn Content Coverage

This checklist includes comprehensive coverage of:

### **📖 Complete Game Coverage**

- **Act I: Silver Haired Maiden** - All 9 chapters + prologue and endgame
- **Act II: Of Countries and Kings** - All 3 chapters + prologue and endgame
- **Act III: Intersecting Vows** - Prologue (more content coming)

### **🎯 What's Tracked**

- ✅ **Items**: Weapons, tomes, scrolls, consumables, and rare treasures
- ✅ **Characters**: All recruitable units with classes and levels
- ✅ **Missables**: Hidden items, conversations, and bonus objectives
- ✅ **Bosses**: Enemy information and strategies
- ✅ **Locations**: Chapter objectives and key areas
- ✅ **Progression**: Level-ups, skill acquisition, and base management

### **🔒 Spoiler Protection**

- All character names are hidden by default
- Class names and promotions are protected
- Key item names and locations are hidden
- Boss names and important plot points are concealed
- Click any `???` to reveal when ready

### **📊 Progress Tracking**

- Visual completion statistics
- Chapter-by-chapter progress
- Item collection tracking
- Character recruitment status
- Missable content verification

## Storage

Your checklists are saved in your browser's local storage. They will persist across browser sessions, but clearing your browser data will remove them. Use the Export/Import feature to back up your checklists.

## Browser Compatibility

This tool works best in modern browsers such as:

- Chrome
- Firefox
- Edge
- Safari

