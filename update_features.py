import os
import glob

def add_dark_classes(directory):
    replacements = [
        ("text-slate-900", "text-slate-900 dark:text-white"),
        ("text-slate-800", "text-slate-800 dark:text-slate-200"),
        ("text-slate-700", "text-slate-700 dark:text-slate-300"),
        ("text-slate-600", "text-slate-600 dark:text-slate-400"),
        ("text-slate-500", "text-slate-500 dark:text-slate-400"),
        ("bg-slate-50 ", "bg-slate-50 dark:bg-slate-900/50 "),
        ("bg-slate-50\"", "bg-slate-50 dark:bg-slate-900/50\""),
        ("bg-slate-100", "bg-slate-100 dark:bg-slate-800/50"),
        ("bg-slate-200", "bg-slate-200 dark:bg-slate-700"),
        ("border-slate-200", "border-slate-200 dark:border-slate-700"),
        ("border-slate-300", "border-slate-300 dark:border-slate-600"),
        ("hover:bg-slate-50", "hover:bg-slate-50 dark:hover:bg-slate-800/50"),
        ("hover:bg-slate-100", "hover:bg-slate-100 dark:hover:bg-slate-700/50"),
        ("bg-blue-600", "bg-blue-600 dark:bg-blue-500"),
        ("text-blue-500", "text-blue-500 dark:text-blue-400"),
        ("text-blue-600", "text-blue-600 dark:text-blue-400"),
        ("bg-white", "bg-white dark:bg-slate-800"),
        ("dark:text-white dark:text-white", "dark:text-white"),
        ("dark:text-slate-200 dark:text-slate-200", "dark:text-slate-200"),
        ("dark:text-slate-300 dark:text-slate-300", "dark:text-slate-300"),
        ("dark:text-slate-400 dark:text-slate-400", "dark:text-slate-400"),
        ("dark:bg-slate-900/50 dark:bg-slate-900/50", "dark:bg-slate-900/50"),
        ("dark:bg-slate-800/50 dark:bg-slate-800/50", "dark:bg-slate-800/50"),
        ("dark:bg-slate-700 dark:bg-slate-700", "dark:bg-slate-700"),
        ("dark:border-slate-700 dark:border-slate-700", "dark:border-slate-700"),
        ("dark:border-slate-600 dark:border-slate-600", "dark:border-slate-600"),
        ("dark:hover:bg-slate-800/50 dark:hover:bg-slate-800/50", "dark:hover:bg-slate-800/50"),
        ("dark:hover:bg-slate-700/50 dark:hover:bg-slate-700/50", "dark:hover:bg-slate-700/50"),
        ("dark:bg-blue-500 dark:bg-blue-500", "dark:bg-blue-500"),
        ("dark:text-blue-400 dark:text-blue-400", "dark:text-blue-400"),
        ("dark:bg-slate-800 dark:bg-slate-800", "dark:bg-slate-800"),
    ]

    # Find all tsx files in the directory recursively
    for filepath in glob.glob(f"{directory}/**/*.tsx", recursive=True):
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # We don't want to replace inside common/Card, common/Tabs, etc. because we manually updated them
        if "components/common/" in filepath.replace("\\", "/"):
            continue

        for old, new in replacements:
            content = content.replace(old, new)

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

add_dark_classes("frontend/src/features")
print("Features updated.")
