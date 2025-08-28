// Storage keys
const profilesKey = "profiles";
const importedHashesKey = "imported_hashes"; // Key for storing imported URL hashes

function sanitize(s) {
  return s
    .split("")
    .map((char) => {
      // Regex tests for valid id characters
      return /^[A-Za-z0-9\-_]$/.test(char) ? char : "_";
    })
    .join("");
}

// Function to load checklist.md content
// Load templates index from checklists/index.json
async function loadTemplatesIndex() {
  try {
    const response = await fetch('checklists/index.json');
    if (!response.ok) {
      throw new Error('Failed to load checklists/index.json');
    }
    const data = await response.json();
    return data.templates || [];
  } catch (error) {
    console.error('Error loading templates index:', error);
    return [];
  }
}

// Parse YAML frontmatter from markdown content
function parseYamlFrontmatter(content) {
  // Check if content starts with ---
  if (!content.startsWith('---\n')) {
    return { content, frontmatter: null };
  }

  // Find the end of frontmatter (second ---)
  const endIndex = content.indexOf('\n---\n', 4);
  if (endIndex === -1) {
    return { content, frontmatter: null };
  }

  // Extract frontmatter and content
  const frontmatterText = content.substring(4, endIndex);
  const markdownContent = content.substring(endIndex + 5);

  return { content: markdownContent, frontmatter: null }; // Simplified - no frontmatter processing needed for notes
}

// Load a specific template by filename
async function loadTemplate(filename) {
  if (!filename) {
    return "# Getting Started\n- ::task:: This is a blank checklist for tracking game missables and progress. Add your content here.";
  }

  try {
    const response = await fetch(`checklists/${filename}`);
    if (!response.ok) {
      throw new Error(`Failed to load template: ${filename}`);
    }

    const rawContent = await response.text();
    const { content } = parseYamlFrontmatter(rawContent);

    return content;
  } catch (error) {
    console.error(`Error loading template ${filename}:`, error);
    return "# Getting Started\n- ::task:: This is a community checklist for tracking game missables. Use the checklist tab to view game content with spoiler protection.";
  }
}

// Populate template dropdown in profile modal
async function populateTemplateDropdown() {
  const templates = await loadTemplatesIndex();
  const $dropdown = $("#profileModalTemplate");

  // Clear existing options
  $dropdown.empty();

  // Add templates to dropdown
  templates.forEach(template => {
    const $option = $("<option>")
      .val(template.id)
      .text(template.name)
      .attr("title", template.description);
    $dropdown.append($option);
  });

  // Set default selection to fire-emblem-project-ember if available, otherwise radiant-dawn-plus, otherwise blank
  const defaultTemplate = templates.find(t => t.id === 'fire-emblem-project-ember') ?
    'fire-emblem-project-ember' :
    (templates.find(t => t.id === 'radiant-dawn-plus') ? 'radiant-dawn-plus' : 'blank');
  $dropdown.val(defaultTemplate);
}

async function generateTasks() {
  let markdownString = "";

  // Try to load custom checklist from localStorage first
  const currentProfile = await getCurrentProfile();
  if (currentProfile && currentProfile.checklistContent) {
    // Ensure checklistContent is a string
    const content = typeof currentProfile.checklistContent === 'string' ? currentProfile.checklistContent : String(currentProfile.checklistContent || '');
    processMarkdown(content);
    // Update the page title based on the profile/template
    await updatePageTitle(currentProfile);
    // Also populate the editor
    document.getElementById("checklist-content").value = content;
    return;
  }

  // If no custom checklist exists, try to load from checklist.md
  try {
    const templateData = await loadChecklistFromFile();
    if (templateData) {
      processMarkdown(templateData);
      // Also populate the editor with the loaded content
      document.getElementById("checklist-content").value = templateData;
    } else {
      // If checklist.md fails to load, show a default getting started checklist
      const defaultChecklist = "# Getting Started\n- ::task:: This is a community checklist for tracking game missables. Use the checklist tab to view game content with spoiler protection.";
      processMarkdown(defaultChecklist);
      // Also populate the editor with a starter example
      document.getElementById("checklist-content").value = "::note:: Getting Started Guide\nWelcome to your custom checklist! This is a note block.\n\n**Quick Tips:**\n- Check off items as you complete them\n- Use branches for multiple paths\n- Visit [help documentation](https://example.com) for more features\n\n# Prologue - Tutorial\n- ::task:: Complete main objectives\n  - ::missable:: Complete side objective before time runs out\n- ::item_uncommon:: ||Special Item|| (from enemy drop)\n- ::item_story:: ||New Character|| (joins after completion)\n- ::task:: Find the hidden ||secret item|| in the area\n- ::task:: Visit [strategy guide](https://example.com) for more tips\n- ::note:: Level Strategy\n  This area requires careful positioning.\n  **Tip:** Save before attempting the boss!";
    }
  } catch (error) {
    console.error('Error in generateTasks:', error);
    // Fallback to default checklist
    const defaultChecklist = "# Getting Started\n- ::task:: This is a community checklist for tracking game missables. Use the checklist tab to view game content with spoiler protection.";
    processMarkdown(defaultChecklist);
    document.getElementById("checklist-content").value = "::note:: Example Checklist\nThis is a sample checklist showing all features.\n\n# Prologue - Tutorial\n- ::task:: Complete main objectives\n  - ::missable:: Complete side objective before time runs out\n- ::item_uncommon:: ||Special Item|| (from enemy drop)\n- ::item_story:: ||New Character|| (joins after completion)\n- ::task:: Find the hidden ||secret item|| in the area\n- ::task:: Visit [strategy guide](https://example.com) for more tips\n- ::note:: Strategy Note\n  Be careful in this area - enemies respawn!";
  }
}

// This function is replaced by processMarkdownWithBranches - keeping for reference but redirecting
function processMarkdown(markdownString) {
  // Get profile ID and process with branch support
  getCurrentProfile().then(currentProfile => {
    const profileId = currentProfile ? currentProfile.id : null;
    processMarkdownWithBranches(markdownString, profileId);
  }).catch(error => {
    console.warn('Error getting current profile for markdown processing:', error);
    processMarkdownWithBranches(markdownString, null);
  });
}

// =========================================
// BRANCH SYSTEM IMPLEMENTATION
// =========================================

// Branch state management - store choices per profile
const branchChoicesKey = "branch_choices";

function getBranchChoices(profileId) {
  const allChoices = JSON.parse(localStorage.getItem(branchChoicesKey) || '{}');
  return allChoices[profileId] || {};
}

function saveBranchChoice(profileId, branchName, option) {
  const allChoices = JSON.parse(localStorage.getItem(branchChoicesKey) || '{}');
  if (!allChoices[profileId]) {
    allChoices[profileId] = {};
  }
  allChoices[profileId][branchName] = option;
  localStorage.setItem(branchChoicesKey, JSON.stringify(allChoices));
}

function clearBranchChoice(profileId, branchName) {
  const allChoices = JSON.parse(localStorage.getItem(branchChoicesKey) || '{}');
  if (allChoices[profileId]) {
    delete allChoices[profileId][branchName];
    localStorage.setItem(branchChoicesKey, JSON.stringify(allChoices));
  }
}

// Validate branch nesting structure
function validateBranchNesting(markdownLines) {
  const branchStack = [];
  const errors = [];

  for (let i = 0; i < markdownLines.length; i++) {
    const line = markdownLines[i].trim();
    const lineNumber = i + 1;

    // Track branch_start markers
    if (line.startsWith('::branch_start::')) {
      const optionMatch = line.match(/^::branch_start::(.+)$/);
      if (optionMatch) {
        const optionValue = optionMatch[1];
        branchStack.push({
          option: optionValue,
          startLine: lineNumber,
          type: 'branch_start'
        });
      }
    }
    // Track branch_end markers
    else if (line.startsWith('::branch_end::')) {
      const optionMatch = line.match(/^::branch_end::(.+)$/);
      if (optionMatch) {
        const optionValue = optionMatch[1];

        // Find the position of the matching branch_start in the stack
        let matchIndex = -1;
        for (let j = branchStack.length - 1; j >= 0; j--) {
          if (branchStack[j].option === optionValue && branchStack[j].type === 'branch_start') {
            matchIndex = j;
            break;
          }
        }

        if (matchIndex === -1) {
          errors.push({
            line: lineNumber,
            message: `Branch end marker "::branch_end::${optionValue}" has no matching start marker`,
            branch: optionValue
          });
        } else {
          // Check if this end marker is trying to close out of order (improper nesting)
          // All branches after the matching start should be properly closed first
          for (let k = matchIndex + 1; k < branchStack.length; k++) {
            const unclosedBranch = branchStack[k];
            if (unclosedBranch.type === 'branch_start') {
              errors.push({
                line: lineNumber,
                message: `Branch "::branch_end::${optionValue}" is trying to close before nested branch "${unclosedBranch.option}" (started at line ${unclosedBranch.startLine}) is closed. Improper nesting detected.`,
                branch: optionValue
              });
              break; // Only report the first improper nesting
            }
          }

          // Remove the matching start and everything after it (proper nesting behavior)
          branchStack.splice(matchIndex);
        }
      }
    }
  }

  // Check for unclosed branch_start markers
  branchStack.forEach(unclosed => {
    if (unclosed.type === 'branch_start') {
      errors.push({
        line: unclosed.startLine,
        message: `Branch start marker "::branch_start::${unclosed.option}" is never closed`,
        branch: unclosed.option
      });
    }
  });

  return errors;
}

// Parse branch markers and return structured data
function parseBranches(markdownLines) {
  // First validate the branch structure
  const validationErrors = validateBranchNesting(markdownLines);
  if (validationErrors.length > 0) {
    // Show validation errors to user
    validationErrors.forEach(error => {
      showFeedback(
        `Branch Error (Line ${error.line}): ${error.message}`,
        'error'
      );
    });

    // Log detailed errors for debugging
    console.error('Branch validation errors:', validationErrors);
  }

  const branches = {};
  const notes = [];
  const branchStack = [];
  let currentBranch = null;
  let branchLevel = 0;
  let currentNote = null;

  // Parse branch markers from markdown

  for (let i = 0; i < markdownLines.length; i++) {
    const line = markdownLines[i].trim();

    // Parse ::note::Note Title (both standalone and in list items)
    if (line.includes('::note::')) {
      const noteMatch = line.match(/::note::(.+)$/);
      if (noteMatch) {
        const noteTitle = noteMatch[1].trim();
        currentNote = {
          lineNumber: i,
          title: noteTitle,
          content: []
        };
        notes.push(currentNote);
      }
    }
    // Collect content for current note (any non-empty lines that aren't structural markers)
    else if (currentNote && line !== "" && !line.startsWith('::') && !line.startsWith('# ') && !line.startsWith('- ')) {
      currentNote.content.push(markdownLines[i]); // Keep original line with indentation
    }
    // Stop collecting note content when we hit another structural element
    else if (currentNote && (line.includes('::note::') || line.startsWith('::branch::') || line.startsWith('# ') || line.startsWith('- '))) {
      currentNote = null;
    }
    // Parse ::branch::branch_name::Option 1|Option 2|Option 3
    // Also supports ::branch::branch_name::Option 1|Option 2::Custom Title
    else if (line.startsWith('::branch::')) {
      const branchMatch = line.match(/^::branch::([^:]+)::(.+)$/);
      if (branchMatch) {
        const branchName = branchMatch[1];
        const remaining = branchMatch[2];

        // Check if there's a custom title (double :: separator)
        let optionsString, customTitle;
        if (remaining.includes('::')) {
          const parts = remaining.split('::');
          optionsString = parts[0];
          customTitle = parts[1];
        } else {
          optionsString = remaining;
          customTitle = null;
        }

        const options = optionsString.split('|').map(opt => opt.trim());

        // Check for duplicate branch names (this IS a problem)
        if (branches[branchName]) {
          console.warn(`Duplicate branch name detected: "${branchName}"`);
          console.warn(`  First definition at line ${branches[branchName].lineNumber + 1}`);
          console.warn(`  Second definition at line ${i + 1}`);
          showFeedback(`Warning: Duplicate branch name "${branchName}" found at lines ${branches[branchName].lineNumber + 1} and ${i + 1}. This will cause conflicts in branch selection.`, "warning");
        }

        branches[branchName] = {
          lineNumber: i,
          options: options,
          customTitle: customTitle,
          sections: {}
        };

        currentBranch = branchName;
        branchLevel = 0;
      }
    }
    // Parse ::branch_start::option_value
    else if (line.startsWith('::branch_start::')) {
      const optionMatch = line.match(/^::branch_start::(.+)$/);
      if (optionMatch) {
        const optionValue = optionMatch[1];

        // Find the corresponding branch for this option
        let targetBranch = currentBranch;
        for (const [branchName, branchData] of Object.entries(branches)) {
          if (branchData.options.includes(optionValue)) {
            targetBranch = branchName;
            break;
          }
        }

        if (targetBranch && branches[targetBranch]) {
          branchStack.push({ branch: targetBranch, option: optionValue, startLine: i });
          branchLevel++;

          // Initialize section if not exists
          if (!branches[targetBranch].sections[optionValue]) {
            branches[targetBranch].sections[optionValue] = { startLine: i, endLine: null, content: [] };
          }
        }
      }
    }
    // Parse ::branch_end::option_value
    else if (line.startsWith('::branch_end::')) {
      const optionMatch = line.match(/^::branch_end::(.+)$/);
      if (optionMatch && branchStack.length > 0) {
        const optionValue = optionMatch[1];

        // Find the matching branch section from the stack
        let matchingIndex = -1;
        for (let j = branchStack.length - 1; j >= 0; j--) {
          if (branchStack[j].option === optionValue) {
            matchingIndex = j;
            break;
          }
        }

        if (matchingIndex >= 0) {
          const matchingBranch = branchStack[matchingIndex];
          branches[matchingBranch.branch].sections[optionValue].endLine = i;

          // Remove the matching section and all sections after it (for proper nesting)
          branchStack.splice(matchingIndex);
          branchLevel = branchStack.length;

          if (branchLevel === 0) {
            currentBranch = null;
          }
        }
      }
    }
  }

  // Additional validation: Check for branch declarations without any sections
  for (const [branchName, branchData] of Object.entries(branches)) {
    const hasAnySections = Object.keys(branchData.sections).length > 0;
    if (!hasAnySections) {
      showFeedback(
        `Branch Warning: Branch "${branchName}" (Line ${branchData.lineNumber + 1}) has options but no corresponding ::branch_start:: sections`,
        'error'
      );
    } else {
      // Check if all declared options have sections
      for (const option of branchData.options) {
        if (!branchData.sections[option]) {
          showFeedback(
            `Branch Warning: Branch "${branchName}" declares option "${option}" but has no ::branch_start::${option} section`,
            'error'
          );
        }
      }
    }
  }

  // Branches and notes parsed successfully

  return { branches, notes };
}

// Render branch selector UI
function renderBranchSelector(branchName, branchData, selectedOption = null) {
  const options = branchData.options;
  const optionButtons = options.map(option => {
    const isSelected = selectedOption === option;
    let classes = 'branch-option chunky-button';

    if (isSelected) {
      classes += ' selected';
    } else if (selectedOption) {
      // If another option is selected, make this one small
      classes += ' small';
    }

    // Escape HTML attributes to handle spaces and special chars
    const escapedOption = option.replace(/"/g, '&quot;');
    return `<button class="${classes}" data-branch="${branchName}" data-option="${escapedOption}">${option}</button>`;
  }).join('\n');

  // Use custom title if provided, otherwise generate dynamic title
  let title = branchData.customTitle || generateBranchTitle(branchName, options);

  return `<div id="branch-${branchName}" class="branch-selector no-checklist-processing" data-branch="${branchName}" data-title="${title}">
    <div class="branch-options">
      ${optionButtons}
    </div>
  </div>`;
}

// Generate simple title from branch name
function generateBranchTitle(branchName, options) {
  // Just format the variable name nicely
  return branchName
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
}

// Render note block UI (similar to branch but static)
function renderNoteBlock(title, content) {
  const processedContent = content.map(line => {
    // Basic markdown processing for notes
    let processed = line;

    // Convert markdown links
    processed = processed.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');

    // Convert bold text
    processed = processed.replace(/(\*\*|__)(.*?)\1/g, '<strong>$2</strong>');

    return processed;
  }).join('<br>');

  return `<div class="note-block" data-title="${title}">
    <div class="note-header">
      <strong>${title}</strong>
    </div>
    <div class="note-content">
      ${processedContent}
    </div>
  </div>`;
}

// Check if content should be shown based on branch selections
function shouldShowContent(branches, lineNumber, profileId) {
  // If no profileId, default to showing content
  if (!profileId) {
    return true;
  }

  const choices = getBranchChoices(profileId);

  // Check if this line is within any branch section
  // We need to check ALL containing branches (for nested branches)
  for (const [branchName, branchData] of Object.entries(branches)) {
    for (const [optionValue, section] of Object.entries(branchData.sections)) {
      if (section.startLine !== null && section.endLine !== null &&
        lineNumber > section.startLine && lineNumber < section.endLine) {
        const selectedOption = choices[branchName];

        // If no option is selected for this branch, HIDE all sections
        if (!selectedOption) {
          return false;
        }

        // If an option is selected, only show content for that specific option
        if (selectedOption !== optionValue) {
          return false;
        }

        // This branch allows the content, but we need to check if there are other containing branches
        // Continue checking other branches that might also contain this line
      }
    }
  }

  // If we get here, either:
  // 1. This line is not within any branch section (show it)
  // 2. All containing branch sections have their selected options (show it)
  return true;
}

// Process markdown with branch support
function processMarkdownWithBranches(markdownString, profileId) {

  const lines = markdownString.split("\n");
  const { branches, notes } = parseBranches(lines);
  let htmlOutput = "";

  for (let i = 0; i < lines.length; i++) {
    const originalLine = lines[i];
    let line = originalLine ? originalLine.trim() : "";

    // Skip empty lines
    if (line === "") {
      continue;
    }

    // Handle note markers - insert directly into checklist flow
    if (line.includes('::note::')) {
      // First check if this note should be visible based on containing branches
      if (!shouldShowContent(branches, i, profileId)) {
        continue;
      }

      // Find the note data
      const note = notes.find(n => n.lineNumber === i);
      if (note) {
        // SIMPLE FIX: Always close current list before note, then handle next content
        // Always close any current list context before inserting note
        htmlOutput += '</ul>\n';

        // Insert note block
        const noteHTML = renderNoteBlock(note.title, note.content);
        htmlOutput += noteHTML + '\n';

        // Check if we need to open a new list for subsequent content
        let needsNewList = false;
        for (let j = i + 1; j < lines.length; j++) {
          const nextLine = lines[j] ? lines[j].trim() : "";

          // Skip empty lines and branch markers
          if (nextLine === "" || nextLine.startsWith('::branch_start::') || nextLine.startsWith('::branch_end::') || nextLine.includes('::note::')) {
            continue;
          }

          // Check if this line should be shown (branches control visibility)
          if (!shouldShowContent(branches, j, profileId)) {
            continue;
          }

          // If it's a list item (not a heading), we need to open a new list
          if ((nextLine.startsWith("- ") || /^(\t| {2})+\- /.test(lines[j]))) {
            needsNewList = true;
          }
          break; // Stop at first visible content line
        }

        // Open new list if needed for subsequent content
        if (needsNewList) {
          htmlOutput += '<ul class="panel-collapse collapse in">\n';
        }
      }
      continue; // Skip normal processing for note markers
    }

    // Handle branch selector markers - insert directly into checklist flow
    if (line.startsWith('::branch::')) {
      // First check if this branch selector should be visible based on containing branches
      if (!shouldShowContent(branches, i, profileId)) {
        continue;
      }
      const branchMatch = line.match(/^::branch::([^:]+)::(.+)$/);
      if (branchMatch) {
        const branchName = branchMatch[1];
        const branchData = branches[branchName];

        if (branchData) {
          // SIMPLE FIX: Always close current list before branch, then handle next content

          // Always close any current list context before inserting branch
          htmlOutput += '</ul>\n';

          // Insert branch selector (branches are always at top level)
          const choices = getBranchChoices(profileId);
          const selectedOption = choices[branchName];
          const branchSelectorHTML = renderBranchSelector(branchName, branchData, selectedOption);
          htmlOutput += branchSelectorHTML + '\n';

          // Check if we need to open a new list for subsequent content
          let needsNewList = false;
          for (let j = i + 1; j < lines.length; j++) {
            const nextLine = lines[j] ? lines[j].trim() : "";

            // Skip empty lines and branch markers
            if (nextLine === "" || nextLine.startsWith('::branch_start::') || nextLine.startsWith('::branch_end::') || nextLine.includes('::note::')) {
              continue;
            }

            // Check if this line should be shown (branches control visibility)
            if (!shouldShowContent(branches, j, profileId)) {
              continue;
            }

            // If it's a list item (not a heading), we need to open a new list
            if ((nextLine.startsWith("- ") || /^(\t| {2})+\- /.test(lines[j]))) {
              needsNewList = true;
            }
            break; // Stop at first visible content line
          }

          // Open new list if needed for subsequent content
          if (needsNewList) {
            htmlOutput += '<ul class="panel-collapse collapse in">\n';
          }
        }
        continue; // Skip normal processing for branch markers
      }
    }

    // Skip branch_start and branch_end markers (they're handled by shouldShowContent)
    if (line.startsWith('::branch_start::') || line.startsWith('::branch_end::')) {
      continue;
    }

    // Check if this line should be shown based on branch selections
    if (!shouldShowContent(branches, i, profileId)) {
      continue;
    }

    // Calculate indentation level; 1 tab or 2 spaces equals 1 level
    const level = originalLine.match(/^(?:\t| {2})*/)[0].length;

    // Check if the line starts with '# ' indicating a header
    if (line.startsWith("# ")) {
      const headerText = line.substr(2);
      const idText = sanitize(headerText);

      // Debug header processing at line 170
      if (i === 169) { // 0-indexed, line 170 is index 169
        console.log('🔍 HEADER PROCESSING AT LINE 170:');
        console.log('  Header text:', headerText);
        console.log('  HTML before header:', htmlOutput.slice(-100));
        console.log('  ➕ HEADER ADDING </ul> then <ul>');
      }

      htmlOutput += `</ul><h3 id="${idText}"><a href="#" data-toggle="collapse" data-parent="#tabPlaythrough" class="btn btn-primary btn-collapse btn-sm"></a><a href="#">${headerText}</a></h3>\n`;
      htmlOutput += '<ul class="panel-collapse collapse in">\n';
    }
    // Check if the line starts with '- ' indicating a list item (main or sub-bullet based on indentation)
    else if ((line.startsWith("- ") || /^(\t| {2})+\- /.test(originalLine)) && !line.includes('branch-option') && !line.includes('branch-selector')) {

      // Extract the text after '- ' and trim any leading/trailing spaces
      let listItemText = line.substr(2).trim();

      // If there's no icon, default to ::task::
      if (!listItemText.includes("::")) {
        listItemText = "::task::" + listItemText;
      }

      // Replace ::missable:: with a clock icon, ::item:: with the gem icon, ::ability:: with mortarboard icon, and ::task::, if present or added above
      listItemText = listItemText.replace(
        /::missable::\s*/g,
        '<i class="bi bi-stopwatch text-danger"></i>'
      );
      // Remove unused item types
      listItemText = listItemText.replace(
        /::item_uncommon::\s*/g,
        '<i class="bi bi-gem text-success"></i>'
      );
      listItemText = listItemText.replace(
        /::item_story::\s*/g,
        '<i class="bi bi-book text-danger"></i>'
      );
      listItemText = listItemText.replace(
        /::task::\s*/g,
        '<i class="bi bi-clipboard-check"></i>'
      );

      // Convert markdown bold syntax to HTML
      listItemText = listItemText.replace(/(\*\*|__)(.*?)\1/g, '<strong>$2</strong>');

      // Check if there's an item with an unintentional parenthesis at the start
      // This pattern matches items that start with a closing parenthesis followed by text
      const orphanedParenPattern = /^(<i class="bi [^>]+><\/i>)\)\s*(.*)/;
      const orphanedParenMatch = listItemText.match(orphanedParenPattern);
      if (orphanedParenMatch) {
        // Fix the format by removing the orphaned parenthesis
        listItemText = `${orphanedParenMatch[1]}${orphanedParenMatch[2]}`;
      }

      // Process spoilers first (before links to avoid conflicts)
      let processedText = '';
      let lastIndex = 0;
      let currentText = listItemText;

      // Process spoilers: ||text||
      while (true) {
        const openSpoilerIndex = currentText.indexOf('||', lastIndex);
        if (openSpoilerIndex === -1) {
          // No more spoiler delimiters found, append the rest of the text
          processedText += currentText.substring(lastIndex);
          break;
        }

        // Append text before the spoiler
        processedText += currentText.substring(lastIndex, openSpoilerIndex);

        // Find the matching closing spoiler delimiter
        const closeSpoilerIndex = currentText.indexOf('||', openSpoilerIndex + 2);
        if (closeSpoilerIndex !== -1) {
          // Valid spoiler found!
          const spoilerText = currentText.substring(openSpoilerIndex + 2, closeSpoilerIndex);

          // Generate unique ID for this spoiler
          const spoilerId = 'spoiler_' + Math.random().toString(36).substr(2, 9);

          // Create spoiler HTML
          processedText += `<span class="spoiler-container" id="${spoilerId}"><span class="spoiler-content">${spoilerText}</span></span>`;
          lastIndex = closeSpoilerIndex + 2; // Move past the closing delimiter
        } else {
          // Malformed spoiler, treat as plain text
          processedText += '||';
          lastIndex = openSpoilerIndex + 2;
        }
      }

      currentText = processedText; // Update currentText with processed spoilers
      processedText = '';
      lastIndex = 0;

      // Convert markdown-style links to HTML links
      while (true) {
        const openBracketIndex = currentText.indexOf('[', lastIndex);
        if (openBracketIndex === -1) {
          // No more opening brackets found, append the rest of the text
          processedText += currentText.substring(lastIndex);
          break;
        }

        // Append text before the potential link
        processedText += currentText.substring(lastIndex, openBracketIndex);

        // Find the matching closing bracket for the link text
        let bracketDepth = 1;
        let closeBracketIndex = -1;
        for (let i = openBracketIndex + 1; i < currentText.length; i++) {
          if (currentText[i] === '[') {
            bracketDepth++;
          } else if (currentText[i] === ']') {
            bracketDepth--;
            if (bracketDepth === 0) {
              closeBracketIndex = i;
              break;
            }
          }
        }

        // Check if a matching bracket was found and if it's followed by '('
        if (closeBracketIndex !== -1 && currentText[closeBracketIndex + 1] === '(') {
          // Found the structure of a potential link: [text](...)

          // Find the matching closing parenthesis for the URL
          let parenDepth = 1;
          let urlEndIndex = -1;
          const urlStartIndex = closeBracketIndex + 2;
          for (let i = urlStartIndex; i < currentText.length; i++) {
            if (currentText[i] === '(') {
              parenDepth++;
            } else if (currentText[i] === ')') {
              parenDepth--;
              if (parenDepth === 0) {
                urlEndIndex = i;
                break;
              }
            }
          }

          if (urlEndIndex !== -1) {
            // Valid link found!
            const linkText = currentText.substring(openBracketIndex + 1, closeBracketIndex);
            const url = currentText.substring(urlStartIndex, urlEndIndex);

            // Append the HTML link
            processedText += `<a href="${url}" target="_blank">${linkText}</a>`;
            lastIndex = urlEndIndex + 1; // Move past the processed link
          } else {
            // Malformed link (missing closing parenthesis for URL), treat as plain text
            processedText += currentText.substring(openBracketIndex, urlStartIndex); // Append '[text]('
            lastIndex = urlStartIndex;
          }
        } else {
          // Not a link structure, treat the opening bracket as plain text
          processedText += '[';
          lastIndex = openBracketIndex + 1;
        }
      }

      listItemText = processedText; // Update listItemText with processed links and spoilers

      // Also check for orphaned closing parentheses after links have been processed
      listItemText = listItemText.replace(/(<\/a>)\)/g, '$1');

      // Generate a unique ID for the item, starting by preparing a slice without the HTML tags, or else the ID may only get the first 50 characters of HTML (so it won't be unique)
      const listItemTextWithoutTags = listItemText.replace(
        /(<([^>]+)>)/gi,
        ""
      );
      const uuid = sanitize(listItemTextWithoutTags.slice(0, 50)); // Extract only the first 50 characters of the text without HTML tags

      // If the bullet is a top-level bullet (i.e., not indented)
      if (level === 0) {
        htmlOutput += `<li data-id="playthrough_${uuid}">${listItemText}</li>\n`;
      }
      // If the bullet is an indented sub-bullet
      else {
        // If the previous line was not a sub-bullet, begin a new nested list
        if (i === 0 || /^(\t| {2})+\- /.test(lines[i - 1]) === false) {
          htmlOutput += `<ul class="panel-collapse collapse in">\n`;
        }

        // Append the sub-bullet to the output
        htmlOutput += `<li data-id="playthrough_${uuid}">${listItemText}</li>\n`;

        // If the next line is not a sub-bullet, end the nested list
        if (
          i === lines.length - 1 ||
          /^(\t| {2})+\- /.test(lines[i + 1]) === false
        ) {
          htmlOutput += `</ul>\n`;
        }
      }
    }
  }

  // If the last line of the output is a list item, close the list
  if (htmlOutput.endsWith("</li>\n")) {
    htmlOutput += "</ul>\n";
  }

  // Get the container for the converted content and update its innerHTML
  const playthroughDiv = document.getElementById("tabPlaythrough");
  if (playthroughDiv) {
    // Clear existing content except for the title and table of contents
    const title = playthroughDiv.querySelector("h2");
    const toc = playthroughDiv.querySelector(".table_of_contents");
    const hr = playthroughDiv.querySelector("hr");

    // Remove all elements after the hr
    let nextElement = hr.nextElementSibling;
    while (nextElement) {
      const elementToRemove = nextElement;
      nextElement = nextElement.nextElementSibling;
      elementToRemove.remove();
    }

    // Add the new content
    playthroughDiv.innerHTML += htmlOutput;
  }

  // Find any task (li) UUIDs that are duplicated, and asynchronously append the number of times they appear above themselves
  // This should be deterministic, so the same UUIDs should always have the same number appended
  let listItems = document.querySelectorAll("li[data-id]");
  let listItemsArray = Array.from(listItems);
  let shadowArray = listItemsArray.slice();

  listItemsArray.forEach((listItem) => {
    // Get the UUID from the data-id attribute
    let uuid = listItem.getAttribute("data-id").replace("playthrough_", "");

    // Get the index of the current li element in the shadow array
    let index = shadowArray.indexOf(listItem);

    // Get the number of occurrences of the UUID above the current li element in the shadow array
    let occurrences = shadowArray.slice(0, index).filter((item) => {
      return item.getAttribute("data-id").includes(uuid);
    }).length;

    // If there are any occurrences, append the number of occurrences to the end of the data-id
    if (occurrences > 0) {
      listItem.setAttribute(
        "data-id",
        listItem.getAttribute("data-id") + "_" + occurrences
      );
    }
  });

  // Run additional functions
  createTableOfContents();
  setUlIdAndSpanIdFromH3();
  addCheckboxes();
  addSpoilerHandlers();
  addBranchHandlers(); // Add branch event handlers

  // Set a recurring timer to watch headers with all subtasks completed
  setInterval(watchEmptyHeaders, 250);
}

// This duplicate function has been removed - using the one above that redirects to processMarkdownWithBranches

// Branch event handlers
function addBranchHandlers() {
  // Handle branch option clicks
  $('.branch-option').off('click.branch').on('click.branch', function (e) {
    e.preventDefault();
    e.stopPropagation();
    const $button = $(this);
    const branchName = $button.data('branch');
    const option = $button.data('option');

    // Branch button clicked

    // Get current profile asynchronously to ensure we have the right ID
    getCurrentProfile().then(currentProfile => {
      if (!currentProfile || !currentProfile.id) {
        console.warn('No active profile found for branch selection');
        showFeedback('Please select a profile first', 'error');
        return;
      }

      const profileId = currentProfile.id;

      // If already selected, unselect it
      if ($button.hasClass('selected')) {
        clearBranchChoice(profileId, branchName);
        $button.removeClass('selected');
        $button.siblings('.branch-option').removeClass('small');
      } else {
        // Update button states: unselect others, select this one, make others small
        $button.siblings('.branch-option').removeClass('selected').addClass('small');
        $button.removeClass('small').addClass('selected');

        // Save the choice
        saveBranchChoice(profileId, branchName, option);
      }

      // Refresh the checklist display
      refreshChecklistDisplay();
    }).catch(error => {
      console.error('Error getting current profile for branch selection:', error);
      showFeedback('Error accessing profile data', 'error');
    });
  });
}

// Get current profile helper
function getCurrentProfile() {
  const profiles = JSON.parse(localStorage.getItem(profilesKey) || '[]');
  const currentProfileName = localStorage.getItem('currentProfile');
  return profiles.find(p => p.name === currentProfileName);
}

// More robust function to get current profile ID using multiple methods
function getCurrentProfileId() {
  // Method 1: Try to get from current profile object
  const currentProfile = getCurrentProfile();
  if (currentProfile && currentProfile.id) {
    return currentProfile.id;
  }

  // Method 2: Try to find profile from currentProfile name and get its ID
  const profiles = JSON.parse(localStorage.getItem(profilesKey) || '[]');
  const currentProfileName = localStorage.getItem('currentProfile');
  if (currentProfileName) {
    const profile = profiles.find(p => p.name === currentProfileName);
    if (profile && profile.id) {
      return profile.id;
    }
  }

  // Method 3: Try to get from profile dropdown or other UI elements
  const selectedProfileId = $('#profileSelect').val();
  if (selectedProfileId) {
    return selectedProfileId;
  }

  // Method 4: If there's only one profile, use it
  if (profiles.length === 1 && profiles[0].id) {
    return profiles[0].id;
  }

  // Method 5: Try to find the first profile with checklist content
  const profileWithContent = profiles.find(p => p.checklistContent);
  if (profileWithContent && profileWithContent.id) {
    return profileWithContent.id;
  }

  return null; // No profile ID found
}



// Refresh checklist display
function refreshChecklistDisplay() {
  getCurrentProfile().then(currentProfile => {
    if (currentProfile && currentProfile.checklistContent) {
      // Ensure checklistContent is a string
      const content = typeof currentProfile.checklistContent === 'string' ? currentProfile.checklistContent : String(currentProfile.checklistContent || '');
      processMarkdown(content);
    }
  }).catch(error => {
    console.error('Error refreshing checklist display:', error);
  });
}

// If hide completed is checked, hide the headers with no subtasks remaining
function watchEmptyHeaders() {
  // If an h3's span has a class of in_progress, show the header
  $("h3 > span.in_progress").each(function () {
    $(this).parent().show();
  });
  // if hide completed is not checked, unhide all and return
  if (!$("body").hasClass("hide_completed")) {
    $("h3 > span.done").each(function () {
      $(this).parent().show();
    });
    return;
  }
  // If an h3's span has a class of done, hide the header
  $("h3 > span.done").each(function () {
    $(this).parent().hide();
  });
}

function setUlIdAndSpanIdFromH3() {
  // Get all h3 elements with an ID
  let headings = document.querySelectorAll("h3[id]");
  let counter = 1; // Initialize the counter

  headings.forEach((heading) => {
    // For setting the ul's id
    let ul = heading.nextElementSibling;
    if (ul && ul.tagName === "UL") {
      let newId = heading.id + "_col";
      ul.id = newId;

      let aTag = heading.querySelector('a[data-toggle="collapse"]');
      if (aTag) {
        aTag.setAttribute("href", `#${newId}`);
      }
    }

    // Look for the "Collapse All" button
    let collapseAllBtn = document.querySelector("#toggleCollapseAll");
    if (collapseAllBtn) {
      collapseAllBtn.addEventListener("click", function (e) {
        e.preventDefault();

        // Toggle the icon display
        const downIcon = collapseAllBtn.querySelector('.glyphicon-chevron-down');
        const upIcon = collapseAllBtn.querySelector('.glyphicon-chevron-up');

        if (downIcon.style.display !== 'none') {
          // If down icon is visible, switch to up icon and collapse all
          downIcon.style.display = 'none';
          upIcon.style.display = 'inline-block';

          // Collapse all sections
          document.querySelectorAll("h3[id] + ul").forEach((ul) => {
            $(ul).collapse("hide");
          });
        } else {
          // If up icon is visible, switch to down icon and expand all
          downIcon.style.display = 'inline-block';
          upIcon.style.display = 'none';

          // Expand all sections
          document.querySelectorAll("h3[id] + ul").forEach((ul) => {
            $(ul).collapse("show");
          });
        }
      });
    }
  });
}

function addCheckboxes() {
  // Make each list item clickable instead of adding separate checkboxes
  $("li[data-id]").each(function () {
    var $el = $(this);
    var dataId = $el.attr("data-id");

    // Set initial state from storage
    getCurrentProfile().then(currentProfile => {
      if (currentProfile && currentProfile.checklistData && currentProfile.checklistData[dataId]) {
        $el.addClass("completed");
      }
    }).catch(error => {
      console.error('Error getting current profile for checkbox state:', error);
    });

    // Add click event to the entire list item instead of a checkbox
    $el.css("cursor", "pointer").on("click", function (e) {
      // Don't trigger click when clicking on links within items
      if ($(e.target).is('a') || $(e.target).parents('a').length) {
        return;
      }

      getCurrentProfile().then(currentProfile => {
        if (!currentProfile.checklistData) {
          currentProfile.checklistData = {};
        }

        // Toggle completed state
        if ($el.hasClass("completed")) {
          $el.removeClass("completed");
          delete currentProfile.checklistData[dataId];
        } else {
          $el.addClass("completed");
          currentProfile.checklistData[dataId] = true;
        }

        // Save to storage
        saveCurrentProfile(currentProfile);

        // Update totals
        calculateTotals();
      }).catch(error => {
        console.error('Error getting current profile for click handler:', error);
      });

      // Stop event propagation to prevent parent list items from being toggled
      e.stopPropagation();
    });
  });

  // Calculate initial totals
  calculateTotals();
}

function calculateTotals() {
  // Calculate and update category totals
  $("h3[id]").each(function () {
    var $category = $(this);
    var $items = $category.next("ul").find("li[data-id]").not("li[data-id] li[data-id]");
    var total = $items.length;
    var completed = $items.filter(".completed").length;

    var $span = $category.find("span.category_total");
    if ($span.length === 0) {
      $span = $("<span>").addClass("category_total");
      $category.append($span);
    }

    $span.text(" - " + completed + "/" + total);

    if (completed === total && total > 0) {
      $span.removeClass("in_progress").addClass("done");
    } else if (completed > 0) {
      $span.removeClass("done").addClass("in_progress");
    } else {
      $span.removeClass("done in_progress");
    }
  });

  // Calculate and update overall total
  var $items = $("li[data-id]").not("li[data-id] li[data-id]");
  var total = $items.length;
  var completed = $items.filter(".completed").length;

  $("#playthrough_overall_total").text(" - " + completed + "/" + total);

  // Update Table of Contents counts as well
  updateTocCounts();
}

// Profile management functions

// Helper function to create a default profile
async function createDefaultProfile(profiles) {
  const { uniqueName, uniqueId } = generateUniqueProfileName("Default", profiles);

  // Try to load checklist.md content for the default profile
  let defaultContent = "# Getting Started\n- ::task:: This is a community checklist for tracking game missables. Use the checklist tab to view game content with spoiler protection.";

  try {
    const checklistContent = await loadChecklistFromFile();
    if (checklistContent) {
      defaultContent = checklistContent;
    }
  } catch (error) {
    console.log("Could not load checklist.md for default profile, using fallback content");
  }

  profiles[uniqueId] = {
    id: uniqueId,
    name: uniqueName,
    checklistData: {},
    checklistContent: defaultContent
  };

  $.jStorage.set(profilesKey, profiles);
  $.jStorage.set("current_profile", uniqueId);
  console.log("Created default profile:", uniqueId);

  // Update the UI to show the new default profile
  populateProfiles();

  return profiles[uniqueId];
}

async function getCurrentProfile() {
  let profiles = $.jStorage.get(profilesKey, {});
  let profileId = $.jStorage.get("current_profile", null);

  // Check if we need to create a default profile
  const needsDefaultProfile = !profileId || !profiles[profileId] || Object.keys(profiles).length === 0;

  if (needsDefaultProfile) {
    return await createDefaultProfile(profiles);
  }

  return profiles[profileId];
}

function saveCurrentProfile(profile) {
  const profiles = $.jStorage.get(profilesKey, {});
  profiles[profile.id] = profile;
  $.jStorage.set(profilesKey, profiles);
}

// Function to update the page title based on current profile/template
async function updatePageTitle(profile) {
  const $title = $('h1.text-center');

  if (!profile || !profile.checklistContent) {
    $title.text('Spoiler-Free Game Checklist Tool');
    return;
  }

  // Safety check: ensure checklistContent is a string
  if (typeof profile.checklistContent !== 'string') {
    console.error('Profile checklistContent is not a string! Type:', typeof profile.checklistContent, 'Value:', profile.checklistContent);
    console.error('Profile object:', profile);
    $title.text('Checklist Tool');
    return;
  }

  // Load templates to find the matching template name
  const templates = await loadTemplatesIndex();
  const blankTemplate = templates.find(t => t.id === 'blank');

  // Check if this profile was created from a template (not blank)
  for (const template of templates) {
    if (template.id !== 'blank' && template.filename) {
      // Try to load the template content to compare
      try {
        const templateContent = await loadTemplate(template.filename);
        // Compare the content (ignoring minor whitespace differences)
        // Ensure both are strings before trimming
        const profileContent = typeof profile.checklistContent === 'string' ? profile.checklistContent : String(profile.checklistContent || '');

        const normalizedProfileContent = profileContent.trim();
        const normalizedTemplateContent = templateContent.trim();

        if (normalizedProfileContent === normalizedTemplateContent) {
          // This profile matches this template
          $title.text(template.name + " Checklist");
          return;
        }
      } catch (error) {
        // Continue to next template if this one fails to load
        console.warn(`Could not load template ${template.filename}:`, error);
      }
    }
  }

  // If no template match found, use the profile name (for custom profiles)
  $title.text(profile.name + " Checklist" || 'Spoiler-Free Game Checklist Tool');
}

// Function to generate a unique profile ID and name
function generateUniqueProfileName(baseName, profiles) {
  const now = new Date();
  const dateString = now.toLocaleDateString();
  const timeString = now.toLocaleTimeString();
  const timestamp = now.toISOString().replace(/[:.]/g, '-');

  // Always include Date and Time for generated profiles
  const finalName = `${baseName} ${dateString} ${timeString}`;

  // Generate a unique ID using the base name and timestamp
  const uniqueId = `${baseName.toLowerCase().replace(/\s+/g, '-')}-${timestamp}`;

  return { uniqueName: finalName, uniqueId: uniqueId };
}

function populateProfiles() {
  const profiles = $.jStorage.get(profilesKey, {});
  const currentProfileId = $.jStorage.get("current_profile", null);

  const $select = $("#profiles");
  $select.empty();

  Object.values(profiles).forEach(profile => {
    const $option = $("<option>").val(profile.id).text(profile.name);
    if (profile.id === currentProfileId) {
      $option.prop("selected", true);
    }
    $select.append($option);
  });

  // If no profiles exist, do nothing here (default is created in getCurrentProfile if needed)
}

function initializeProfileFunctionality($) {
  // Populate profiles on page load
  populateProfiles();

  // Handle profile selection change
  $("#profiles").on("change", function () {
    const profileId = $(this).val();
    $.jStorage.set("current_profile", profileId);

    // Reload the checklist with the selected profile
    generateTasks().catch(error => {
      console.error('Error reloading checklist:', error);
    });
  });

  // Share template button
  $("#profileShareTemplate").on("click", async function () {
    const currentProfile = await getCurrentProfile();
    if (!currentProfile) {
      showFeedback("No profile selected", "error");
      return;
    }

    // Check if profile has stored templateId (only profiles created from templates have this)
    const templateId = currentProfile.templateId;

    if (!templateId) {
      showFeedback("This profile wasn't created from a template and cannot be shared as a template link, but you can still use the Share Checklist button to share the entire checklist. Only profiles created from templates can be shared.", "error");
      return;
    }

    // Verify the template still exists
    const templates = await loadTemplatesIndex();
    const templateExists = templates.some(t => t.id === templateId);

    if (!templateExists) {
      showFeedback("The template this profile was based on no longer exists.", "error");
      return;
    }

    // Generate shareable URL
    const baseUrl = window.location.origin + window.location.pathname;
    const shareUrl = `${baseUrl}#template=${encodeURIComponent(templateId)}`;

    // Copy to clipboard
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(shareUrl);
      showFeedback("Template share link copied to clipboard!", "success");
    } else {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        showFeedback("Template share link copied to clipboard!", "success");
      } catch (err) {
        showFeedback("Copy failed, please manually copy: " + shareUrl, "error");
      }
      document.body.removeChild(textArea);
    }
  });

  // Add profile button
  $("#profileAdd").on("click", async function () {
    $("#profileModalTitle").text("Add Profile");
    $("#profileModalName").val("");
    $("#profileModalAdd").show();
    $("#profileModalUpdate, #profileModalDelete").hide();
    // Show template selection for adding
    $("#profileModalTemplate").closest('.control-group').show();

    // Load and populate template dropdown
    await populateTemplateDropdown();

    $("#profileModal").modal("show");
  });

  // Edit profile button
  $("#profileEdit").on("click", function () {
    getCurrentProfile().then(currentProfile => {
      $("#profileModalTitle").text("Edit Profile");
      $("#profileModalName").val(currentProfile.name);
      $("#profileModalAdd").hide();
      $("#profileModalUpdate, #profileModalDelete").show();
      // Hide template selection for editing (not needed)
      $("#profileModalTemplate").closest('.control-group').hide();
      $("#profileModal").modal("show");
    }).catch(error => {
      console.error('Error getting current profile for edit:', error);
    });
  });

  // Add profile action
  $("#profileModalAdd").on("click", async function () {
    let profileName = $("#profileModalName").val().trim();
    const selectedTemplateId = $("#profileModalTemplate").val();

    // Load templates once
    const templates = await loadTemplatesIndex();
    const selectedTemplate = templates.find(t => t.id === selectedTemplateId);

    // If no name provided, generate a default name based on the selected template
    if (!profileName) {
      profileName = selectedTemplate ? selectedTemplate.name : "Profile";
    }

    const profiles = $.jStorage.get(profilesKey, {});
    const { uniqueName, uniqueId } = generateUniqueProfileName(profileName, profiles);

    let checklistContent = "# Getting Started\n- ::task:: This is a blank checklist. Add your content here.";

    if (selectedTemplate) {
      checklistContent = await loadTemplate(selectedTemplate.filename);
    }

    profiles[uniqueId] = {
      id: uniqueId,
      name: uniqueName,
      checklistData: {},
      checklistContent: checklistContent,
      templateId: selectedTemplateId // Store template ID for sharing
    };

    $.jStorage.set(profilesKey, profiles);
    $.jStorage.set("current_profile", uniqueId);

    populateProfiles();
    generateTasks().catch(error => {
      console.error('Error generating tasks:', error);
    });
  });

  // Update profile action
  $("#profileModalUpdate").on("click", function () {
    const profileName = $("#profileModalName").val().trim();
    if (!profileName) return;

    const currentProfileId = $.jStorage.get("current_profile", null);
    const profiles = $.jStorage.get(profilesKey, {});

    if (currentProfileId && profiles[currentProfileId]) {
      profiles[currentProfileId].name = profileName;
      $.jStorage.set(profilesKey, profiles);

      populateProfiles();
      $("#profileModal").modal("hide");
    }
  });

  // Delete profile action
  $("#profileModalDelete").on("click", function () {
    // Create custom modal for confirmation
    const confirmModal = `
      <div class="modal fade" id="confirmDeleteModal" tabindex="-1" role="dialog" aria-labelledby="confirmDeleteModalLabel">
        <div class="modal-dialog modal-confirm" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h4 class="modal-title" id="confirmDeleteModalLabel">Confirm Delete</h4>
              <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div class="modal-body">
              <p>Are you sure you want to delete this profile? This action cannot be undone.</p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
              <button type="button" class="btn btn-danger" id="confirmDeleteBtn">Delete</button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Remove any existing modal
    $("#confirmDeleteModal").remove();

    // Add modal to body
    $("body").append(confirmModal);

    // Show modal
    $("#confirmDeleteModal").modal("show");

    // Handle delete confirmation
    $("#confirmDeleteBtn").on("click", function () {
      const currentProfileId = $.jStorage.get("current_profile", null);
      const profiles = $.jStorage.get(profilesKey, {});

      if (currentProfileId && profiles[currentProfileId]) {
        // Get the hash before deleting the profile
        const hashToDelete = profiles[currentProfileId].importHash;

        // Delete the profile object
        delete profiles[currentProfileId];
        $.jStorage.set(profilesKey, profiles);

        // If a hash was associated, remove it from the imported list
        if (hashToDelete) {
          let importedHashes = $.jStorage.get(importedHashesKey, []);
          importedHashes = importedHashes.filter(h => h !== hashToDelete);
          $.jStorage.set(importedHashesKey, importedHashes);
          console.log("Removed hash from imported list:", hashToDelete);
        }

        // Set current profile to the first available one
        const firstProfileId = Object.keys(profiles)[0];
        if (firstProfileId) {
          $.jStorage.set("current_profile", firstProfileId);
        } else {
          // If no profiles left, create a default one
          console.log("All profiles deleted, creating new default profile");
          // Note: We can't use await here since this is not an async function,
          // but createDefaultProfile will handle the async loading internally
          const { uniqueName, uniqueId } = generateUniqueProfileName("Default", profiles);

          // Use the same default content as the helper function
          let defaultContent = "# Getting Started\n- ::task:: This is a community checklist for tracking game missables. Use the checklist tab to view game content with spoiler protection.";

          // Try to load checklist.md content
          fetch('checklist.md')
            .then(response => response.ok ? response.text() : Promise.reject())
            .then(content => {
              defaultContent = content;
            })
            .catch(error => {
              console.log("Could not load checklist.md for default profile after deletion, using fallback content");
            })
            .finally(() => {
              profiles[uniqueId] = {
                id: uniqueId,
                name: uniqueName,
                checklistData: {},
                checklistContent: defaultContent
              };

              $.jStorage.set(profilesKey, profiles);
              $.jStorage.set("current_profile", uniqueId);
              console.log("Created default profile after deletion:", uniqueId);
            });
        }

        populateProfiles();
        generateTasks().catch(error => {
          console.error('Error generating tasks:', error);
        });

        // Hide both modals
        $("#confirmDeleteModal").modal("hide");
        $("#profileModal").modal("hide");

        // Show feedback
        showFeedback("Profile deleted successfully!");
      }
    });
  });

  // Checklist editing functionality

  // Save checklist button
  $("#save-checklist").on("click", async function () {
    const checklistContent = $("#checklist-content").val();
    const currentProfile = await getCurrentProfile();

    currentProfile.checklistContent = checklistContent;
    saveCurrentProfile(currentProfile);

    await generateTasks();

    // Provide feedback to user
    showFeedback("Checklist saved successfully!");

    // Switch to the Checklist tab
    $('a[href="#tabPlaythrough"]').tab('show');
  });

  // Import button
  $("#import-checklist").on("click", function () {
    $("#file-input").click();
  });

  // Handle file selection for import
  $("#file-input").on("change", function (e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const data = JSON.parse(e.target.result);
        if (data.checklistContent) {
          $("#checklist-content").val(data.checklistContent);

          // Optionally import the checklist data (completed items)
          const currentProfile = getCurrentProfile();
          if (data.checklistData) {
            currentProfile.checklistData = data.checklistData;
          }
          currentProfile.checklistContent = data.checklistContent;
          saveCurrentProfile(currentProfile);

          generateTasks();

          // Provide feedback to user
          showFeedback("Checklist imported successfully!");

          // Switch to the Checklist tab
          $('a[href="#tabPlaythrough"]').tab('show');
        }
      } catch (error) {
        showFeedback("Invalid file format. Please select a valid checklist file.", "error");
      }
    };
    reader.readAsText(file);
  });

  // Export button
  $("#export-checklist").on("click", function () {
    getCurrentProfile().then(currentProfile => {
      const data = {
        checklistContent: currentProfile.checklistContent,
        checklistData: currentProfile.checklistData
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = (currentProfile.name || "checklist") + ".json";
      a.click();

      URL.revokeObjectURL(url);

      // Provide feedback to user
      showFeedback("Checklist exported successfully!");
    }).catch(error => {
      console.error('Error getting current profile for export:', error);
      showFeedback("Error exporting checklist.", "error");
    });
  });

  // Initialize filter toggles

  // Toggle Hide Completed Items
  $("#toggleHideCompleted").on("change", function () {
    if ($(this).is(":checked")) {
      $("body").addClass("hide_completed");
    } else {
      $("body").removeClass("hide_completed");
    }
  });

  // Toggle Reveal All Spoilers
  $("#toggleRevealSpoilers").on("change", function () {
    if ($(this).is(":checked")) {
      // Reveal all spoilers
      $('.spoiler-container').addClass('revealed');
    } else {
      // Hide all spoilers
      $('.spoiler-container').removeClass('revealed');
    }
  });

  // --- Share Modal Logic ---
  const MAX_URL_LENGTH = 2000; // Adjust as needed

  // When the Share modal is shown, prepare the share options
  $('#shareModal').on('show.bs.modal', function () {
    getCurrentProfile().then(currentProfile => {
      if (!currentProfile) {
        console.error("No current profile found for sharing.");
        // Optionally disable buttons or show an error in the modal
        $('#share-copy-url-btn').prop('disabled', true);
        $('#share-copy-code-btn').prop('disabled', true);
        return;
      }

      const dataToShare = {
        checklistContent: currentProfile.checklistContent || "",
        checklistData: currentProfile.checklistData || {}
      };

      const compressedData = compressData(dataToShare);

      if (!compressedData) {
        console.error("Compression failed.");
        $('#share-copy-url-btn').prop('disabled', true).tooltip('hide');
        $('#share-copy-code-btn').prop('disabled', true).tooltip('hide');
        $('#share-url-disabled-reason').text('(Compression error)').show();
        return;
      }

      const baseUrl = window.location.origin + window.location.pathname; // Base URL without hash/query
      const shareUrl = baseUrl + '#' + compressedData;
      const urlLength = shareUrl.length;

      // Configure URL Button
      // Always enable the button, but add a warning on click if too long
      $('#share-copy-url-btn').prop('disabled', false).off('click').on('click', async function () {
        const success = await copyToClipboard(shareUrl);
        if (success) {
          showCopyFeedback('copy-feedback', 'Link Copied!');
          // Also show a warning if the URL is too long
          if (urlLength >= MAX_URL_LENGTH) {
            showFeedback(`Warning: Link is very long (${urlLength} chars) and may not work everywhere.`, "error");
          }
        }
      }).tooltip('enable');
      // Remove the reason text display
      $('#share-url-disabled-reason').hide();

      // Configure Code Button
      $('#share-copy-code-btn').prop('disabled', false).off('click').on('click', async function () {
        const success = await copyToClipboard(compressedData);
        if (success) showCopyFeedback('copy-feedback', 'Code Copied!');
      }).tooltip('enable');

      // Clear import feedback and textarea
      $('#import-code-area').val('');
      $('#import-feedback').hide();
      $('#copy-feedback').hide(); // Hide copy feedback initially

    }).catch(error => {
      console.error('Error getting current profile for share modal:', error);
      $('#share-copy-url-btn').prop('disabled', true);
      $('#share-copy-code-btn').prop('disabled', true);
    });
  });

  // Initialize tooltips (needs to be done after elements are in the DOM)
  $(function () {
    $('[data-toggle="tooltip"]').tooltip();
  });


  // --- Import from Code Logic ---
  $('#import-load-code-btn').on('click', function () {
    const compressedCode = $('#import-code-area').val().trim();
    if (!compressedCode) {
      showImportFeedback("Please paste a code first.", "error");
      return;
    }

    const importedData = decompressData(compressedCode);

    if (importedData && importedData.checklistContent !== undefined && importedData.checklistData !== undefined) {
      // Success - Create new profile (similar to URL import)
      const profiles = $.jStorage.get(profilesKey, {});

      // Use the new function to get unique ID and name
      const { uniqueName, uniqueId } = generateUniqueProfileName("Imported", profiles);

      profiles[uniqueId] = {
        id: uniqueId,
        name: uniqueName, // Use the generated unique name
        checklistData: importedData.checklistData || {},
        checklistContent: importedData.checklistContent || "# Imported Checklist\\n- ::task:: Welcome!"
        // Note: No importHash needed for code import
      };

      $.jStorage.set(profilesKey, profiles);
      $.jStorage.set("current_profile", uniqueId); // Set current profile to the new unique ID

      // Refresh UI
      populateProfiles();
      generateTasks().catch(error => {
        console.error('Error generating tasks after import:', error);
      });
      showImportFeedback("Checklist imported successfully!", "success");
      $('#import-code-area').val(''); // Clear textarea
      // Optionally close modal: $('#shareModal').modal('hide');

    } else {
      // Failure
      showImportFeedback("Invalid or corrupt code.", "error");
    }
  });
}

function createTableOfContents() {
  const $toc = $(".table_of_contents");
  $toc.empty();

  // Collect all valid TOC items
  const tocItems = [];

  // Process all TOC elements in document order (chapters and branch choices)
  const tocElements = [];

  // Collect all h3 headings
  $("h3[id]").each(function () {
    tocElements.push({
      element: $(this),
      type: 'chapter',
      index: tocElements.length
    });
  });

  // Collect all branch selectors
  $(".branch-selector[data-branch]").each(function () {
    tocElements.push({
      element: $(this),
      type: 'branch',
      index: tocElements.length
    });
  });

  // Sort by document position
  tocElements.sort(function (a, b) {
    const posA = a.element.offset().top;
    const posB = b.element.offset().top;
    return posA - posB;
  });

  // Process elements in document order
  tocElements.forEach(function (item) {
    if (item.type === 'chapter') {
      const $h3 = item.element;
      const id = $h3.attr("id");
      const text = $h3.find("a[href='#']").text();

      // Get item counts for the category
      const $items = $h3.next("ul").find("li[data-id]").not("li[data-id] li[data-id]");
      const total = $items.length;

      // Skip empty categories or those with invalid/empty text
      if (total === 0 || !text.trim()) {
        return;
      }

      const completed = $items.filter(".completed").length;

      // Create TOC item with count
      const $li = $("<li>");
      const $a = $("<a>").attr("href", "#" + id).text(text);
      const $count = $("<span>").addClass("toc-count").text(" (" + completed + "/" + total + ")");

      $li.append($a).append($count);
      tocItems.push($li);
    } else if (item.type === 'branch') {
      const $branch = item.element;
      const branchName = $branch.attr("data-branch");
      const title = $branch.attr("data-title");

      // Skip if no title or branch name
      if (!title || !branchName) {
        return;
      }

      // Get item counts for the branch section (items that follow this branch)
      const $items = $branch.next("ul").find("li[data-id]").not("li[data-id] li[data-id]");
      const total = $items.length;
      const completed = $items.filter(".completed").length;

      // Create TOC item with count (only if there are items)
      const $li = $("<li>");
      const $a = $("<a>").attr("href", "#branch-" + branchName).text("Choice: " + title);
      const $count = $("<span>").addClass("toc-count").text(" (" + completed + "/" + total + ")");

      $li.append($a).append($count);
      tocItems.push($li);
    }
  });

  // Calculate optimal column distribution
  const totalItems = tocItems.length;
  const maxItemsPerColumn = 10;

  // Calculate number of columns needed
  const numColumns = Math.min(5, Math.ceil(totalItems / maxItemsPerColumn));
  const itemsPerColumn = Math.ceil(totalItems / numColumns);

  // Distribute items into columns
  for (let col = 0; col < numColumns; col++) {
    const $column = $("<div>").addClass("toc-column");
    const $columnList = $("<ul>").css("margin", "0").css("padding", "0").css("list-style", "none");

    const startIndex = col * itemsPerColumn;
    const endIndex = Math.min(startIndex + itemsPerColumn, totalItems);
    const columnItems = tocItems.slice(startIndex, endIndex);

    columnItems.forEach(function (item) {
      $columnList.append(item);
    });

    $column.append($columnList);
    $toc.append($column);
  }
}

// Feedback function
function showFeedback(message, type = "success") {
  // Create feedback element if it doesn't exist
  if (!$("#feedback-message").length) {
    $("body").append('<div id="feedback-message" class="alert"></div>');
  }

  const $feedback = $("#feedback-message");
  $feedback.removeClass("alert-success alert-danger").addClass(type === "success" ? "alert-success" : "alert-danger");
  $feedback.text(message);
  $feedback.fadeIn();

  // Hide after 3 seconds
  setTimeout(function () {
    $feedback.fadeOut();
  }, 3000);
}

// Function to check if a hash looks like compressed checklist data
function isCompressedChecklistData(hash) {
  // Compressed data should be:
  // 1. Reasonably long (compressed data is usually > 100 chars)
  // 2. Contain only valid base64 characters (A-Z, a-z, 0-9, +, /, =)
  // 3. Not contain spaces or special characters typical of section IDs
  if (hash.length < 50) return false;
  if (!/^[A-Za-z0-9+/=]+$/.test(hash)) return false;
  if (hash.includes('_') || hash.includes('-') && hash.length < 200) return false;
  return true;
}

// Function to handle template sharing via URL hash
async function handleTemplateSharing(templateId) {
  console.log("Processing template sharing for:", templateId);

  // Load templates index
  const templates = await loadTemplatesIndex();
  const selectedTemplate = templates.find(t => t.id === templateId);

  if (!selectedTemplate) {
    console.error("Template not found:", templateId);
    showFeedback("Template not found: " + templateId, "error");
    return;
  }

  // Check if user already has a profile based on this template
  const profiles = $.jStorage.get(profilesKey, {});
  const existingProfileWithTemplate = Object.values(profiles).find(profile =>
    profile.templateId === templateId
  );

  if (existingProfileWithTemplate) {
    console.log("Found existing profile with this template, switching to it:", existingProfileWithTemplate.name);
    // Switch to the existing profile
    $("#profiles").val(existingProfileWithTemplate.id);
    $("#profiles").trigger("change");
    showFeedback("Switched to existing profile: " + existingProfileWithTemplate.name, "success");
    return;
  }

  // No existing profile found, create a new one (equivalent to pressing Add button with this template)
  console.log("No existing profile found, creating new profile from shared template:", selectedTemplate.name);

  // Load the template content
  const checklistContent = await loadTemplate(selectedTemplate.filename);

  // Generate unique profile name and ID
  const profilesObj = $.jStorage.get(profilesKey, {});
  const { uniqueName, uniqueId } = generateUniqueProfileName(selectedTemplate.name, profilesObj);

  // Create new profile
  profilesObj[uniqueId] = {
    id: uniqueId,
    name: uniqueName,
    checklistData: {},
    checklistContent: checklistContent,
    templateId: templateId // Store the template ID for future reference
  };

  // Save and set as current profile
  $.jStorage.set(profilesKey, profilesObj);
  $.jStorage.set("current_profile", uniqueId);

  // Update UI and reload checklist
  populateProfiles();
  generateTasks().catch(error => {
    console.error('Error creating new profile from template:', error);
  });

  showFeedback(`Created new profile: ${uniqueName}`, "success");
}

// Function to process the URL hash for imported checklists
function processUrlHash() {
  const hash = window.location.hash.substring(1); // Get current hash, remove leading '#'

  if (!hash) {
    // No hash, nothing to do
    return;
  }

  // Check for template parameter in URL hash
  const urlParams = new URLSearchParams(hash);
  const templateId = urlParams.get('template');

  if (templateId) {
    // Handle template sharing
    handleTemplateSharing(templateId);
    // Clean the URL hash after processing
    cleanUrlHash();
    return;
  }

  // Skip processing if this doesn't look like compressed checklist data
  if (!isCompressedChecklistData(hash)) {
    return;
  }

  console.log("Processing hash:", hash);

  // Check if this hash has already been imported
  const importedHashes = $.jStorage.get(importedHashesKey, []);
  if (importedHashes.includes(hash)) {
    console.log("Hash already imported:", hash);
    showFeedback("This checklist has already been imported.", "error");

    // Clean the URL hash anyway
    cleanUrlHash();
    return; // Stop processing
  }

  // Attempt to decompress and process the hash
  const importedData = decompressData(hash);

  if (importedData && importedData.checklistContent !== undefined && importedData.checklistData !== undefined) {
    console.log("Successfully decompressed data from hash:", importedData);
    const profiles = $.jStorage.get(profilesKey, {});

    // Use the new function to get unique ID and name
    const { uniqueName, uniqueId } = generateUniqueProfileName("Imported", profiles);

    profiles[uniqueId] = {
      id: uniqueId,
      name: uniqueName, // Use the generated unique name
      checklistData: importedData.checklistData || {},
      checklistContent: importedData.checklistContent || "# Imported Checklist\\n- ::task:: Welcome!",
      importHash: hash // Store the original hash
    };

    $.jStorage.set(profilesKey, profiles);
    $.jStorage.set("current_profile", uniqueId); // Set current profile to the new unique ID

    // Add the hash to the list of imported hashes and save it
    importedHashes.push(hash);
    $.jStorage.set(importedHashesKey, importedHashes);

    console.log("New profile created:", uniqueId, "Name:", uniqueName);

    // Clean the URL hash without reloading
    cleanUrlHash();

    // Refresh UI
    populateProfiles(); // Ensure this function selects the new profile
    generateTasks().catch(error => {
      console.error('Error generating tasks after URL import:', error);
    });    // Generate tasks for the new profile
    showFeedback("Checklist imported successfully from URL!", "success");

  } else {
    console.warn("Failed to decompress or validate data from hash.");
    // Clean the URL hash even if import failed
    cleanUrlHash();
    showFeedback("Could not import checklist from URL (invalid data).", "error");
  }
}

// Helper function to clean the hash from the URL
function cleanUrlHash() {
  if (history.replaceState) {
    // Use replaceState to clean the URL without adding to history or reloading
    history.replaceState(null, null, window.location.pathname + window.location.search);
    console.log("URL hash cleaned.");
  } else {
    // Fallback for older browsers (might cause a reload or jump)
    window.location.hash = '';
    console.warn("history.replaceState not supported, hash removal might be imperfect.");
  }
}

$(document).ready(function () {
  // Process the hash on initial page load
  processUrlHash();

  // Also process the hash whenever it changes (e.g., pasting a URL)
  $(window).on('hashchange', function () {
    console.log("Hash changed, processing...");
    processUrlHash();
  });

  // Initialize the rest of the page
  initializeProfileFunctionality($);
  generateTasks().catch(error => {
    console.error('Error in initial generateTasks:', error);
  }); // Initial generation based on current/default profile

  // Back to top button
  $(window).scroll(function () {
    if ($(this).scrollTop() > 200) {
      $(".back-to-top").fadeIn();
    } else {
      $(".back-to-top").fadeOut();
    }
  });

  $(".back-to-top").click(function () {
    $("html, body").animate({ scrollTop: 0 }, 300);
    return false;
  });
});

// --- Tokenization Helpers ---

// Dictionary: Map tokens (short strings) to original long strings
const tokenDictionary = {
  "~T~": "::task::",
  "~M~": "::missable::",
  "~U~": "::item_uncommon::",
  "~S~": "::item_story::",
  "~L~": "https://",
  // Add more frequently used long strings or patterns here
};

// Precompute the reverse dictionary for faster detokenization
const reverseTokenDictionary = Object.fromEntries(
  Object.entries(tokenDictionary).map(([key, value]) => [value, key])
);

// Function to replace long strings with tokens in checklistContent
function tokenizeData(data) {
  if (!data || !data.checklistContent) return data;

  let tokenizedContent = data.checklistContent;
  // Iterate longer strings first to avoid partial replacements
  const sortedOriginals = Object.keys(reverseTokenDictionary).sort((a, b) => b.length - a.length);

  for (const original of sortedOriginals) {
    const token = reverseTokenDictionary[original];
    // Use a regex with the 'g' flag for global replacement
    // Escape special regex characters in the original string
    const escapedOriginal = original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    tokenizedContent = tokenizedContent.replace(new RegExp(escapedOriginal, 'g'), token);
  }

  // Return a *new* object with the tokenized content
  return {
    ...data,
    checklistContent: tokenizedContent,
    // Note: We are not tokenizing checklistData keys for now, focusing on content size.
  };
}

// Function to replace tokens with original strings in checklistContent
function detokenizeData(data) {
  if (!data || !data.checklistContent) return data;

  let detokenizedContent = data.checklistContent;
  // Iterate tokens for replacement
  // No specific order needed here, but iterating the dictionary is fine
  for (const token in tokenDictionary) {
    const original = tokenDictionary[token];
    // Use a regex with the 'g' flag for global replacement
    // Escape special regex characters in the token
    const escapedToken = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    detokenizedContent = detokenizedContent.replace(new RegExp(escapedToken, 'g'), original);
  }

  // Return a *new* object with the detokenized content
  return {
    ...data,
    checklistContent: detokenizedContent,
  };
}


// --- LZString Compression/Decompression Helpers ---
function compressData(data) {
  try {
    // 1. Tokenize the data (specifically checklistContent for now)
    const tokenizedData = tokenizeData(data);
    // 2. Stringify the tokenized data
    const jsonString = JSON.stringify(tokenizedData);
    // 3. Compress the stringified tokenized data
    return LZString.compressToBase64(jsonString);
  } catch (error) {
    console.error("Error compressing data:", error);
    return null;
  }
}

function decompressData(compressedString) {
  try {
    if (!compressedString) return null;
    // 1. Decompress the string
    const jsonString = LZString.decompressFromBase64(compressedString);
    if (!jsonString) return null; // Decompression failed
    // 2. Parse the JSON string
    let parsedData = JSON.parse(jsonString);
    // 3. Detokenize the data (specifically checklistContent for now)
    return detokenizeData(parsedData);
  } catch (error) {
    // Catch errors from decompression, parsing, or detokenization
    console.error("Error decompressing data:", error);
    return null; // Also catches JSON parse errors or detokenization errors
  }
}

// Helper to show feedback in the modal
function showImportFeedback(message, type = "success") {
  const $feedback = $("#import-feedback");
  $feedback.text(message)
    .removeClass("text-success text-danger")
    .addClass(type === "success" ? "text-success" : "text-danger")
    .fadeIn();
  setTimeout(() => $feedback.fadeOut(), 3000);
}

// Helper to show feedback for copy actions
function showCopyFeedback(targetElementId, message = "Copied!") {
  const $feedback = $("#" + targetElementId);
  $feedback.text(message).fadeIn();
  setTimeout(() => $feedback.fadeOut(), 1500);
}

// Helper to copy text to clipboard
async function copyToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.error("Failed to copy: ", err);
      return false;
    }
  } else {
    // Fallback for older browsers or non-secure contexts
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed"; // Prevent scrolling to bottom
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand("copy");
      document.body.removeChild(textArea);
      return true;
    } catch (err) {
      console.error("Fallback copy failed: ", err);
      document.body.removeChild(textArea);
      return false;
    }
  }
}

// Function to add click handlers for spoiler elements
function addSpoilerHandlers() {
  // Remove any existing handlers first to avoid duplicates
  $('.spoiler-container').off('click');

  // Add click handler to all spoiler containers
  $('.spoiler-container').on('click', function (e) {
    e.stopPropagation(); // Prevent triggering parent click handlers

    const $spoiler = $(this);

    // Toggle the revealed state
    if ($spoiler.hasClass('revealed')) {
      $spoiler.removeClass('revealed');
    } else {
      $spoiler.addClass('revealed');
    }
  });
}

// Function to update the counts in the Table of Contents
function updateTocCounts() {
  $(".table_of_contents li").each(function () {
    const $li = $(this);
    const $a = $li.find("a");
    const $countSpan = $li.find("span.toc-count");
    const targetId = $a.attr("href"); // Should be like "#Category_ID"

    if (!targetId || targetId === '#') return; // Skip if no valid href

    const categoryId = targetId.substring(1); // Remove '#'
    const $categoryHeader = $("h3#" + categoryId);

    if ($categoryHeader.length > 0) {
      const $items = $categoryHeader.next("ul").find("li[data-id]").not("li[data-id] li[data-id]");
      const total = $items.length;
      const completed = $items.filter(".completed").length;

      // Update the count text
      if ($countSpan.length > 0) {
        $countSpan.text(" (" + completed + "/" + total + ")");
      }
    }
  });
}
