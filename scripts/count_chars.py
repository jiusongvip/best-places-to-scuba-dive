"""Count visible text characters for all built HTML pages (skipping nav/footer/scripts).
Usage: python scripts/count_chars.py
"""
import glob
import os
from html.parser import HTMLParser

SKIP_TAGS = {'nav', 'footer', 'script', 'style', 'head', 'svg', 'noscript', 'header'}


class TextCounter(HTMLParser):
    def __init__(self):
        super().__init__()
        self.skip = 0
        self.chars = 0

    def handle_starttag(self, tag, attrs):
        if tag in SKIP_TAGS:
            self.skip += 1

    def handle_endtag(self, tag):
        if tag in SKIP_TAGS and self.skip > 0:
            self.skip -= 1

    def handle_data(self, data):
        if self.skip == 0:
            self.chars += len(data.strip())


def count_file(path):
    parser = TextCounter()
    parser.feed(open(path, encoding='utf-8').read())
    return parser.chars


def main():
    files = sorted(glob.glob('dist/**/*.html', recursive=True))
    bad = []
    for f in files:
        c = count_file(f)
        rel = f.replace('\\', '/')
        if c < 3000:
            bad.append((rel, c))
    total = len(files)
    print(f'Total pages: {total}')
    print(f'Pages >= 3000 chars: {total - len(bad)}')
    print(f'Pages < 3000 chars: {len(bad)}')
    for rel, c in bad:
        print(f'  LOW {c:>6}  {rel}')


if __name__ == '__main__':
    main()
