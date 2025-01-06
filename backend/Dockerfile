# ベースイメージ
FROM python:3.10

# 作業ディレクトリ
WORKDIR /app

# 必要なファイルをコンテナにコピー
COPY requirements.txt /app/

# 必要な依存パッケージをインストール
RUN pip install --no-cache-dir -r requirements.txt

# プロジェクトファイルを全てコピー
COPY . /app/

# ポートを開放
EXPOSE 8000

# サーバーを起動
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]

# 必要なビルドツールをインストール
RUN apt-get update && apt-get install -y build-essential

# Pythonビルドツールをインストール
RUN apt-get install -y python3-dev libffi-dev

# pip をアップグレード
RUN pip install --upgrade pip