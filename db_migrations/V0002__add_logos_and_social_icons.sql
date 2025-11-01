-- Добавляем поля для логотипов
ALTER TABLE league_info ADD COLUMN logo_url TEXT;
ALTER TABLE teams ADD COLUMN logo_url TEXT;

-- Добавляем иконки для социальных сетей
ALTER TABLE social_links ADD COLUMN icon VARCHAR(50) DEFAULT 'Link';