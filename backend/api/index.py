'''
Business: API для хоккейного сайта - получение и управление данными о лиге, командах, матчах
Args: event - dict с httpMethod, body, queryStringParameters
Returns: HTTP response dict с данными или ошибкой
'''
import json
import os
import base64
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    database_url = os.environ.get('DATABASE_URL')
    return psycopg2.connect(database_url, cursor_factory=RealDictCursor)

def recalculate_team_stats(cur, conn):
    cur.execute('SELECT id FROM teams')
    teams = cur.fetchall()
    
    for team in teams:
        team_id = team['id']
        
        cur.execute('''
            SELECT 
                COUNT(*) as games,
                SUM(CASE 
                    WHEN (home_team_id = %s AND home_score > away_score AND status = 'Конец матча') OR
                         (away_team_id = %s AND away_score > home_score AND status = 'Конец матча')
                    THEN 1 ELSE 0 END) as wins,
                SUM(CASE 
                    WHEN (home_team_id = %s AND home_score > away_score AND status IN ('Конец матча (ОТ)', 'Конец матча (Б)')) OR
                         (away_team_id = %s AND away_score > home_score AND status IN ('Конец матча (ОТ)', 'Конец матча (Б)'))
                    THEN 1 ELSE 0 END) as wins_ot,
                SUM(CASE 
                    WHEN (home_team_id = %s AND home_score < away_score AND status IN ('Конец матча (ОТ)', 'Конец матча (Б)')) OR
                         (away_team_id = %s AND away_score < home_score AND status IN ('Конец матча (ОТ)', 'Конец матча (Б)'))
                    THEN 1 ELSE 0 END) as losses_ot,
                SUM(CASE 
                    WHEN (home_team_id = %s AND home_score < away_score AND status = 'Конец матча') OR
                         (away_team_id = %s AND away_score < home_score AND status = 'Конец матча')
                    THEN 1 ELSE 0 END) as losses,
                SUM(CASE WHEN home_team_id = %s THEN home_score WHEN away_team_id = %s THEN away_score ELSE 0 END) as goals_for,
                SUM(CASE WHEN home_team_id = %s THEN away_score WHEN away_team_id = %s THEN home_score ELSE 0 END) as goals_against
            FROM matches
            WHERE (home_team_id = %s OR away_team_id = %s) AND status IN ('Конец матча', 'Конец матча (ОТ)', 'Конец матча (Б)')
        ''', (team_id, team_id, team_id, team_id, team_id, team_id, team_id, team_id, 
              team_id, team_id, team_id, team_id, team_id, team_id))
        
        stats = cur.fetchone()
        games = stats['games'] or 0
        wins = stats['wins'] or 0
        wins_ot = stats['wins_ot'] or 0
        losses_ot = stats['losses_ot'] or 0
        losses = stats['losses'] or 0
        goals_for = stats['goals_for'] or 0
        goals_against = stats['goals_against'] or 0
        
        points = wins * 2 + wins_ot * 2 + losses_ot * 1
        
        cur.execute('''
            UPDATE teams SET 
                games_played = %s, wins = %s, wins_ot = %s, losses_ot = %s, 
                losses = %s, goals_for = %s, goals_against = %s, points = %s
            WHERE id = %s
        ''', (games, wins, wins_ot, losses_ot, losses, goals_for, goals_against, points, team_id))
    
    conn.commit()

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    path: str = event.get('queryStringParameters', {}).get('path', '')
    print(f'Request: {method} {path}')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        if method == 'GET':
            if path == 'league-info':
                cur.execute('SELECT * FROM league_info ORDER BY id DESC LIMIT 1')
                data = cur.fetchone()
                cur.execute('SELECT * FROM social_links ORDER BY sort_order')
                social_links = cur.fetchall()
                result = dict(data) if data else {'league_name': 'PHL', 'description': '', 'logo_url': None}
                result['social_links'] = [dict(row) for row in social_links]
                
            elif path == 'teams':
                division = event.get('queryStringParameters', {}).get('division')
                if division:
                    cur.execute('SELECT * FROM teams WHERE division = %s ORDER BY points DESC, goals_for - goals_against DESC', (division,))
                else:
                    cur.execute('SELECT * FROM teams ORDER BY division, points DESC')
                result = [dict(row) for row in cur.fetchall()]
                
            elif path == 'matches':
                cur.execute('''
                    SELECT m.*, 
                           ht.name as home_team_name, 
                           at.name as away_team_name
                    FROM matches m
                    LEFT JOIN teams ht ON m.home_team_id = ht.id
                    LEFT JOIN teams at ON m.away_team_id = at.id
                    ORDER BY m.match_date DESC
                ''')
                result = [dict(row) for row in cur.fetchall()]
                
            elif path == 'regulations':
                cur.execute('SELECT * FROM regulations ORDER BY id DESC LIMIT 1')
                data = cur.fetchone()
                result = dict(data) if data else {'content': 'Регламент скоро появится'}
                
            elif path == 'champions':
                cur.execute('SELECT * FROM champions ORDER BY season DESC')
                result = [dict(row) for row in cur.fetchall()]
                
            else:
                result = {'error': 'Unknown path'}
                
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            
            if path == 'league-info':
                cur.execute('UPDATE league_info SET league_name = %s, description = %s, logo_url = %s, updated_at = CURRENT_TIMESTAMP WHERE id = 1',
                           (body_data.get('league_name'), body_data.get('description'), body_data.get('logo_url')))
                conn.commit()
                result = {'success': True}
                
            elif path == 'upload-image':
                image_data = body_data.get('image')
                if image_data and image_data.startswith('data:image'):
                    result = {'success': True, 'url': image_data}
                else:
                    result = {'success': False, 'error': 'Invalid image data'}
                
            elif path == 'social-links':
                cur.execute('INSERT INTO social_links (platform, url, icon, sort_order) VALUES (%s, %s, %s, %s)',
                           (body_data.get('platform'), body_data.get('url'), body_data.get('icon', 'Link'), body_data.get('sort_order', 0)))
                conn.commit()
                result = {'success': True}
                
            elif path == 'teams':
                cur.execute('''INSERT INTO teams (name, division, games_played, wins, wins_ot, losses_ot, 
                               losses, goals_for, goals_against, points) 
                               VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)''',
                           (body_data.get('name'), body_data.get('division'), 
                            body_data.get('games_played', 0), body_data.get('wins', 0),
                            body_data.get('wins_ot', 0), body_data.get('losses_ot', 0),
                            body_data.get('losses', 0), body_data.get('goals_for', 0),
                            body_data.get('goals_against', 0), body_data.get('points', 0)))
                conn.commit()
                result = {'success': True}
                
            elif path == 'matches':
                cur.execute('''INSERT INTO matches (match_date, home_team_id, away_team_id, 
                               home_score, away_score, status) 
                               VALUES (%s, %s, %s, %s, %s, %s)''',
                           (body_data.get('match_date'), body_data.get('home_team_id'),
                            body_data.get('away_team_id'), body_data.get('home_score', 0),
                            body_data.get('away_score', 0), body_data.get('status', 'Не начался')))
                conn.commit()
                
                if body_data.get('status') in ['Конец матча', 'Конец матча (ОТ)', 'Конец матча (Б)']:
                    recalculate_team_stats(cur, conn)
                
                result = {'success': True}
                
            elif path == 'regulations':
                cur.execute('UPDATE regulations SET content = %s, updated_at = CURRENT_TIMESTAMP WHERE id = 1',
                           (body_data.get('content'),))
                conn.commit()
                result = {'success': True}
                
            elif path == 'champions':
                cur.execute('INSERT INTO champions (season, team_id, team_name, description) VALUES (%s, %s, %s, %s)',
                           (body_data.get('season'), body_data.get('team_id'), 
                            body_data.get('team_name'), body_data.get('description')))
                conn.commit()
                result = {'success': True}
                
            else:
                result = {'error': 'Unknown path'}
                
        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            item_id = body_data.get('id')
            
            if path == 'teams':
                cur.execute('''UPDATE teams SET name = %s, division = %s, games_played = %s, 
                               wins = %s, wins_ot = %s, losses_ot = %s, losses = %s, 
                               goals_for = %s, goals_against = %s, points = %s, logo_url = %s WHERE id = %s''',
                           (body_data.get('name'), body_data.get('division'),
                            body_data.get('games_played'), body_data.get('wins'),
                            body_data.get('wins_ot'), body_data.get('losses_ot'),
                            body_data.get('losses'), body_data.get('goals_for'),
                            body_data.get('goals_against'), body_data.get('points'), 
                            body_data.get('logo_url'), item_id))
                conn.commit()
                result = {'success': True}
                
            elif path == 'matches':
                cur.execute('''UPDATE matches SET match_date = %s, home_team_id = %s, 
                               away_team_id = %s, home_score = %s, away_score = %s, status = %s 
                               WHERE id = %s''',
                           (body_data.get('match_date'), body_data.get('home_team_id'),
                            body_data.get('away_team_id'), body_data.get('home_score'),
                            body_data.get('away_score'), body_data.get('status'), item_id))
                conn.commit()
                
                if body_data.get('status') in ['Конец матча', 'Конец матча (ОТ)', 'Конец матча (Б)']:
                    recalculate_team_stats(cur, conn)
                
                result = {'success': True}
                
            else:
                result = {'error': 'Unknown path'}
                
        elif method == 'DELETE':
            item_id = event.get('queryStringParameters', {}).get('id')
            
            if path == 'teams':
                cur.execute('DELETE FROM teams WHERE id = %s', (item_id,))
                conn.commit()
                result = {'success': True}
                
            elif path == 'matches':
                cur.execute('DELETE FROM matches WHERE id = %s', (item_id,))
                conn.commit()
                result = {'success': True}
                
            elif path == 'social-links':
                cur.execute('DELETE FROM social_links WHERE id = %s', (item_id,))
                conn.commit()
                result = {'success': True}
                
            elif path == 'champions':
                cur.execute('DELETE FROM champions WHERE id = %s', (item_id,))
                conn.commit()
                result = {'success': True}
                
            else:
                result = {'error': 'Unknown path'}
        else:
            result = {'error': 'Method not allowed'}
            
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps(result, ensure_ascii=False, default=str)
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({'error': str(e)}, ensure_ascii=False)
        }