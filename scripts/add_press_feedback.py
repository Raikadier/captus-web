#!/usr/bin/env python3
"""Add active:scale press feedback to card-like interactive elements in React."""
import re
import os

changed = 0
for root, dirs, files in os.walk('src'):
    for fname in files:
        if not fname.endswith('.jsx'):
            continue
        path = os.path.join(root, fname)
        with open(path, 'r', encoding='utf-8') as f:
            orig = f.read()
        content = orig

        # Add press feedback to lines that have cursor-pointer + a primary bg
        # and no existing active: class
        lines = content.split('\n')
        new_lines = []
        for line in lines:
            if ('cursor-pointer' in line and
                    'active:scale' not in line and
                    'transition-all' not in line and
                    'className=' in line and
                    any(kw in line for kw in ['bg-primary', 'bg-brand-'])):
                # Insert press feedback before the closing quote
                line = re.sub(
                    r'(cursor-pointer)',
                    r'\1 active:scale-[0.97] active:opacity-90 transition-transform',
                    line, count=1
                )
            new_lines.append(line)

        content = '\n'.join(new_lines)
        if content != orig:
            with open(path, 'w', encoding='utf-8') as f:
                f.write(content)
            changed += 1

print(f'Added press feedback to {changed} files')
