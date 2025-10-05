import os

# === CONFIGURATION ===
folder_path = r"/Users/bernardo.jose/Todo-App"  # Change this to your project folder
preview_lines = 20  # Number of lines of code to show per file
file_extensions = ('.py', '.js', '.c', '.cpp', '.cs', '.java', '.html', '.css')  # Filter files

# === FUNCTION ===
def print_tree_with_code(folder):
    for root, dirs, files in os.walk(folder):
        level = root.replace(folder, '').count(os.sep)
        indent = ' ' * 4 * level
        print(f"{indent}{os.path.basename(root)}/")
        sub_indent = ' ' * 4 * (level + 1)
        for f in files:
            if f.endswith(file_extensions):
                file_path = os.path.join(root, f)
                print(f"{sub_indent}{f}")
                try:
                    with open(file_path, 'r', encoding='utf-8') as file_obj:
                        lines = file_obj.readlines()
                        for i, line in enumerate(lines[:preview_lines]):
                            print(f"{sub_indent}    {line.rstrip()}")
                        if len(lines) > preview_lines:
                            print(f"{sub_indent}    ... (and {len(lines) - preview_lines} more lines)")
                except Exception as e:
                    print(f"{sub_indent}    [Could not read file: {e}]")

# === RUN ===
print_tree_with_code(folder_path)
