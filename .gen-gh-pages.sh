#!/bin/bash
INDEX=gh-pages/index.html
PREFIX="gs://"
echo "<!DOCTYPE html><h1>Screenshot directory</h1><h2>Images removed after 26 days</h2><ol>" > $INDEX

IFS=$'\n'
for i in $(gsutil ls "$PREFIX"byu-hlr-screenshots/ | sort -nr); do
  build=`basename $i`
  escaped_build=`echo $build | sed 's/#/%23/g'`
  
  echo "<li><a href='$escaped_build'>$build</a></li>" >> $INDEX

  mkdir -p "gh-pages/$build"
  PAGE=gh-pages/$build/index.html
  echo "<!DOCTYPE html>" > $PAGE
  echo "<link rel=stylesheet href='../style.css'>" >> $PAGE

  for j in `gsutil ls "$i"`; do
    FILE=${j:${#PREFIX}}
    URL=http://storage.googleapis.com/$FILE
    ESCAPED_URL=`echo $URL | sed 's/#/%23/g'`
    echo "<a href=\"$ESCAPED_URL\" class=img-holder><img src=\"$ESCAPED_URL\"></a><small><a href=\"$ESCAPED_URL\">$URL</a></small>" >> $PAGE
  done
done
echo "</ol>" >> $INDEX
