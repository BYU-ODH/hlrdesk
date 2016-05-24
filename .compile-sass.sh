#!/bin/bash
for i in core/sass/main.s[ac]ss
  do
    j=$(basename $i)
    $(npm bin)/node-sass --output-style compressed $i public/css/${j:0:-4}css
done
