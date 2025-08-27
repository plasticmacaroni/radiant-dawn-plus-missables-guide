#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Automatically updates checklists/index.json by scanning the checklists folder
 * for .md files and extracting metadata from them.
 *
 * Usage: node scripts/update-templates.js [--dry-run]
 *
 * Options:
 *   --dry-run    Show what would be updated without making changes
 */

const CHECKLISTS_DIR = path.join(__dirname, '..', 'checklists');
const INDEX_FILE = path.join(CHECKLISTS_DIR, 'index.json');

// Parse command line arguments
const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');

/**
 * Extracts metadata from a markdown file
 */
function extractMetadataFromFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');

        // Extract title from filename (not from header)
        const filename = path.basename(filePath, '.md');
        let title = filename
            // Replace dashes and underscores with spaces
            .replace(/[-_]/g, ' ')
            // Title case: capitalize each word (including apostrophes)
            .replace(/\b[\w']+/g, match => match.charAt(0).toUpperCase() + match.slice(1).toLowerCase());

        // Extract description from comments or first meaningful paragraph
        let description = `Checklist for ${title}`;

        // Look for HTML comment with description
        const descriptionMatch = content.match(/<!--\s*description:\s*(.+?)\s*-->/i);
        if (descriptionMatch) {
            description = descriptionMatch[1];
        } else {
            // Look for first substantial paragraph
            for (const line of lines.slice(1, 15)) {
                const trimmed = line.trim();
                if (trimmed &&
                    !trimmed.startsWith('#') &&
                    !trimmed.startsWith('-') &&
                    trimmed.length > 20 &&
                    !trimmed.includes('http')) {
                    description = trimmed.length > 150 ?
                        trimmed.substring(0, 150) + '...' :
                        trimmed;
                    break;
                }
            }
        }

        // Generate ID from filename
        const id = path.basename(filePath, '.md')
            .toLowerCase()
            .replace(/[^a-z0-9-_]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');

        return {
            id,
            name: title,
            description,
            filename: path.basename(filePath)
        };
    } catch (error) {
        console.error(`Error reading ${filePath}:`, error.message);
        return null;
    }
}

/**
 * Main function to update the template index
 */
function updateTemplates() {
    if (DRY_RUN) {
        console.log('🔍 DRY RUN MODE - No files will be modified');
    }
    console.log('🔍 Scanning checklists folder...');

    if (!fs.existsSync(CHECKLISTS_DIR)) {
        console.error(`❌ Checklists directory '${CHECKLISTS_DIR}' not found!`);
        process.exit(1);
    }

    // Get all .md files in checklists directory (excluding index.json)
    const files = fs.readdirSync(CHECKLISTS_DIR)
        .filter(file => file.endsWith('.md'))
        .map(file => path.join(CHECKLISTS_DIR, file))
        .sort(); // Sort for consistent ordering

    console.log(`📁 Found ${files.length} template files:`);
    files.forEach(file => console.log(`   - ${path.basename(file)}`));

    const templates = [];

    // Always include the blank template first
    templates.push({
        id: 'blank',
        name: 'Default (Blank)',
        description: 'Start with a blank checklist',
        filename: null
    });

    // Add templates from files
    files.forEach(filePath => {
        const metadata = extractMetadataFromFile(filePath);
        if (metadata) {
            templates.push(metadata);
            console.log(`✅ Added template: ${metadata.name}`);
        }
    });

    // Generate the index.json content
    const indexContent = {
        templates: templates,
        lastUpdated: new Date().toISOString(),
        _generated: true // Mark as auto-generated
    };

    // Display summary
    console.log('\n📋 Template Summary:');
    templates.forEach((template, index) => {
        console.log(`${index + 1}. ${template.name}`);
        console.log(`   ID: ${template.id}`);
        console.log(`   File: ${template.filename || 'N/A'}`);
        console.log(`   Description: ${template.description}`);
        console.log('');
    });

    if (DRY_RUN) {
        console.log('🔍 DRY RUN COMPLETE - No files were modified');
        console.log(`Would update ${INDEX_FILE} with ${templates.length} templates`);
        return templates.length;
    }

    // Write to file
    fs.writeFileSync(INDEX_FILE, JSON.stringify(indexContent, null, 2));
    console.log(`\n💾 Updated ${INDEX_FILE} with ${templates.length} templates`);

    return templates.length;
}

// Run the updater if this script is executed directly
if (require.main === module) {
    const count = updateTemplates();
    if (!DRY_RUN) {
        console.log(`\n🎉 Template index updated successfully! (${count} templates)`);
    }
}

// CommonJS exports
module.exports = { updateTemplates, extractMetadataFromFile };
