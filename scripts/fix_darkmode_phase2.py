#!/usr/bin/env python3
"""
Phase 2: Clean up template literal remnants and fix remaining darkMode ternaries.
"""
import re
import os

def fix_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    orig = content

    # Fix: ${' static-class'} → just use the class directly
    # Pattern: className={`... ${'some-class'} ...`}
    content = re.sub(r"\$\{'([^']+)'\}", r'\1', content)

    # Fix remaining complex darkMode ternaries
    complex_replacements = [
        # NotificacionesSection / PerfilSection patterns
        ("darkMode ? 'text-gray-500' : 'text-muted-foreground'", "'text-muted-foreground'"),
        ("darkMode ? 'text-gray-600' : 'text-muted-foreground'", "'text-muted-foreground'"),
        ("darkMode ? 'bg-gray-800' : 'bg-muted'", "'bg-muted'"),
        ("darkMode ? 'bg-gray-800' : 'bg-card'", "'bg-card'"),
        ("darkMode ? 'bg-gray-800/50' : 'bg-muted/50'", "'bg-muted/50'"),
        ("darkMode ? 'bg-gray-700' : 'bg-muted'", "'bg-muted'"),
        ("darkMode ? 'bg-gray-900' : 'bg-background'", "'bg-background'"),
        ("darkMode ? 'border-gray-600' : 'border-border'", "'border-border'"),
        ("darkMode ? 'border-gray-700' : 'border-border'", "'border-border'"),
        ("darkMode ? 'border-gray-800' : 'border-border'", "'border-border'"),
        ("darkMode ? 'text-gray-400' : 'text-muted-foreground'", "'text-muted-foreground'"),
        ("darkMode ? 'text-gray-300' : 'text-foreground'", "'text-foreground'"),
        ("darkMode ? 'text-gray-200' : 'text-foreground'", "'text-foreground'"),
        ("darkMode ? 'text-white' : 'text-foreground'", "'text-foreground'"),
        ("darkMode ? 'hover:bg-gray-700' : 'hover:bg-muted'", "'hover:bg-muted'"),
        ("darkMode ? 'hover:bg-gray-800' : 'hover:bg-muted'", "'hover:bg-muted'"),
        ("darkMode ? 'bg-gray-800 text-white' : 'bg-muted text-foreground'", "'bg-muted text-foreground'"),
        ("darkMode ? 'text-blue-400' : 'text-primary'", "'text-primary'"),
        # Toggle/switch patterns in settings
        ("darkMode ? 'bg-gray-700' : 'bg-slate-200'", "'bg-muted'"),
        ("darkMode ? 'bg-gray-600' : 'bg-muted'", "'bg-muted'"),
        # Avatar patterns
        ("darkMode ? 'bg-gray-700' : 'bg-slate-100'", "'bg-muted'"),
        ("darkMode ? 'bg-gray-800' : 'bg-slate-50'", "'bg-muted/50'"),
        # Specific Settings section patterns
        ("darkMode ? 'divide-gray-700' : 'divide-border'", "'divide-border'"),
        ("darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-muted-foreground hover:text-foreground'",
         "'text-muted-foreground hover:text-foreground'"),
        # Focus states
        ("darkMode ? 'focus:ring-gray-500' : 'focus:ring-primary'", "'focus:ring-primary'"),
        # Input/form bg
        ("darkMode ? 'bg-gray-800 border-gray-700' : 'bg-background border-border'",
         "'bg-background border-border'"),
        ("darkMode ? 'bg-gray-700 border-gray-600' : 'bg-muted border-border'",
         "'bg-muted border-border'"),
        # Groups page specific
        ("darkMode ? 'bg-gray-800/50 hover:bg-gray-700/50' : 'bg-card hover:bg-muted/50'",
         "'bg-card hover:bg-muted/50'"),
        ("darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-card hover:bg-muted'",
         "'bg-card hover:bg-muted'"),
        # Notifications page
        ("darkMode ? 'bg-gray-800 hover:bg-gray-750' : 'bg-card hover:bg-muted/30'",
         "'bg-card hover:bg-muted/30'"),
        ("darkMode ? 'text-gray-300' : 'text-foreground'", "'text-foreground'"),
        ("darkMode ? 'text-gray-400' : 'text-slate-400'", "'text-slate-400'"),
        # Conditional that's the same on both sides
        ("darkMode ? 'text-muted-foreground' : 'text-muted-foreground'", "'text-muted-foreground'"),
        ("darkMode ? 'border-border' : 'border-border'", "'border-border'"),
    ]

    for old, new in complex_replacements:
        if old in content:
            content = content.replace(old, new)

    if content != orig:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        remaining = content.count('darkMode ?')
        print(f'Fixed {path} (remaining: {remaining})')
        return True
    return False


changed = 0
for root, dirs, files in os.walk('src'):
    dirs[:] = [d for d in dirs if d not in ['node_modules']]
    for fname in files:
        if fname.endswith('.jsx') or fname.endswith('.tsx'):
            if fix_file(os.path.join(root, fname)):
                changed += 1

print(f'\nTotal files changed: {changed}')

# Final count
total = 0
for root, dirs, files in os.walk('src'):
    dirs[:] = [d for d in dirs if d not in ['node_modules']]
    for fname in files:
        if fname.endswith('.jsx'):
            path = os.path.join(root, fname)
            with open(path, 'r', encoding='utf-8') as f:
                c = f.read()
            count = c.count('darkMode ?')
            if count > 0:
                total += count
                print(f'  Remaining: {count} in {path}')

print(f'Total darkMode? remaining: {total}')
