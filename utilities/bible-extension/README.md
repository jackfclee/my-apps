# Bible Extension / 典外書卷

A separate static reader for the nine requested ancient works. The existing `../bible` app and its texts are untouched. No build step, external JavaScript, runtime translation service, or API key is required. All reading text is local JSON.

## Run

From the utilities directory:

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

Open http://127.0.0.1:8765/bible-extension/. Serve over HTTP; opening `index.html` directly as a `file:` URL will prevent JSON loading in many browsers. The folder also works on static hosting under its existing relative path. Nothing has been published.

Select a book, section, and English / Traditional Chinese / side-by-side view. Text size includes a presentation option. Left/right arrow keys change sections; up/down select passages. URL fragments preserve book, section, and language. On narrow screens bilingual passages stack vertically.

## Current translation coverage

**This is a work in progress, not a complete bilingual release.** Translation agents stopped at the account usage limit. Completed Chinese chapters are available in the reader; unavailable chapters explicitly display a notice and English. No English passage is labelled as Chinese, and no missing chapter is filled with a summary.

| Work | English sections | Chinese sections saved |
| --- | ---: | ---: |
| Book of Jubilees / 禧年書 | 50 | 27 |
| 1 Enoch / 以諾一書 | 109 | 85 |
| 2 Enoch / 以諾二書 | 68 | 68 |
| 3 Enoch / 以諾三書 | 54 | 0 |
| Apocalypse of Abraham / 亞伯拉罕啟示錄 | 33 | 33 |
| Life of Adam and Eve / 亞當和夏娃生平 | 64 | 64 |
| Testaments of the Twelve Patriarchs / 十二族長遺訓 | 142 | 142 |
| 4 Ezra / 以斯拉四書 | 12 | 0 |
| 2 Baruch / 巴錄二書 | 87 | 30 |

The machine-readable current counts are in `static/data/coverage.json`. Sections are not always canonical chapter numbers: see edition notes below. Chinese is a newly produced AI translation of the cited English, **not** a published translation, not translated directly from ancient manuscripts, and not independently scholarly reviewed. Proper-name transliterations and difficult textual readings need review.

## Sources and editions

Eight English works were extracted from [StudyLight's Pseudepigrapha collection](https://www.studylight.org/historical-writings/pseudepigrapha.html), retaining only the historical translation and its source attribution in the distributable JSON, not the site's modern introductions. Each book JSON carries its exact URL, edition credit, retrieval date and raw source SHA-256.

| Work | English edition |
| --- | --- |
| Jubilees | R. H. Charles, APOT vol. 2, 1913 |
| 1 Enoch | R. H. Charles, APOT vol. 2, 1913 |
| 2 Enoch | W. R. Morfill, edited by R. H. Charles, 1896 |
| 3 Enoch | Hugo Odeberg, 1928 |
| Apocalypse of Abraham | G. H. Box with J. I. Landsman, 1918 |
| Life of Adam and Eve | L. S. A. Wells, APOT vol. 2, 1913 |
| Twelve Patriarchs | R. H. Charles, APOT vol. 2, 1913 |
| 4 Ezra | [World English Bible Classic, 2 Esdras 3–14](https://ebible.org/eng-web/2ES03.htm) |
| 2 Baruch | R. H. Charles, APOT vol. 2, 1913 |

The historical English editions are presented by the hosts as public domain; that designation should not be read as a worldwide rights opinion. In particular, the 1928 Odeberg edition can have different status in countries using the translator's life plus a term. [WEB's publisher explicitly dedicates its text to the public domain](https://ebible.org/eng-web/copyright.htm); the new Chinese translation is not called the World English Bible.

Published Traditional Chinese editions were found in Christian Literature Council's *基督教典外文獻：舊約篇*, including [volume 1 (Enoch)](https://www.cclc.org.hk/product/基督教典外文獻：舊約篇-第一冊/) and [volume 4 (Jubilees and Testaments)](https://www.cclc.org.hk/product/基督教典外文獻：舊約篇-第四冊/). No permission to reproduce those modern translations was established, so their full text is not bundled. The user's approved fallback is an explicitly labelled AI translation.

### Editorial details and known limitations

- 1 Enoch follows the source's split 91a / 91b, so it has 109 reader sections covering the 108 numbered chapters.
- 2 Enoch uses the 68-chapter Morfill text as transcribed by the host, not later 73-chapter arrangements. The original 1896 edition places 22:1–3 in manuscript A’s apparatus on printed page 27, so the main text begins chapter 22 at verse 4. This is an editorial arrangement, not a lost download; see the [original edition](https://archive.org/details/bookofsecretsofe00morf/page/27). Other gaps and manuscript distinctions remain as printed, not silently renumbered.
- 3 Enoch includes lettered sections and 48 A–D. The host uses one reading where Odeberg prints parallel manuscript versions; this is not a transcription of his entire critical apparatus.
- Apocalypse of Abraham includes a title section plus chapters 1–32. Its source is unversed prose; the reader labels it as text, not invented Bible verse numbers.
- Life of Adam and Eve is the 51-chapter **Latin Life** plus the source's Slavonic appendix, chapters 28–40. It is not the distinct *Conflict of Adam and Eve with Satan*. Some source combined verse numbers remain within a passage.
- The Twelve Patriarchs have twelve separately titled testaments with their own chapter numbering. Source manuscript gaps in Zebulun 4, Gad 2 and Joseph 19 are retained. Benjamin 5:5's truncated ending was restored from the [parallel Charles transcription](https://www.earlychristianwritings.com/text/patriarchs-charles.html) and recorded in `source.repairs`.
- 4 Ezra is the Jewish apocalypse in **2 Esdras chapters 3–14**, retaining those numbers, including all 140 verses of chapter 7. The other works sometimes called 5 Ezra (chapters 1–2) and 6 Ezra (15–16) are excluded.
- 2 Baruch includes all 87 source chapters, including the letter.
- Source headings, bracketed readings and editorial marks are retained where available. These editions differ from modern critical editions. Structural validation is not a scholarly verification of every reading.

## Data and maintenance

`static/data/<book>.en.json` and `<book>.zh-Hant.json` contain:

- `id`, bilingual `title`, `language`, and `source` provenance;
- `chapters`: ordered objects with stable `id`, display `label`, `section`, and `verses`;
- `verses`: source `number` and plain `text`; `preface` and `paragraph` are special labels, not invented verse numbers.

Chinese chapter IDs and passage numbers must match the corresponding English chapter exactly. Partial translations include only finished chapters and carry `translationStatus`; never insert empty placeholders. The JSON files in `static/data/` are the authoritative saved translation progress. Resume missing chapters by comparing Chinese chapter IDs with the English files; retain existing translated chapters.

```sh
python3 bible-extension/scripts/validate_data.py
node --check bible-extension/static/js/main.js
# Release gate: deliberately fails while any Chinese book is incomplete.
python3 bible-extension/scripts/validate_data.py --require-complete
```

Temporary HTML downloads, translation batch copies, and one-time import/assembly scripts were removed after verifying that every saved translation passage was already present in `static/data/`. Source URLs, edition credits, original download hashes, and documented corrections remain in the book JSON files. Keep `scripts/validate_data.py` for ongoing data and translation checks.

Browser visual/interaction testing has not been completed: the Browser runtime reported no connected browsers. JavaScript syntax and corpus alignment checks are available independently.
