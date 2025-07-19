# Data JSON

## Shell Command for reference

### Sort the Array in JSON

```bash
jq '.words |= sort_by(.word)' data-verb-A.json > sorted-data-verb-A.json
```

### Find the duplicated words in JSON

```bash
jq -r '.words[].word' data-verb-A.json | sort | uniq -d
```