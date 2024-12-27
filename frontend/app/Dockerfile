# ベースイメージ
FROM --platform=linux/amd64 node:18-alpine

# 作業ディレクトリ
WORKDIR /app

# package.json と package-lock.json をコピー
COPY package*.json ./

# npm キャッシュをクリアして依存関係をインストール
RUN npm cache clean --force \
    && npm install --omit=optional \
    && npm rebuild

# アプリケーションコードをコピー
COPY . .

# 開発サーバー用のポートを公開
EXPOSE 5173

# 開発サーバーを起動
CMD ["npm", "run", "dev"]
