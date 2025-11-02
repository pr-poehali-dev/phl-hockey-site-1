CREATE TABLE IF NOT EXISTS champions (
    id SERIAL PRIMARY KEY,
    season VARCHAR(20) NOT NULL,
    team_id INTEGER,
    team_name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_champions_season ON champions(season DESC);