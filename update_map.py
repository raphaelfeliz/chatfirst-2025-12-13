import os
import re
import json
import sys

# Configuration
PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
SCRIPTS_DIR = os.path.join(PROJECT_ROOT, 'scripts')
MAP_FILE = os.path.join(PROJECT_ROOT, 'codebase-map.json')

# Regex patterns
PATTERN_EXPORT_CONST = re.compile(r'export\s+const\s+(\w+)')
PATTERN_EXPORT_FUNCTION = re.compile(r'export\s+function\s+(\w+)\s*\(([^)]*)\)')
PATTERN_EXPORT_CLASS = re.compile(r'export\s+class\s+(\w+)')

def load_existing_map():
    if os.path.exists(MAP_FILE):
        try:
            with open(MAP_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except json.JSONDecodeError:
            print(f"Warning: Could not decode {MAP_FILE}. Starting fresh.")
    return {"template-to-follow": [], "elements": []}

def scan_files():
    found_elements = []
    
    for root, dirs, files in os.walk(SCRIPTS_DIR):
        for file in files:
            if file.endswith('.js'):
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, PROJECT_ROOT).replace('\\', '/')
                
                with open(full_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    
                    # Find Constants
                    for match in PATTERN_EXPORT_CONST.finditer(content):
                        name = match.group(1)
                        found_elements.append({
                            "name": name,
                            "file": rel_path,
                            "type": "constant",
                            "signature": "N/A" # Hard to infer type from regex easily without complex parsing
                        })

                    # Find Functions
                    for match in PATTERN_EXPORT_FUNCTION.finditer(content):
                        name = match.group(1)
                        params = match.group(2)
                        found_elements.append({
                            "name": name,
                            "file": rel_path,
                            "type": "function",
                            "signature": f"({params}) => void" # Default, user can refine
                        })
                        
                    # Find Classes
                    for match in PATTERN_EXPORT_CLASS.finditer(content):
                        name = match.group(1)
                        found_elements.append({
                            "name": name,
                            "file": rel_path,
                            "type": "class",
                            "signature": "class"
                        })

    return found_elements

def merge_maps(existing_data, new_elements):
    existing_elements = existing_data.get("elements", [])
    merged_elements = []
    
    # Create a lookup for existing elements to preserve manual fields
    existing_lookup = {el['name']: el for el in existing_elements}
    
    for new_el in new_elements:
        name = new_el['name']
        
        if name in existing_lookup:
            # Update existing entry with found data, but keep manual fields
            existing = existing_lookup[name]
            merged_entry = existing.copy()
            merged_entry['file'] = new_el['file'] # Update location if moved
            merged_entry['type'] = new_el['type']
            # Only update signature if it's currently generic or empty
            if 'signature' not in merged_entry or not merged_entry['signature']:
                 merged_entry['signature'] = new_el['signature']
            
            merged_elements.append(merged_entry)
            # Remove from lookup to track what's left (deleted code)
            del existing_lookup[name]
        else:
            # New entry
            new_el.update({
                "description": "",
                "dependencies": [],
                "sideEffects": False, # Default
                "category": "Uncategorized"
            })
            merged_elements.append(new_el)
            
    # Optional: What to do with elements in JSON but not in code?
    # For now, we keep them but maybe mark them? Or just remove them?
    # Let's remove them to keep it synced, as "ghost" elements are confusing.
    # If you want to keep them, uncomment below:
    # for remaining in existing_lookup.values():
    #     merged_elements.append(remaining)

    # Sort by file then name
    merged_elements.sort(key=lambda x: (x['file'], x['name']))
    
    existing_data['elements'] = merged_elements
    return existing_data

def main():
    print("Scanning scripts...")
    new_elements = scan_files()
    print(f"Found {len(new_elements)} exported elements.")
    
    print("Loading existing map...")
    existing_data = load_existing_map()
    
    print("Merging data...")
    updated_data = merge_maps(existing_data, new_elements)
    
    print(f"Writing to {MAP_FILE}...")
    with open(MAP_FILE, 'w', encoding='utf-8') as f:
        json.dump(updated_data, f, indent=2)
        
    print("Done!")

if __name__ == "__main__":
    main()
