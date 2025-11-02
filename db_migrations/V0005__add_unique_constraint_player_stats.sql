-- Добавляем уникальное ограничение для избежания дублей статистики
ALTER TABLE player_stats ADD CONSTRAINT player_stats_player_division_unique UNIQUE (player_id, division);