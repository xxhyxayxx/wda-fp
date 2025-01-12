# ベースイメージ
FROM python:3.10

# 必要なビルドツールをインストール
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    python3-dev \
    libffi-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# pip をアップグレード
RUN pip install --upgrade pip

# 非特権ユーザーの作成
RUN useradd -ms /bin/bash appuser

# 作業ディレクトリの設定と所有権の変更
WORKDIR /app
RUN chown -R appuser:appuser /app

# 必要なファイルをコンテナにコピー（非特権ユーザー権限でも操作可能にする）
COPY --chown=appuser:appuser requirements.txt /app/

# 必要な依存パッケージをインストール
RUN pip install --no-cache-dir -r requirements.txt

# プロジェクトファイルを全てコピー
COPY --chown=appuser:appuser . /app/

# 非特権ユーザーでコンテナを実行
USER appuser

# ポートを開放
EXPOSE 8000

# サーバーを起動
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
