#!/usr/bin/env python3
"""
Remove manual darkMode ternaries — replace with semantic CSS variables
that adapt automatically via the design system CSS custom properties.
"""
import re
import os

FILES = [
    'src/features/courses/StudentCoursesPage.jsx',
    'src/features/groups/GroupsPage.jsx',
    'src/features/notifications/NotificationsPage.jsx',
    'src/features/dashboard/components/HomePage.jsx',
    'src/features/calendar/CalendarPage.jsx',
    'src/features/calendar/components/CalendarWeekView.jsx',
    'src/features/settings/SettingsPage.jsx',
    'src/features/settings/sections/AparienciaSection.jsx',
    'src/features/settings/sections/LogrosSection.jsx',
    'src/features/settings/sections/NotificacionesSection.jsx',
    'src/features/settings/sections/PerfilSection.jsx',
    'src/features/settings/sections/SeguridadSection.jsx',
]

# Ordered replacements: most specific first
REPLACEMENTS = [
    # bg-[#F6F7FB] custom hex → bg-background (muted page bg)
    ("bg-[#F6F7FB]", "bg-background"),
    # darkMode border variants
    ("darkMode ? 'bg-card border-gray-800' : 'bg-card border-border'", "'bg-card border-border'"),
    ("darkMode ? 'border-gray-800' : 'border-border'", "'border-border'"),
    ("darkMode ? 'border-gray-700' : 'border-border'", "'border-border'"),
    # darkMode hover variants
    ("darkMode ? 'hover:bg-gray-700' : 'hover:bg-muted'", "'hover:bg-muted'"),
    ("darkMode ? 'hover:bg-gray-800' : 'hover:bg-muted'", "'hover:bg-muted'"),
    # darkMode text variants
    ("darkMode ? 'text-white' : 'text-foreground'", "'text-foreground'"),
    ("darkMode ? 'text-foreground' : 'text-foreground'", "'text-foreground'"),
    ("darkMode ? 'text-slate-400' : 'text-muted-foreground'", "'text-muted-foreground'"),
    ("darkMode ? 'text-muted-foreground' : 'text-muted-foreground'", "'text-muted-foreground'"),
    ("darkMode ? 'text-muted-foreground' : 'text-slate-400'", "'text-muted-foreground'"),
    # darkMode background variants
    ("darkMode ? 'bg-card' : 'bg-card'", "'bg-card'"),
    ("darkMode ? 'bg-slate-800' : 'bg-card'", "'bg-card'"),
    ("darkMode ? 'bg-slate-900' : 'bg-background'", "'bg-background'"),
    ("darkMode ? 'bg-slate-900/50' : 'bg-card/50'", "'bg-card/50'"),
    ("darkMode ? 'border-gray-800 bg-slate-900/50' : 'border-border bg-card/50'", "'border-border bg-card/50'"),
    # primary tints dark mode
    ("darkMode ? 'bg-primary/20 text-primary' : 'bg-primary/10 text-primary'", "'bg-primary/10 text-primary'"),
    ("darkMode ? 'bg-primary/20' : 'bg-primary/10'", "'bg-primary/10'"),
    # hover shadow
    ("darkMode ? 'bg-card hover:bg-slate-800' : 'bg-card hover:shadow-lg'", "'bg-card hover:shadow-md'"),
    # empty state colors
    ("darkMode ? 'text-foreground' : 'text-slate-300'", "'text-muted-foreground'"),
    # Button variant that does nothing different
    ("darkMode ? 'text-primary hover:text-primary hover:bg-primary/20' : ''", "''"),
    # shadow-2xl → shadow-xl (use design system maximum)
    ("shadow-2xl", "shadow-xl"),
]

total_files = 0
total_replacements = 0

for fname in FILES:
    with open(fname, 'r', encoding='utf-8') as f:
        content = f.read()
    orig = content

    for old, new in REPLACEMENTS:
        if old in content:
            count = content.count(old)
            content = content.replace(old, new)
            total_replacements += count

    if content != orig:
        with open(fname, 'w', encoding='utf-8') as f:
            f.write(content)
        remaining = content.count('darkMode ?')
        total_files += 1
        print(f'Fixed {fname} (darkMode? remaining: {remaining})')

# Also fix shadow-2xl in other files
for root, dirs, files in os.walk('src/features'):
    dirs[:] = [d for d in dirs if d not in ['node_modules']]
    for fname in files:
        if not fname.endswith('.jsx'):
            continue
        path = os.path.join(root, fname)
        if path.replace('\\', '/') in [f.replace('\\', '/') for f in FILES]:
            continue
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
        if 'shadow-2xl' in content:
            content = content.replace('shadow-2xl', 'shadow-xl')
            with open(path, 'w', encoding='utf-8') as f:
                f.write(content)
            total_files += 1
            total_replacements += 1
            print(f'shadow-2xl fix: {path}')

print(f'\nTotal: {total_files} files, {total_replacements} replacements')
