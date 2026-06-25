import os

def replace_in_file(path, replacements):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    for old, new in replacements:
        content = content.replace(old, new)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

base_path = "frontend/src/components"

# Card.tsx
replace_in_file(f"{base_path}/common/Card.tsx", [
    ('bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden', 
     'bg-white dark:bg-slate-900/80 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 backdrop-blur-md overflow-hidden transition-colors duration-300')
])

# Tabs.tsx
replace_in_file(f"{base_path}/common/Tabs.tsx", [
    ('bg-slate-100 p-1 rounded-lg', 'bg-slate-200 dark:bg-slate-800/50 p-1 rounded-lg backdrop-blur-sm border border-slate-300 dark:border-slate-700/50'),
    ('bg-white text-slate-900 shadow-sm', 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'),
    ('text-slate-600 hover:text-slate-900 hover:bg-slate-200', 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-300/50 dark:hover:bg-slate-700/50')
])

# Slider.tsx
replace_in_file(f"{base_path}/common/Slider.tsx", [
    ('text-slate-500 font-medium', 'text-slate-500 dark:text-slate-400 font-medium'),
    ('text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded text-sm', 'text-blue-600 dark:text-blue-400 font-semibold bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded text-sm transition-colors'),
    ('bg-slate-200 rounded-lg', 'bg-slate-200 dark:bg-slate-700 rounded-lg'),
    ('appearance-none w-full h-2 bg-transparent rounded-lg cursor-pointer', 'appearance-none w-full h-2 bg-transparent rounded-lg cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-slate-900 dark:[&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:rounded-sm')
])

# Dropdown.tsx
replace_in_file(f"{base_path}/common/Dropdown.tsx", [
    ('bg-white border border-slate-200 hover:bg-slate-50 text-slate-900', 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 transition-colors'),
    ('bg-white border border-slate-200 shadow-lg rounded-md', 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg rounded-md'),
    ('text-slate-500 bg-slate-50', 'text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50'),
    ('text-slate-900 hover:bg-blue-50 hover:text-blue-700', 'text-slate-900 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-700/80 hover:text-blue-700 dark:hover:text-blue-400')
])

# Tooltip.tsx
replace_in_file(f"{base_path}/common/Tooltip.tsx", [
    ('bg-slate-800 text-white', 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 border border-slate-700 dark:border-slate-300'),
    ('border-slate-800', 'border-slate-800 dark:border-slate-200')
])

print("Common components updated.")
