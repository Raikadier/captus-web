#!/usr/bin/env python3
"""Final darkMode ternary elimination — file-specific patterns."""
import os

FIXES = {
    'src/features/groups/GroupsPage.jsx': [
        # Same on both sides
        ("darkMode ? 'bg-background' : 'bg-background'", "'bg-background'"),
        # Muted variants
        ("darkMode ? 'bg-slate-800 text-slate-400' : 'bg-muted text-muted-foreground'",
         "'bg-muted text-muted-foreground'"),
        ("darkMode ? 'bg-slate-800 text-slate-300' : 'bg-muted text-muted-foreground'",
         "'bg-muted text-muted-foreground'"),
        ("darkMode ? 'border-gray-800 text-muted-foreground' : 'border-border text-slate-400'",
         "'border-border text-muted-foreground'"),
        # Stats panels - use muted background with semantic color text
        ("darkMode ? 'bg-slate-800' : 'bg-blue-50'",   "'bg-primary/8'"),
        ("darkMode ? 'text-blue-400' : 'text-blue-600'", "'text-primary'"),
        ("darkMode ? 'text-slate-400' : 'text-blue-600/60'", "'text-muted-foreground'"),
        ("darkMode ? 'bg-slate-800' : 'bg-purple-50'", "'bg-brand-50'"),
        ("darkMode ? 'text-purple-400' : 'text-purple-600'", "'text-brand-700'"),
        ("darkMode ? 'text-slate-400' : 'text-purple-600/60'", "'text-muted-foreground'"),
        ("darkMode ? 'bg-slate-800' : 'bg-brand-50'", "'bg-brand-50'"),
        ("darkMode ? 'text-green-400' : 'text-primary'", "'text-primary'"),
        ("darkMode ? 'text-slate-400' : 'text-primary/60'", "'text-muted-foreground'"),
    ],
    'src/features/notifications/NotificationsPage.jsx': [
        ("darkMode ? 'bg-background' : 'bg-background'", "'bg-background'"),
        ("darkMode ? 'bg-card border-gray-700 hover:bg-slate-800 text-slate-300' : 'bg-card hover:bg-background'",
         "'bg-card hover:bg-muted/50'"),
        ("darkMode ? 'text-slate-400 hover:bg-slate-800' : 'text-muted-foreground hover:bg-card hover:shadow-sm'",
         "'text-muted-foreground hover:bg-muted/30'"),
        ("darkMode ? 'bg-slate-800' : 'bg-muted'", "'bg-muted'"),
        # Notification type colors - keep semantic
        ("darkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-600'",
         "'bg-primary/10 text-primary'"),
        ("darkMode ? 'bg-green-500/20 text-green-400' : 'bg-brand-50 text-primary'",
         "'bg-brand-50 text-primary'"),
        ("darkMode ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-50 text-amber-600'",
         "'bg-amber-50 text-amber-600'"),
        ("darkMode ? 'bg-destructive/20 text-red-400' : 'bg-destructive/10 text-destructive'",
         "'bg-destructive/10 text-destructive'"),
        ("darkMode ? 'bg-slate-700 text-slate-300' : 'bg-muted text-foreground'",
         "'bg-muted text-foreground'"),
    ],
    'src/features/settings/sections/NotificacionesSection.jsx': [
        ("darkMode ? 'bg-card border-gray-700' : 'bg-card'", "'bg-card'"),
        ("darkMode ? 'bg-slate-800/50 border-gray-700' : 'bg-blue-50 border-blue-100'",
         "'bg-primary/5 border-primary/20'"),
        ("darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600'",
         "'bg-primary/10 text-primary'"),
        ("darkMode ? 'text-slate-300' : 'text-foreground'", "'text-foreground'"),
        ("darkMode ? 'bg-slate-800 border-dashed border-gray-600' : 'border-dashed border-slate-300 bg-background'",
         "'border-dashed border-border bg-background'"),
        ("darkMode ? 'border-gray-600 bg-slate-800' : 'border-slate-300 bg-background'",
         "'border-border bg-background'"),
        ("darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-slate-300'",
         "'border-border bg-background text-foreground'"),
        ("darkMode ? 'bg-slate-800/50 border-gray-700' : 'bg-card border-border'",
         "'bg-card border-border'"),
        ("darkMode ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-600'",
         "'bg-brand-50 text-brand-700'"),
        ("darkMode ? 'bg-green-900/30 text-green-400' : 'bg-brand-100 text-primary'",
         "'bg-brand-100 text-primary'"),
        ("darkMode ? 'text-slate-300' : 'text-foreground'", "'text-foreground'"),
    ],
    'src/features/settings/sections/PerfilSection.jsx': [
        # All input field patterns
        ("darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-slate-300'",
         "'border-border bg-background text-foreground'"),
        ("darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-slate-300'",
         "'border-border bg-background text-foreground placeholder:text-muted-foreground'"),
        # Avatar/image patterns
        ("darkMode ? 'bg-gray-700' : 'bg-slate-200'", "'bg-muted'"),
        ("darkMode ? 'bg-slate-700' : 'bg-muted'", "'bg-muted'"),
        ("darkMode ? 'text-slate-400' : 'text-muted-foreground'", "'text-muted-foreground'"),
        # Card pattern
        ("darkMode ? 'bg-card border-gray-700' : 'bg-card'", "'bg-card'"),
    ],
    'src/features/settings/sections/SeguridadSection.jsx': [
        ("darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-slate-300'",
         "'border-border bg-background text-foreground'"),
    ],
    'src/features/courses/StudentCoursesPage.jsx': [
        ("darkMode ? 'bg-background' : 'bg-background'", "'bg-background'"),
        ("darkMode ? 'bg-slate-800 text-slate-300' : 'bg-background text-foreground hover:bg-primary'",
         "'bg-background text-foreground hover:bg-primary hover:text-primary-foreground'"),
    ],
    'src/features/settings/SettingsPage.jsx': [
        ("darkMode ? 'text-slate-300 hover:bg-gray-700' : 'text-foreground hover:bg-background'",
         "'text-foreground hover:bg-muted'"),
        ("darkMode ? 'bg-card border-gray-700' : 'bg-card'", "'bg-card'"),
    ],
    'src/features/settings/sections/AparienciaSection.jsx': [
        # Active theme selection indicator
        ("darkMode ? 'border-white' : 'border-gray-900'", "'border-foreground'"),
        ("darkMode ? 'ring-gray-700' : 'ring-border'", "'ring-border'"),
    ],
    'src/features/settings/sections/LogrosSection.jsx': [
        ("darkMode ? 'bg-card border-gray-700' : 'bg-card'", "'bg-card'"),
    ],
    'src/features/calendar/CalendarPage.jsx': [
        # View switcher inactive state
        ("darkMode ? 'text-slate-400 hover:bg-gray-700' : 'text-muted-foreground hover:bg-background'",
         "'text-muted-foreground hover:bg-muted'"),
    ],
}

total_replacements = 0
for fname, replacements in FIXES.items():
    if not os.path.exists(fname):
        print(f'SKIP (not found): {fname}')
        continue
    with open(fname, 'r', encoding='utf-8') as f:
        content = f.read()
    orig = content
    for old, new in replacements:
        if old in content:
            content = content.replace(old, new)
            total_replacements += 1
    if content != orig:
        with open(fname, 'w', encoding='utf-8') as f:
            f.write(content)
        remaining = content.count('darkMode ?')
        print(f'Fixed {fname} (remaining: {remaining})')

print(f'\nTotal: {total_replacements} replacements')

# Final count
remaining_total = 0
for root, dirs, files in os.walk('src'):
    dirs[:] = [d for d in dirs if d not in ['node_modules']]
    for fname in files:
        if fname.endswith('.jsx'):
            path = os.path.join(root, fname)
            with open(path, 'r', encoding='utf-8') as f:
                c = f.read()
            count = c.count('darkMode ?')
            if count > 0:
                remaining_total += count
                print(f'  Still has {count}: {path}')

print(f'\nGrand total remaining darkMode?: {remaining_total}')
