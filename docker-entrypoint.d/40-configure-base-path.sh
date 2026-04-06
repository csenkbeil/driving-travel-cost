#!/bin/sh
set -eu

BASE_PATH_FILE="/usr/share/nginx/html/base-path.txt"
TARGET_CONFIG="/etc/nginx/conf.d/default.conf"

normalize_base_path() {
  input_path="$1"

  if [ -z "$input_path" ] || [ "$input_path" = "/" ]; then
    printf "/"
    return
  fi

  case "$input_path" in
    /*) ;;
    *) input_path="/$input_path" ;;
  esac

  normalized_path="${input_path%/}/"
  printf "%s" "$normalized_path"
}

if [ -f "$BASE_PATH_FILE" ]; then
  base_path=$(tr -d '\r\n' < "$BASE_PATH_FILE")
else
  base_path="${BASE_PATH:-/}"
fi

normalized_base_path=$(normalize_base_path "$base_path")

if [ "$normalized_base_path" = "/" ]; then
  cat <<'EOF' > "$TARGET_CONFIG"
server {
  listen 80;
  server_name _;

  root /usr/share/nginx/html;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }

  location /assets/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }
}
EOF
  exit 0
fi

base_path_without_trailing_slash="${normalized_base_path%/}"

cat <<EOF > "$TARGET_CONFIG"
server {
  listen 80;
  server_name _;

  root /usr/share/nginx/html;
  index index.html;

  location = / {
    return 302 ${normalized_base_path};
  }

  location = ${base_path_without_trailing_slash} {
    return 302 ${normalized_base_path};
  }

  location ^~ ${normalized_base_path}assets/ {
    rewrite ^${normalized_base_path}(.*)$ /\$1 break;
    expires 1y;
    add_header Cache-Control "public, immutable";
    try_files \$uri =404;
  }

  location ^~ ${normalized_base_path} {
    rewrite ^${normalized_base_path}(.*)$ /\$1 break;
    try_files \$uri \$uri/ /index.html;
  }
}
EOF
