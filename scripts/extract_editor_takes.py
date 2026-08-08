import glob
import re

for path in sorted(glob.glob('src/content/destinations/*.yaml')):
    text = open(path, encoding='utf-8').read()
    m_name = re.search(r'^editorName:\s*[\'"]([^\'"]+)[\'"]', text, re.M)
    m_take = re.search(r'^editorTake:\s*\|?\s*\n(.*?)(?=^\S|\Z)', text, re.M | re.S)
    name = m_name.group(1) if m_name else 'NONE'
    take = m_take.group(1).strip() if m_take else 'NONE'
    print('=' * 80)
    print(f'FILE: {path} | EDITOR: {name} | LEN: {len(take)}')
    print('-' * 80)
    print(take)
    print()
