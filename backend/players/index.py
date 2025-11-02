'''
Business: Управление игроками и их статистикой
Args: event - dict с httpMethod, queryStringParameters, body
Returns: HTTP response dict
'''
import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    dsn = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(dsn)
    cur = conn.cursor()
    
    if method == 'GET':
        params = event.get('queryStringParameters') or {}
        division = params.get('division')
        
        if division:
            query = '''
                SELECT 
                    p.id, p.nickname, p.jersey_number, p.position,
                    t.name as team_name, t.logo_url,
                    ps.goals, ps.assists, ps.games_played, ps.division
                FROM players p
                JOIN teams t ON p.team_id = t.id
                LEFT JOIN player_stats ps ON p.id = ps.player_id AND ps.division = %s
                WHERE ps.division = %s OR ps.division IS NULL
                ORDER BY ps.goals DESC NULLS LAST, ps.assists DESC NULLS LAST
            '''
            cur.execute(query, (division, division))
        else:
            query = '''
                SELECT 
                    p.id, p.nickname, p.jersey_number, p.position,
                    t.name as team_name, t.logo_url,
                    COALESCE(SUM(ps.goals), 0) as goals,
                    COALESCE(SUM(ps.assists), 0) as assists,
                    COALESCE(SUM(ps.games_played), 0) as games_played
                FROM players p
                JOIN teams t ON p.team_id = t.id
                LEFT JOIN player_stats ps ON p.id = ps.player_id
                GROUP BY p.id, p.nickname, p.jersey_number, p.position, t.name, t.logo_url
                ORDER BY goals DESC, assists DESC
            '''
            cur.execute(query)
        
        rows = cur.fetchall()
        
        if division:
            players = [
                {
                    'id': row[0],
                    'nickname': row[1],
                    'jersey_number': row[2],
                    'position': row[3],
                    'team_name': row[4],
                    'team_logo': row[5],
                    'goals': row[6] or 0,
                    'assists': row[7] or 0,
                    'games_played': row[8] or 0,
                    'division': row[9]
                }
                for row in rows
            ]
        else:
            players = [
                {
                    'id': row[0],
                    'nickname': row[1],
                    'jersey_number': row[2],
                    'position': row[3],
                    'team_name': row[4],
                    'team_logo': row[5],
                    'goals': row[6],
                    'assists': row[7],
                    'games_played': row[8]
                }
                for row in rows
            ]
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps(players)
        }
    
    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        
        team_id = body_data.get('team_id')
        nickname = body_data.get('nickname')
        jersey_number = body_data.get('jersey_number')
        position = body_data.get('position')
        
        if not all([team_id, nickname, jersey_number, position]):
            cur.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Missing required fields'})
            }
        
        cur.execute(
            'INSERT INTO players (team_id, nickname, jersey_number, position) VALUES (%s, %s, %s, %s) RETURNING id',
            (team_id, nickname, jersey_number, position)
        )
        player_id = cur.fetchone()[0]
        conn.commit()
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 201,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'id': player_id, 'message': 'Player created'})
        }
    
    if method == 'PUT':
        body_data = json.loads(event.get('body', '{}'))
        
        player_id = body_data.get('player_id')
        division = body_data.get('division')
        goals = body_data.get('goals', 0)
        assists = body_data.get('assists', 0)
        games_played = body_data.get('games_played', 0)
        
        if not player_id or not division:
            cur.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'player_id and division required'})
            }
        
        cur.execute(
            '''
            INSERT INTO player_stats (player_id, division, goals, assists, games_played)
            VALUES (%s, %s, %s, %s, %s)
            ON CONFLICT (player_id, division) 
            DO UPDATE SET goals = %s, assists = %s, games_played = %s, updated_at = CURRENT_TIMESTAMP
            ''',
            (player_id, division, goals, assists, games_played, goals, assists, games_played)
        )
        conn.commit()
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'success': True, 'message': 'Stats updated'})
        }
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'})
    }
