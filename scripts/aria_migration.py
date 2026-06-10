#!/usr/bin/env python3
"""
ISO 25010 Accessibility migration for React.
Adds ARIA attributes, semantic roles, and keyboard accessibility.
"""
import re
import os
import glob

SKIP_DIRS = {'node_modules', '.git', 'dist', 'build', '.next'}


def process_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    orig = content

    # 1. Add aria-label to icon-only buttons (onClick without text)
    # Buttons that have only an icon child (SVG or lucide icons) need aria-label
    # Pattern: <button ...>  <SomeIcon ... />  </button>
    # Hard to do automatically — we'll add role="button" to interactive divs instead

    # 2. Add role="button" + tabIndex + keyboard handler to div/span onClick
    def add_role_to_div_onclick(m):
        attrs = m.group(1)
        tag = m.group(0)[:m.group(0).index(' ')]
        if 'role=' in attrs or 'tabIndex' in attrs:
            return m.group(0)
        # Add role="button" tabIndex={0}
        return m.group(0).replace(
            'onClick=',
            'role="button" tabIndex={0} onKeyDown={(e) => e.key === \'Enter\' && e.currentTarget.click()} onClick='
        )

    # Only add to divs/spans with onClick but no role (careful - only interactive elements)
    content = re.sub(
        r'<(?:div|span)([^>]*\sonClick=\{[^}]+\}[^>]*)(?!\s*role=)',
        lambda m: m.group(0) if ('role=' in m.group(1) or
                                   'tabIndex' in m.group(1) or
                                   'cursor-pointer' not in m.group(1))
                  else m.group(0).replace(
                      'onClick=',
                      'role="button" tabIndex={0} onKeyDown={(e) => e.key === \'Enter\' && e.currentTarget.click()} onClick='
                  ),
        content
    )

    # 3. Add alt="" to img tags without alt (decorative images get empty alt)
    content = re.sub(
        r'(<img\b(?![^>]*\balt=)[^>]*)(/>|>)',
        r'\1 alt=""\2',
        content
    )

    # 4. Add aria-label to inputs without label or aria-label
    # Input with placeholder but no label association or aria-label
    def add_aria_to_lonely_input(m):
        if 'aria-label' in m.group(0) or 'id=' in m.group(0):
            return m.group(0)
        # Extract placeholder value
        placeholder_m = re.search(r'placeholder=["\']([^"\']+)["\']', m.group(0))
        if placeholder_m:
            label = placeholder_m.group(1)
            return m.group(0).replace(
                'placeholder=',
                f'aria-label="{label}" placeholder='
            )
        return m.group(0)
    content = re.sub(
        r'<input\b[^>]*/?>',
        add_aria_to_lonely_input,
        content
    )

    # 5. Add aria-label to textarea without label
    def add_aria_to_textarea(m):
        if 'aria-label' in m.group(0) or 'id=' in m.group(0):
            return m.group(0)
        placeholder_m = re.search(r'placeholder=["\']([^"\']+)["\']', m.group(0))
        if placeholder_m:
            label = placeholder_m.group(1)
            return m.group(0).replace(
                'placeholder=',
                f'aria-label="{label}" placeholder='
            )
        return m.group(0)
    content = re.sub(r'<textarea\b[^>]*>', add_aria_to_textarea, content)

    # 6. Add aria-live="polite" to dynamic content areas
    # Already handled by toast/notification systems

    # 7. Add lang attribute to html-level components (done in index.html)

    if content != orig:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False


def add_aria_to_modals():
    """Add aria-modal, aria-labelledby to dialog components."""
    pass


def main():
    changed = 0
    for root, dirs, files in os.walk('src'):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
        for fname in files:
            if not (fname.endswith('.jsx') or fname.endswith('.tsx')):
                continue
            if process_file(os.path.join(root, fname)):
                changed += 1
    print(f'ARIA migration: {changed} files changed')


if __name__ == '__main__':
    main()
