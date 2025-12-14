# Required fields for each element
REQUIRED_FIELDS = [
    "name",
    "file",
    "type",
    "signature",
    "description",
    "dependencies",
    "sideEffects",
    "categories"  # Changed from category to categories (list)
]
import os
import re
import json
import sys

# Configuration
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(CURRENT_DIR) # Go up one level to chat-nov28
SCRIPTS_DIR = os.path.join(PROJECT_ROOT, 'scripts')
MAP_FILE = os.path.join(CURRENT_DIR, 'codebase-map.json')
JS_MAP_FILE = os.path.join(SCRIPTS_DIR, 'utils', 'codebaseMap.js')

# Regex patterns
PATTERN_EXPORT_CONST = re.compile(r'export\s+const\s+(\w+)')
PATTERN_EXPORT_FUNCTION = re.compile(r'export\s+function\s+(\w+)\s*\(([^)]*)\)')
PATTERN_EXPORT_CLASS = re.compile(r'export\s+class\s+(\w+)')
PATTERN_LOCAL_FUNCTION = re.compile(r'^function\s+(\w+)\s*\(([^)]*)\)')
PATTERN_DESC = re.compile(r'//\s*@desc\s*(.*)')
PATTERN_CATEGORY = re.compile(r'//\s*@category\s*(.*)')

def load_existing_map():
    if os.path.exists(MAP_FILE):
        try:
            with open(MAP_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except json.JSONDecodeError:
            print(f"Warning: Could not decode {MAP_FILE}. Starting fresh.")
    return {"template-to-follow": [], "elements": []}

def get_default_categories(rel_path):
    """Determine default categories based on file path."""
    path_lower = rel_path.lower()
    categories = []
    
    if 'scripts/ui/chat.js' in path_lower:
        categories.extend(['CHAT', 'UI'])
    elif 'scripts/ui/' in path_lower:
        categories.append('UI')
    elif 'scripts/logic.js' in path_lower:
        categories.extend(['FACET', 'LOGIC'])
    elif 'scripts/productcatalog.js' in path_lower:
        categories.append('DATA')
    elif 'scripts/app.js' in path_lower:
        categories.append('APP')
    elif 'scripts/constants.js' in path_lower:
        categories.append('CONSTANTS')
    elif 'scripts/utils/' in path_lower:
        categories.append('UTILS')
    
    if not categories:
        categories.append('Uncategorized')
        
    return list(set(categories)) # Unique

def scan_files():
    found_elements = []
    print(f"Scanning scripts in {SCRIPTS_DIR}...")
    
    for root, dirs, files in os.walk(SCRIPTS_DIR):
        for file in files:
            if file.endswith('.js'):
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, PROJECT_ROOT).replace('\\', '/')
                
                # Skip the map file itself to avoid circular references if it was in scripts
                if 'codebaseMap.js' in rel_path:
                    continue

                with open(full_path, 'r', encoding='utf-8') as f:
                    lines = f.readlines()
                    
                    # Build a map of export line numbers to names
                    export_lines = {}
                    for idx, line in enumerate(lines):
                        m_const = PATTERN_EXPORT_CONST.search(line)
                        m_func = PATTERN_EXPORT_FUNCTION.search(line)
                        m_class = PATTERN_EXPORT_CLASS.search(line)
                        m_local_func = PATTERN_LOCAL_FUNCTION.search(line)
                        
                        if m_const:
                            export_lines[idx] = (m_const.group(1), 'constant', 'N/A')
                        elif m_func:
                            export_lines[idx] = (m_func.group(1), 'function', f'({m_func.group(2)}) => void')
                        elif m_class:
                            export_lines[idx] = (m_class.group(1), 'class', 'class')
                        elif m_local_func:
                            export_lines[idx] = (m_local_func.group(1), 'function', f'({m_local_func.group(2)}) => void')
                            
                    # For each export, look for metadata comments
                    for idx, (name, typ, sig) in export_lines.items():
                        desc = ""
                        manual_categories = []
                        
                        # Look ahead and behind for comments (restricted range to avoid overlap)
                        search_range = list(range(max(0, idx-3), min(len(lines), idx+5)))
                        for search_idx in search_range:
                            if search_idx != idx:  # Don't search the export line itself
                                line_content = lines[search_idx]
                                
                                desc_match = PATTERN_DESC.search(line_content)
                                if desc_match:
                                    desc = desc_match.group(1).strip()
                                    
                                cat_match = PATTERN_CATEGORY.search(line_content)
                                if cat_match:
                                    cats = [c.strip() for c in cat_match.group(1).split(',')]
                                    manual_categories.extend(cats)

                        # Determine final categories
                        default_cats = get_default_categories(rel_path)
                        final_cats = list(set(default_cats + manual_categories))
                        
                        el = {
                            "name": name,
                            "file": rel_path,
                            "type": typ,
                            "signature": sig,
                            "description": desc,
                            "categories": final_cats
                        }
                        
                        # Fill defaults for other fields
                        for field in REQUIRED_FIELDS:
                            if field not in el:
                                if field == "dependencies":
                                    el[field] = []
                                elif field == "sideEffects":
                                    el[field] = False
                                else:
                                    el[field] = ""
                                    
                        found_elements.append(el)

    return found_elements

def merge_maps(existing_data, new_elements):
    existing_elements = existing_data.get("elements", [])
    merged_elements = []
    
    # Create a lookup for existing elements to preserve manual fields
    existing_lookup = {el['name']: el for el in existing_elements}
    
    for new_el in new_elements:
        name = new_el['name']
        if name in existing_lookup:
            existing = existing_lookup[name]
            merged_entry = existing.copy()
            
            # Update fields that should be synced from code
            merged_entry['file'] = new_el['file']
            merged_entry['type'] = new_el['type']
            merged_entry['signature'] = new_el['signature']
            merged_entry['categories'] = new_el['categories'] # Always sync categories from code/logic
            
            # Preserve description if code doesn't have one, but if code has one, use it
            if new_el['description']:
                merged_entry['description'] = new_el['description']
                
            # Ensure all required fields
            for field in REQUIRED_FIELDS:
                if field not in merged_entry:
                    if field == "dependencies":
                        merged_entry[field] = []
                    elif field == "sideEffects":
                        merged_entry[field] = False
                    elif field == "categories":
                         merged_entry[field] = ["Uncategorized"]
                    else:
                        merged_entry[field] = ""
                        
            merged_elements.append(merged_entry)
            if name in existing_lookup:
                del existing_lookup[name]
        else:
            merged_elements.append(new_el)
            
    # Sort by file then name
    merged_elements.sort(key=lambda x: (x['file'], x['name']))
    
    existing_data['elements'] = merged_elements
    return existing_data

def generate_js_map(data):
    """Generates the JS module file from the JSON data."""
    print(f"Generating JS map at {JS_MAP_FILE}...")
    
    content = f"""/**
 * Codebase Map (Auto-generated)
 * Generated by update_map.py
 * DO NOT EDIT MANUALLY
 */
export const CODEBASE_MAP = {json.dumps(data, indent=2)};
"""
    # Ensure directory exists
    os.makedirs(os.path.dirname(JS_MAP_FILE), exist_ok=True)
    
    with open(JS_MAP_FILE, 'w', encoding='utf-8') as f:
        f.write(content)

def main():
    print("--- Starting Codebase Map Update ---")
    new_elements = scan_files()
    print(f"Found {len(new_elements)} exported elements.")
    
    print("Loading existing map...")
    existing_data = load_existing_map()
    
    print("Merging data...")
    updated_data = merge_maps(existing_data, new_elements)
    
    print(f"Writing to {MAP_FILE}...")
    with open(MAP_FILE, 'w', encoding='utf-8') as f:
        json.dump(updated_data, f, indent=2)
        
    generate_js_map(updated_data)
        
    print("--- Update Complete ---")

if __name__ == "__main__":
    main()
