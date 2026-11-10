#!/usr/bin/env python3
"""Compile referers.yml → referers.json for the attribution module.

Rules
- Every domain key is stored without a leading "www." so it matches the lookup,
  which strips "www." from the visitor's referrer before searching.
- When a domain is listed more than once, one winner is picked the same way every time:
  1. the medium that comes first in MEDIUM_PRECEDENCE
  2. within the same medium, the source listed first in the file
- Search engines use the main brand (Google, Bing, Yahoo!), not product names such as
  Google Shopping or Bing Images.
- Country sites already covered by a prefix (google.co.uk under the "google." rule) are
  not stored again as exact domains. An exact domain is kept when its name differs from
  the prefix, so google.interia.pl stays Interia and mail.google.com stays Gmail.
"""
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "referers.yml"
OUT = ROOT / "referers.json"

MEDIUM_TO_UTM = {
    "search": "organic",
    "social": "social",
    "email": "email",
    "chatbot": "ai",
    "unknown": "inbound",
    "paid": "paid",
}

MEDIUM_PRECEDENCE = ["unknown", "social", "email", "chatbot", "search", "paid"]
RANK = {m: i for i, m in enumerate(MEDIUM_PRECEDENCE)}


# Search engines listed under many product names. Stay broad: use the main brand.
BROAD_SEARCH_BRANDS = [
    "Google",
    "Bing",
    "Yahoo!",
    "Yandex",
    "Naver",
    "Baidu",
    "Daum",
    "Seznam",
    "Ask",
    "Biglobe",
    "auone",
    "Nifty",
    "So-net",
    "Gigablast",
    "Ilse",
    "Orange",
    "Delfi",
    "Road Runner",
    "AOL",
]

_canonical_spelling = {}


def strip_www(domain):
    return domain[4:] if domain.startswith("www.") else domain


def covered_by_prefix(host, prefix):
    return host == prefix or host.startswith(prefix + ".")


# Extra prefixes for product subdomains that have many country-specific variants.
# These are added on top of the {} wildcards in the YAML so e.g. blogsearch.google.com.na
# is covered by the "blogsearch.google" prefix instead of being listed 196 times.
EXTRA_PREFIXES = [
    ("blogsearch.google", "organic", "Google"),
    ("images.google", "organic", "Google"),
    ("news.google", "organic", "Google"),
    ("images.yandex", "organic", "Yandex"),
    ("clck.yandex", "organic", "Yandex"),
    ("search.yahoo", "organic", "Yahoo!"),
]

# Suffix rules for domains where the country code comes first, e.g. ar.search.yahoo.com.
# An exact entry is removed when its host ends with the suffix AND the source/medium match.
# The lookup in attribution.js checks these after prefixes.
EXTRA_SUFFIXES = [
    ("yahoo.com", "organic", "Yahoo!"),
]


def broad_name(medium, source):
    """Main brand for search engines, one spelling for names that differ only by case."""
    name = source
    if medium == "search":
        for brand in BROAD_SEARCH_BRANDS:
            if name == brand or name.startswith(brand + " "):
                name = brand
                break
    return _canonical_spelling.setdefault(name.casefold(), name)


def main():
    try:
        import yaml
    except ImportError:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "pyyaml", "-q"])
        import yaml

    data = yaml.safe_load(SRC.read_text()) or {}

    exact_best = {}  # domain -> (rank, order, entry)
    prefix_best = {}  # prefix -> (rank, order, entry)
    order = 0

    for medium, sources in data.items():
        utm_medium = MEDIUM_TO_UTM.get(medium)
        if utm_medium is None or not isinstance(sources, dict):
            continue
        rank = RANK[medium]
        for source_name, meta in sources.items():
            if not isinstance(meta, dict):
                continue
            for d in meta.get("domains") or []:
                d = str(d).strip().lower()
                if not d:
                    continue
                order += 1
                entry = {"medium": utm_medium, "source": broad_name(medium, str(source_name))}
                if d.endswith(".{}"):
                    key = strip_www(d[:-3])
                    store = prefix_best
                else:
                    key = strip_www(d)
                    store = exact_best
                if not key:
                    continue
                candidate = (rank, order, entry)
                current = store.get(key)
                if current is None or candidate[:2] < current[:2]:
                    store[key] = candidate

    # Add extra prefixes for product subdomains with many country variants.
    for prefix, medium, source in EXTRA_PREFIXES:
        entry = {"medium": medium, "source": source}
        rank = RANK["search"]
        candidate = (rank, 0, entry)
        current = prefix_best.get(prefix)
        if current is None or candidate[:2] < current[:2]:
            prefix_best[prefix] = candidate

    prefixes = [
        {"prefix": k, **v[2]}
        for k, v in sorted(prefix_best.items(), key=lambda kv: kv[1][1])
    ]
    exact = {}
    for host, (_rank, _order, entry) in sorted(exact_best.items(), key=lambda kv: kv[1][1]):
        same = next(
            (
                p
                for p in prefixes
                if covered_by_prefix(host, p["prefix"])
                and p["source"] == entry["source"]
                and p["medium"] == entry["medium"]
            ),
            None,
        )
        if same is None:
            # Check suffix rules (e.g. ar.search.yahoo.com ends with yahoo.com)
            suffix_hit = next(
                (
                    s
                    for s in EXTRA_SUFFIXES
                    if ("." + s[0]) in ("." + host)
                    and host != s[0]
                    and s[1] == entry["medium"]
                    and s[2] == entry["source"]
                ),
                None,
            )
            if suffix_hit is None:
                exact[host] = entry

    OUT.write_text(
        json.dumps(
            {
                "exact": exact,
                "prefixes": prefixes,
                "suffixes": [
                    {"suffix": s, "medium": m, "source": src}
                    for s, m, src in EXTRA_SUFFIXES
                ],
                "mediumMap": {k: v for k, v in MEDIUM_TO_UTM.items() if v != "paid"},
            },
            indent=2,
        )
        + "\n"
    )
    print(f"wrote {OUT} ({OUT.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
