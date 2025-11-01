-- Таблица для информации о лиге
CREATE TABLE league_info (
    id SERIAL PRIMARY KEY,
    league_name VARCHAR(100) NOT NULL DEFAULT 'PHL',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица для социальных сетей
CREATE TABLE social_links (
    id SERIAL PRIMARY KEY,
    platform VARCHAR(50) NOT NULL,
    url TEXT NOT NULL,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица для команд
CREATE TABLE teams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    division VARCHAR(10) NOT NULL CHECK (division IN ('ПХЛ', 'ВХЛ', 'ТХЛ')),
    games_played INT DEFAULT 0,
    wins INT DEFAULT 0,
    wins_ot INT DEFAULT 0,
    losses_ot INT DEFAULT 0,
    losses INT DEFAULT 0,
    goals_for INT DEFAULT 0,
    goals_against INT DEFAULT 0,
    points INT DEFAULT 0,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица для матчей
CREATE TABLE matches (
    id SERIAL PRIMARY KEY,
    match_date TIMESTAMP NOT NULL,
    home_team_id INT REFERENCES teams(id),
    away_team_id INT REFERENCES teams(id),
    home_score INT DEFAULT 0,
    away_score INT DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'Не начался' CHECK (status IN ('Не начался', 'Матч идет', 'Конец матча', 'Конец матча (ОТ)', 'Конец матча (Б)', 'Техническое поражение')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица для регламента
CREATE TABLE regulations (
    id SERIAL PRIMARY KEY,
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Вставляем начальные данные
INSERT INTO league_info (league_name, description) VALUES ('PHL', 'Первая хоккейная лига - информация скоро появится');
INSERT INTO regulations (content) VALUES ('Регламент лиги - скоро появится');

-- Создаем индексы для оптимизации запросов
CREATE INDEX idx_teams_division ON teams(division);
CREATE INDEX idx_teams_points ON teams(points DESC);
CREATE INDEX idx_matches_date ON matches(match_date);
CREATE INDEX idx_matches_status ON matches(status);