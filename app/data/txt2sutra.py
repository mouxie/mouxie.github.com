#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
txt2sutra.py — 佛经 txt → sutra.html 懒加载数据 (.js)

用法（在用户主目录下）:
    uv run --with pypinyin python <本脚本路径> \
        --txt  data/jingang_01.txt \
        --id   jingang_full \
        --title "金刚般若波罗蜜经" \
        --author "姚秦 · 鸠摩罗什 译" \
        --desc  "全文三十二分" \
        --out  data/jingang_full.js

txt 格式约定:
    - 以 "#" 开头的行 = 分/章标题（如 "# 第一分 法会因由"），无 "#" 时整篇归入 "全文" 一章
    - 其余行 = 经文正文，脚本自动按 。！？；： 切句，每句一个 section
    - 输出 token 三元组格式与 sutra.html 现有数据一致: ["字","pīn","pin"]，标点为 ["，",null,null]

输出:
    window.__SUTRA_LOAD__({...});   ← sutra.html 用动态 <script> 注入加载（file:// 下不受 CORS 限制）
    数据结构含 chapters 层: {id,title,author,desc,hanCount,chapters:[{title,sections:[...]}]}
"""
import argparse
import json
import re
import sys

from pypinyin import pinyin, Style

# ============================================================
# 人工校对表（多音字，pypinyin 默认读音在佛经语境常出错）
# PHRASE_FIX: 词组级覆盖（优先，最长上下文最可靠）—— 补全文时按需追加
# CHAR_FIX:   单字级覆盖（只放佛经语境下读音唯一的字，避免误伤）
# ============================================================
PHRASE_FIX = {
    '祇树': ['qí', 'shù'],      # 祇树给孤独园（祇 qí，非 zhǐ）
    '舍卫': ['shè', 'wèi'],     # 舍卫国（地名，舍 shè，非 shě）
    '给孤独': ['jǐ', 'gū', 'dú'],  # 给孤独园（给 jǐ，非 gěi）
    '祇园': ['qí', 'yuán'],
    '著衣': ['zhuó', 'yī'],     # 著衣持钵（著 zhuó = 穿，非 zhù）
    '还至': ['huán', 'zhì'],    # 还至本处（还 huán = 返回，非 hái）
    '饭食': ['fàn', 'shí'],     # 饭食讫（食 shí = 吃，非 sì）
    '食时': ['shí', 'shí'],     # 世尊食时（进食之时）
    '乞食': ['qǐ', 'shí'],
    '般若': ['bō', 'rě'],       # 保险起见（pypinyin 词库一般已含）
    '洗足': ['xǐ', 'zú'],
}
CHAR_FIX = {
    '钵': 'bō',
    '祇': 'qí',   # 佛经语境（祇园/祇树）恒读 qí，非 zhǐ
    '讫': 'qì',
    '敷': 'fū',
    '乞': 'qǐ',
    '俱': 'jù',
    '尔': 'ěr',
    '唎': 'lì',
    '娑': 'suō',
    '诃': 'hē',
    '耨': 'nòu',
    '藐': 'miǎo',
    '埵': 'duǒ',
    '罣': 'guà',
    '槃': 'pán',
    '涅': 'niè',
    '薮': 'sǒu',
}

# 标点集合（token 中拼音置 null）
PUNCT_SET = set('，。！？；：、·…—《》「」『』“”‘’（）()<>[],.!?;:\'"~ ')

# 声调 → 无声调映射（生成第三元素，与现有数据 ["般","bō","bo"] 一致）
_TONE_TABLE = str.maketrans(
    'āáǎàōóǒòēéěèīíǐìūúǔùǖǘǚǜüńňǹ',
    'aaaaooooeeeeiiiiuuuuvvvvvnnn'
)


def strip_tone(py: str) -> str:
    return py.translate(_TONE_TABLE)


def split_sentences(line: str):
    """按 。！？；： 切句，保留句末标点；行尾无标点的残句也保留。"""
    parts = re.findall(r'[^。！？；：]*[。！？；：]|[^。！？；：]+', line)
    return [p for p in (x.strip() for x in parts) if p]


def annotate(sent: str):
    """一句 → token 三元组列表。"""
    s = re.sub(r'\s+', '', sent)
    # errors=lambda: 逐字符原样返回，保证非汉字位置与输入对齐
    raw = pinyin(s, style=Style.TONE, heteronym=False, errors=lambda x: list(x))
    pys = [r[0] if r else None for r in raw]

    # 词组级覆盖
    for phrase, fix in PHRASE_FIX.items():
        start = 0
        while True:
            i = s.find(phrase, start)
            if i < 0:
                break
            for j, p in enumerate(fix):
                if i + j < len(pys):
                    pys[i + j] = p
            start = i + 1
    # 单字级覆盖
    for i, ch in enumerate(s):
        if ch in CHAR_FIX:
            pys[i] = CHAR_FIX[ch]

    tokens = []
    for i, ch in enumerate(s):
        py = pys[i]
        # py == ch 说明 pypinyin 未识别（errors 回调原样返回字符，如生僻符号）
        if ch in PUNCT_SET or not py or py == ch:
            tokens.append([ch, None, None])
        else:
            tokens.append([ch, py, strip_tone(py)])
    return tokens


def parse_txt(text: str):
    chapters = []
    cur = None
    for line in text.splitlines():
        line = line.strip()
        if not line:
            continue
        if line.startswith('#'):
            cur = {'title': line.lstrip('#').strip(), 'sections': []}
            chapters.append(cur)
        else:
            if cur is None:
                cur = {'title': '全文', 'sections': []}
                chapters.append(cur)
            for sent in split_sentences(line):
                toks = annotate(sent)
                if toks:
                    cur['sections'].append(toks)
    return chapters


def main():
    ap = argparse.ArgumentParser(description='佛经 txt → sutra.html 懒加载 js 数据')
    ap.add_argument('--txt', required=True, help='输入 txt（UTF-8，"#" 行=分标题）')
    ap.add_argument('--id', required=True, help='经文 id（如 jingang_full）')
    ap.add_argument('--title', required=True)
    ap.add_argument('--author', default='')
    ap.add_argument('--desc', default='')
    ap.add_argument('--out', required=True, help='输出 .js 文件路径')
    args = ap.parse_args()

    with open(args.txt, 'r', encoding='utf-8-sig') as f:  # BOM 安全
        text = f.read()

    chapters = parse_txt(text)
    if not chapters:
        print('错误：txt 中没有可解析的正文', file=sys.stderr)
        sys.exit(1)

    han = sum(1 for ch in chapters for sec in ch['sections'] for t in sec if t[1])
    sec_n = sum(len(ch['sections']) for ch in chapters)

    data = {
        'id': args.id,
        'title': args.title,
        'author': args.author,
        'desc': args.desc,
        'hanCount': han,
        'chapters': chapters,
    }
    js = 'window.__SUTRA_LOAD__(' + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + ');\n'
    with open(args.out, 'w', encoding='utf-8') as f:
        f.write(js)

    print(f'✓ {args.out}')
    print(f'  章(分)数: {len(chapters)}  句数: {sec_n}  汉字数: {han}  文件大小: {len(js.encode("utf-8"))/1024:.1f} KB')
    # 预览第一章第一句，便于人工校对多音字
    first = chapters[0]['sections'][0]
    print('  预览: ' + ' '.join(f"{t[0]}({t[1] or '·'})" for t in first))


if __name__ == '__main__':
    main()
