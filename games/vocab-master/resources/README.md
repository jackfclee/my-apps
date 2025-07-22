# Data JSON

## Shell Command for reference

### Generate the empty JSON file

```bash
for letter in {A..Z}; do echo '{"words": []}' > "data-adjective-$letter.json"; done
for letter in {A..Z}; do echo '{"words": []}' > "data-noun-$letter.json"; done
for letter in {A..Z}; do echo '{"words": []}' > "data-verb-$letter.json"; done
```

### Update all JSON files

```bash
for f in data-adjective-*.json; do jq '.words |= (sort_by(.word | ascii_downcase) | unique_by(.word | ascii_downcase) | map(.word |= (.[0:1] | ascii_upcase) + .[1:]))' "$f" > "deduped-$f"; done
for f in deduped-data-adjective-*.json; do mv "$f" "${f#deduped-}"; done
```

```bash
for f in data-noun-*.json; do jq '.words |= (sort_by(.word | ascii_downcase) | unique_by(.word | ascii_downcase) | map(.word |= (.[0:1] | ascii_upcase) + .[1:]))' "$f" > "deduped-$f"; done
for f in deduped-data-noun-*.json; do mv "$f" "${f#deduped-}"; done
```

```bash
for f in data-verb-*.json; do jq '.words |= (sort_by(.word | ascii_downcase) | unique_by(.word | ascii_downcase) | map(.word |= (.[0:1] | ascii_upcase) + .[1:]))' "$f" > "deduped-$f"; done
for f in deduped-data-verb-*.json; do mv "$f" "${f#deduped-}"; done
```

### Count all JSON files

```sql
for f in data-verb-[A-Z].json; do echo -n "$f: "; jq '.words | length' "$f"; done
```

```sql
for f in data-adjective-[A-Z].json; do echo -n "$f: "; jq '.words | length' "$f"; done
```

```sql
for f in data-noun-[A-Z].json; do echo -n "$f: "; jq '.words | length' "$f"; done
```

### Sort and Deduplicate the Array in JSON

```bash
jq '.words |= (sort_by(.word) | unique_by(.word))' data-verb-A.json > deduped-data-verb-A.json
jq '.words |= (sort_by(.word) | unique_by(.word))' data-verb-B.json > deduped-data-verb-B.json
jq '.words |= (sort_by(.word) | unique_by(.word))' data-verb-C.json > deduped-data-verb-C.json
jq '.words |= (sort_by(.word) | unique_by(.word))' data-verb-D.json > deduped-data-verb-D.json
jq '.words |= (sort_by(.word) | unique_by(.word))' data-verb-E.json > deduped-data-verb-E.json
jq '.words |= (sort_by(.word) | unique_by(.word))' data-verb-F.json > deduped-data-verb-F.json
jq '.words |= (sort_by(.word) | unique_by(.word))' data-verb-G.json > deduped-data-verb-G.json
jq '.words |= (sort_by(.word) | unique_by(.word))' data-verb-H.json > deduped-data-verb-H.json
jq '.words |= (sort_by(.word) | unique_by(.word))' data-verb-I.json > deduped-data-verb-I.json
jq '.words |= (sort_by(.word) | unique_by(.word))' data-verb-J.json > deduped-data-verb-J.json
jq '.words |= (sort_by(.word) | unique_by(.word))' data-verb-K.json > deduped-data-verb-K.json
jq '.words |= (sort_by(.word) | unique_by(.word))' data-verb-L.json > deduped-data-verb-L.json
jq '.words |= (sort_by(.word) | unique_by(.word))' data-verb-M.json > deduped-data-verb-M.json
jq '.words |= (sort_by(.word) | unique_by(.word))' data-verb-N.json > deduped-data-verb-N.json
jq '.words |= (sort_by(.word) | unique_by(.word))' data-verb-O.json > deduped-data-verb-O.json
jq '.words |= (sort_by(.word) | unique_by(.word))' data-verb-P.json > deduped-data-verb-P.json
jq '.words |= (sort_by(.word) | unique_by(.word))' data-verb-Q.json > deduped-data-verb-Q.json
jq '.words |= (sort_by(.word) | unique_by(.word))' data-verb-R.json > deduped-data-verb-R.json
jq '.words |= (sort_by(.word) | unique_by(.word))' data-verb-S.json > deduped-data-verb-S.json
jq '.words |= (sort_by(.word) | unique_by(.word))' data-verb-T.json > deduped-data-verb-T.json
jq '.words |= (sort_by(.word) | unique_by(.word))' data-verb-U.json > deduped-data-verb-U.json
jq '.words |= (sort_by(.word) | unique_by(.word))' data-verb-V.json > deduped-data-verb-V.json
jq '.words |= (sort_by(.word) | unique_by(.word))' data-verb-W.json > deduped-data-verb-W.json
jq '.words |= (sort_by(.word) | unique_by(.word))' data-verb-X.json > deduped-data-verb-X.json
jq '.words |= (sort_by(.word) | unique_by(.word))' data-verb-Y.json > deduped-data-verb-Y.json
jq '.words |= (sort_by(.word) | unique_by(.word))' data-verb-Z.json > deduped-data-verb-Z.json
```

### Sort the Array in JSON

```bash
jq '.words |= sort_by(.word)' data-verb-A.json > sorted-data-verb-A.json
jq '.words |= sort_by(.word)' data-verb-B.json > sorted-data-verb-B.json
jq '.words |= sort_by(.word)' data-verb-C.json > sorted-data-verb-C.json
jq '.words |= sort_by(.word)' data-verb-D.json > sorted-data-verb-D.json
jq '.words |= sort_by(.word)' data-verb-E.json > sorted-data-verb-E.json
jq '.words |= sort_by(.word)' data-verb-F.json > sorted-data-verb-F.json
jq '.words |= sort_by(.word)' data-verb-G.json > sorted-data-verb-G.json
jq '.words |= sort_by(.word)' data-verb-H.json > sorted-data-verb-H.json
jq '.words |= sort_by(.word)' data-verb-I.json > sorted-data-verb-I.json
jq '.words |= sort_by(.word)' data-verb-J.json > sorted-data-verb-J.json
jq '.words |= sort_by(.word)' data-verb-K.json > sorted-data-verb-K.json
jq '.words |= sort_by(.word)' data-verb-L.json > sorted-data-verb-L.json
jq '.words |= sort_by(.word)' data-verb-M.json > sorted-data-verb-M.json
jq '.words |= sort_by(.word)' data-verb-N.json > sorted-data-verb-N.json
jq '.words |= sort_by(.word)' data-verb-O.json > sorted-data-verb-O.json
jq '.words |= sort_by(.word)' data-verb-P.json > sorted-data-verb-P.json
jq '.words |= sort_by(.word)' data-verb-Q.json > sorted-data-verb-Q.json
jq '.words |= sort_by(.word)' data-verb-R.json > sorted-data-verb-R.json
jq '.words |= sort_by(.word)' data-verb-S.json > sorted-data-verb-S.json
jq '.words |= sort_by(.word)' data-verb-T.json > sorted-data-verb-T.json
jq '.words |= sort_by(.word)' data-verb-U.json > sorted-data-verb-U.json
jq '.words |= sort_by(.word)' data-verb-V.json > sorted-data-verb-V.json
jq '.words |= sort_by(.word)' data-verb-W.json > sorted-data-verb-W.json
jq '.words |= sort_by(.word)' data-verb-X.json > sorted-data-verb-X.json
jq '.words |= sort_by(.word)' data-verb-Y.json > sorted-data-verb-Y.json
jq '.words |= sort_by(.word)' data-verb-Z.json > sorted-data-verb-Z.json
```

### Find the duplicated words in JSON

```bash
jq -r '.words[].word' data-verb-A.json | sort | uniq -d
jq -r '.words[].word' data-verb-B.json | sort | uniq -d
jq -r '.words[].word' data-verb-C.json | sort | uniq -d
jq -r '.words[].word' data-verb-D.json | sort | uniq -d
jq -r '.words[].word' data-verb-E.json | sort | uniq -d
jq -r '.words[].word' data-verb-F.json | sort | uniq -d
jq -r '.words[].word' data-verb-G.json | sort | uniq -d
jq -r '.words[].word' data-verb-H.json | sort | uniq -d
jq -r '.words[].word' data-verb-I.json | sort | uniq -d
jq -r '.words[].word' data-verb-J.json | sort | uniq -d
jq -r '.words[].word' data-verb-K.json | sort | uniq -d
jq -r '.words[].word' data-verb-L.json | sort | uniq -d
jq -r '.words[].word' data-verb-M.json | sort | uniq -d
jq -r '.words[].word' data-verb-N.json | sort | uniq -d
jq -r '.words[].word' data-verb-O.json | sort | uniq -d
jq -r '.words[].word' data-verb-P.json | sort | uniq -d
jq -r '.words[].word' data-verb-Q.json | sort | uniq -d
jq -r '.words[].word' data-verb-R.json | sort | uniq -d
jq -r '.words[].word' data-verb-S.json | sort | uniq -d
jq -r '.words[].word' data-verb-T.json | sort | uniq -d
jq -r '.words[].word' data-verb-U.json | sort | uniq -d
jq -r '.words[].word' data-verb-V.json | sort | uniq -d
jq -r '.words[].word' data-verb-W.json | sort | uniq -d
jq -r '.words[].word' data-verb-X.json | sort | uniq -d
jq -r '.words[].word' data-verb-Y.json | sort | uniq -d
jq -r '.words[].word' data-verb-Z.json | sort | uniq -d
```

### Deduplicate words in JSON

```bash
jq '.words |= unique_by(.word)' data-verb-A.json > deduped-data-verb-A.json
jq '.words |= unique_by(.word)' data-verb-B.json > deduped-data-verb-B.json
jq '.words |= unique_by(.word)' data-verb-C.json > deduped-data-verb-C.json
jq '.words |= unique_by(.word)' data-verb-D.json > deduped-data-verb-D.json
jq '.words |= unique_by(.word)' data-verb-E.json > deduped-data-verb-E.json
jq '.words |= unique_by(.word)' data-verb-F.json > deduped-data-verb-F.json
jq '.words |= unique_by(.word)' data-verb-G.json > deduped-data-verb-G.json
jq '.words |= unique_by(.word)' data-verb-H.json > deduped-data-verb-H.json
jq '.words |= unique_by(.word)' data-verb-I.json > deduped-data-verb-I.json
jq '.words |= unique_by(.word)' data-verb-J.json > deduped-data-verb-J.json
jq '.words |= unique_by(.word)' data-verb-K.json > deduped-data-verb-K.json
jq '.words |= unique_by(.word)' data-verb-L.json > deduped-data-verb-L.json
jq '.words |= unique_by(.word)' data-verb-M.json > deduped-data-verb-M.json
jq '.words |= unique_by(.word)' data-verb-N.json > deduped-data-verb-N.json
jq '.words |= unique_by(.word)' data-verb-O.json > deduped-data-verb-O.json
jq '.words |= unique_by(.word)' data-verb-P.json > deduped-data-verb-P.json
jq '.words |= unique_by(.word)' data-verb-Q.json > deduped-data-verb-Q.json
jq '.words |= unique_by(.word)' data-verb-R.json > deduped-data-verb-R.json
jq '.words |= unique_by(.word)' data-verb-S.json > deduped-data-verb-S.json
jq '.words |= unique_by(.word)' data-verb-T.json > deduped-data-verb-T.json
jq '.words |= unique_by(.word)' data-verb-U.json > deduped-data-verb-U.json
jq '.words |= unique_by(.word)' data-verb-V.json > deduped-data-verb-V.json
jq '.words |= unique_by(.word)' data-verb-W.json > deduped-data-verb-W.json
jq '.words |= unique_by(.word)' data-verb-X.json > deduped-data-verb-X.json
jq '.words |= unique_by(.word)' data-verb-Y.json > deduped-data-verb-Y.json
jq '.words |= unique_by(.word)' data-verb-Z.json > deduped-data-verb-Z.json
```