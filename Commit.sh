#!/bin/bash
set -ex

git add .
git commit -m `date +"%y/%m/%d"`
git push
