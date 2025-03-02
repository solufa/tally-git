# Tally git

Gitリポジトリのコミット履歴から月別に個人のコーディング量を集計

```sh
$ npm run dev
# or
$ npm run dev <dir path> <months?># ex. npm run dev ../my-project 12
```

言語行数計算

cloc --vcs=git --not-match-f='(package-lock.json|yarn.lock|composer.lock)'
