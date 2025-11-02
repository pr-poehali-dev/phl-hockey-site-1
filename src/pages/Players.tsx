import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';

interface Player {
  id: number;
  nickname: string;
  jersey_number: number;
  position: string;
  team_name: string;
  team_logo?: string;
  goals: number;
  assists: number;
  games_played: number;
  division?: string;
}

const Players = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [division, setDivision] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlayers();
  }, [division]);

  const fetchPlayers = async () => {
    setLoading(true);
    try {
      const url = division === 'all' 
        ? 'https://functions.poehali.dev/1151614f-c3b6-49bd-881f-c84e995154ee'
        : `https://functions.poehali.dev/1151614f-c3b6-49bd-881f-c84e995154ee?division=${division}`;
      
      const response = await fetch(url);
      const data = await response.json();
      setPlayers(data);
    } catch (error) {
      console.error('Error fetching players:', error);
    }
    setLoading(false);
  };

  const getPositionIcon = (position: string) => {
    if (position.includes('Нападающий') || position.includes('Forward')) return 'Zap';
    if (position.includes('Защитник') || position.includes('Defense')) return 'Shield';
    if (position.includes('Вратарь') || position.includes('Goalie')) return 'Target';
    return 'User';
  };

  return (
    <div className="min-h-screen">
      <div 
        className="relative py-20 bg-gradient-to-br from-primary/20 via-background to-primary/10"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1515703407324-5f753afd8be8?w=1600&auto=format&fit=crop)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundBlendMode: 'overlay'
        }}
      >
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Icon name="Users" size={48} className="text-primary" />
            <h1 className="text-5xl md:text-6xl font-bold font-['Montserrat'] text-center">
              Статистика игроков
            </h1>
          </div>
          <p className="text-center text-xl text-muted-foreground max-w-2xl mx-auto">
            Лучшие снайперы и ассистенты дивизионов
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-3xl font-['Montserrat']">Лидеры по очкам</CardTitle>
              <Select value={division} onValueChange={setDivision}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Дивизион" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все дивизионы</SelectItem>
                  <SelectItem value="A">Дивизион А</SelectItem>
                  <SelectItem value="B">Дивизион Б</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <Icon name="Loader2" size={48} className="animate-spin mx-auto text-primary" />
                <p className="text-muted-foreground mt-4">Загрузка статистики...</p>
              </div>
            ) : players.length === 0 ? (
              <div className="text-center py-12">
                <Icon name="AlertCircle" size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Статистика игроков пока не доступна</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Игрок</TableHead>
                      <TableHead>Команда</TableHead>
                      <TableHead className="text-center">Позиция</TableHead>
                      <TableHead className="text-center">И</TableHead>
                      <TableHead className="text-center">Г</TableHead>
                      <TableHead className="text-center">П</TableHead>
                      <TableHead className="text-center">О</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {players.map((player, index) => (
                      <TableRow key={player.id}>
                        <TableCell className="font-bold">{index + 1}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Icon name={getPositionIcon(player.position)} size={20} className="text-primary" />
                            <div>
                              <div className="font-semibold">{player.nickname}</div>
                              <div className="text-sm text-muted-foreground">#{player.jersey_number}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {player.team_logo && (
                              <img src={player.team_logo} alt={player.team_name} className="w-6 h-6 object-contain" />
                            )}
                            <span>{player.team_name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">{player.position}</TableCell>
                        <TableCell className="text-center">{player.games_played}</TableCell>
                        <TableCell className="text-center font-bold text-primary">{player.goals}</TableCell>
                        <TableCell className="text-center font-bold text-secondary">{player.assists}</TableCell>
                        <TableCell className="text-center font-bold">{player.goals + player.assists}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Target" size={24} className="text-primary" />
                Лучшие снайперы
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {players
                  .sort((a, b) => b.goals - a.goals)
                  .slice(0, 5)
                  .map((player, index) => (
                    <div key={player.id} className="flex items-center gap-3 p-3 rounded-lg bg-primary/5">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold">{player.nickname}</div>
                        <div className="text-sm text-muted-foreground">{player.team_name}</div>
                      </div>
                      <div className="text-2xl font-bold text-primary">{player.goals}</div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="GitBranch" size={24} className="text-secondary" />
                Лучшие ассистенты
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {players
                  .sort((a, b) => b.assists - a.assists)
                  .slice(0, 5)
                  .map((player, index) => (
                    <div key={player.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/5">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary text-secondary-foreground font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold">{player.nickname}</div>
                        <div className="text-sm text-muted-foreground">{player.team_name}</div>
                      </div>
                      <div className="text-2xl font-bold text-secondary">{player.assists}</div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Players;
