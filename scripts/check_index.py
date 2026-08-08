import io

h = open('dist/index.html', encoding='utf-8').read()
checks = {
    'ItemList schema': h.count('"@type":"ItemList"') >= 1,
    'ListItem x12': h.count('"@type":"ListItem"') == 12,
    'Video iframe': 'youtube-nocookie.com/embed/bIvgHBuzBYQ' in h,
    'H2 Best Scuba Diving in the World': 'Best Scuba Diving in the World</h2>' in h,
    'H2 Where to Scuba Dive': 'Where to Scuba Dive</h2>' in h,
    'H2 Top Picks 2026': 'Best Places to Scuba Dive: Our Top Picks for 2026</h2>' in h,
    'Hero strong 27': '27 destinations ranked across 25+ data points' in h,
}
for k, v in checks.items():
    print(('PASS' if v else 'FAIL'), k)
