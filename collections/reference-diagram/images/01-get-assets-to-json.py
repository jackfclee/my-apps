import os
import json
import sys

# Check if the user has provided a path argument
if len(sys.argv) < 2:
  print("Usage: python3 get-assets-to-json.py [path_to_directory]")
  sys.exit(1)

# Set the root path from the command line argument
root_path = sys.argv[1]

# Define image extensions you expect to encounter
image_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'}

# Initialize data from existing JSON file if it exists
try:
  with open('z.json', 'r') as f:
    data = json.load(f)
except FileNotFoundError:
  data = []

# Create a mapping from categories to their existing records for easy update
topic_map = {item['topic']: item for item in data}

# Walk through the directory structure
for subdir, dirs, files in os.walk(root_path):
  topic_name = os.path.basename(subdir)
  # Check if we are not at the root directory level
  if topic_name != os.path.basename(root_path):
    # Sort files first before creating references
    sorted_files = sorted([file for file in files if os.path.splitext(file)[1].lower() in image_extensions])
    new_references = [{"file": file, "displayName": "", "tags": []} for file in sorted_files]

    if topic_name in topic_map:
      # Update existing topic
      existing_refs_dict = {ref['file']: ref for ref in topic_map[topic_name]['references']}
      new_files_dict = {ref['file']: ref for ref in new_references}

      # Files to potentially remove
      files_to_remove = set(existing_refs_dict) - set(new_files_dict)
      updated_refs = [ref for ref in topic_map[topic_name]['references'] if ref['file'] not in files_to_remove]

      # Files to add or update
      for file, ref in new_files_dict.items():
        if file in existing_refs_dict:
          # Update existing entry, ensure displayName and tags are present
          updated_ref = existing_refs_dict[file]
          updated_ref['displayName'] = updated_ref.get('displayName', "")
          updated_ref['tags'] = updated_ref.get('tags', [])
        else:
          # Add new entry
          updated_refs.append(ref)

      # Sort updated references before assigning
      updated_refs_sorted = sorted(updated_refs, key=lambda x: x['file'])
      topic_map[topic_name]['references'] = updated_refs_sorted
    else:
      # Add new topic
      data.append({
        "topic": topic_name,
        "references": new_references
      })

# Convert the updated list to a sorted list based on the topic
sorted_data = sorted(data, key=lambda x: x['topic'])

# Convert the sorted list back to JSON
json_data = json.dumps(sorted_data, indent=2)

# Print or save the JSON data
print(json_data)

# Write the updated JSON data to the file
with open('z.json', 'w') as f:
  f.write(json_data)
