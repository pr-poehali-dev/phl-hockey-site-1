import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const API_URL = 'https://functions.poehali.dev/6ba303f7-5999-4705-a914-9eea15983942';

interface Team {
  id: number;
  name: string;
  division: string;
  games_played: number;
  wins: number;
  wins_ot: number;
  losses_ot: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  points: number;
  logo_url?: string;
}

interface Match {
  id: number;
  match_date: string;
  home_team_name: string;
  away_team_name: string;
  home_score: number;
  away_score: number;
  status: string;
}

interface LeagueInfo {
  league_name: string;
  description: string;
  social_links: Array<{ id: number; platform: string; url: string; icon: string }>;
}

interface Champion {
  id: number;
  season: string;
  team_name: string;
  description?: string;
}

const Index = () => {
  const [leagueInfo, setLeagueInfo] = useState<LeagueInfo | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [champions, setChampions] = useState<Champion[]>([]);
  const [regulations, setRegulations] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [infoRes, teamsRes, matchesRes, championsRes, regulationsRes] = await Promise.all([
        fetch(`${API_URL}?path=league-info`),
        fetch(`${API_URL}?path=teams`),
        fetch(`${API_URL}?path=matches`),
        fetch(`${API_URL}?path=champions`),
        fetch(`${API_URL}?path=regulations`)
      ]);

      const infoData = await infoRes.json();
      const teamsData = await teamsRes.json();
      const matchesData = await matchesRes.json();
      const championsData = await championsRes.json();
      const regulationsData = await regulationsRes.json();

      setLeagueInfo(infoData);
      setTeams(teamsData);
      setMatches(matchesData);
      setChampions(championsData);
      setRegulations(regulationsData.content || 'Регламент скоро появится');
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      'Не начался': 'secondary',
      'Матч идет': 'default',
      'Конец матча': 'outline',
      'Конец матча (ОТ)': 'outline',
      'Конец матча (Б)': 'outline',
      'Техническое поражение': 'destructive'
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  const getDivisionTeams = (division: string) => {
    return teams.filter(t => t.division === division).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      return (b.goals_for - b.goals_against) - (a.goals_for - a.goals_against);
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-12 text-center animate-fade-in">
        <h1 className="text-5xl font-bold mb-4 font-['Montserrat']">
          {leagueInfo?.league_name || 'PHL'}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {leagueInfo?.description || 'Первая хоккейная лига - информация скоро появится'}
        </p>
        
        {leagueInfo?.social_links && leagueInfo.social_links.length > 0 && (
          <div className="flex justify-center gap-4 mt-6">
            {leagueInfo.social_links.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-80 transition-opacity"
              >
                <Icon name={link.icon || 'Link'} size={18} />
                {link.platform}
              </a>
            ))}
          </div>
        )}
      </div>

      <Tabs defaultValue="tables" className="mb-12">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="tables">Таблицы дивизионов</TabsTrigger>
          <TabsTrigger value="schedule">Расписание</TabsTrigger>
          <TabsTrigger value="champions">Чемпионы</TabsTrigger>
          <TabsTrigger value="regulations">Регламент</TabsTrigger>
        </TabsList>

        <TabsContent value="tables" className="space-y-6">
          {['ПХЛ', 'ВХЛ', 'ТХЛ'].map((division) => (
            <Card key={division} className="animate-scale-in">
              <CardHeader>
                <CardTitle className="text-2xl font-['Montserrat']">{division}</CardTitle>
              </CardHeader>
              <CardContent>
                {getDivisionTeams(division).length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">#</TableHead>
                          <TableHead>Команда</TableHead>
                          <TableHead className="text-center">И</TableHead>
                          <TableHead className="text-center">В</TableHead>
                          <TableHead className="text-center">ВО</TableHead>
                          <TableHead className="text-center">ПО</TableHead>
                          <TableHead className="text-center">П</TableHead>
                          <TableHead className="text-center">Ш</TableHead>
                          <TableHead className="text-center">Пр</TableHead>
                          <TableHead className="text-center font-bold">О</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getDivisionTeams(division).map((team, index) => (
                          <TableRow key={team.id} className="hover:bg-muted/50">
                            <TableCell className="font-medium">{index + 1}</TableCell>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                {team.logo_url && (
                                  <img src={team.logo_url} alt={team.name} className="w-6 h-6 object-contain" />
                                )}
                                {team.name}
                              </div>
                            </TableCell>
                            <TableCell className="text-center">{team.games_played}</TableCell>
                            <TableCell className="text-center">{team.wins}</TableCell>
                            <TableCell className="text-center">{team.wins_ot}</TableCell>
                            <TableCell className="text-center">{team.losses_ot}</TableCell>
                            <TableCell className="text-center">{team.losses}</TableCell>
                            <TableCell className="text-center">{team.goals_for}</TableCell>
                            <TableCell className="text-center">{team.goals_against}</TableCell>
                            <TableCell className="text-center font-bold text-primary">{team.points}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">Команды скоро появятся</p>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="schedule">
          <Card className="animate-scale-in">
            <CardHeader>
              <CardTitle className="text-2xl font-['Montserrat']">Расписание матчей</CardTitle>
            </CardHeader>
            <CardContent>
              {matches.length > 0 ? (
                <div className="space-y-4">
                  {matches.map((match) => (
                    <div
                      key={match.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-sm text-muted-foreground min-w-[140px]">
                          {new Date(match.match_date).toLocaleString('ru-RU', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                        <div className="flex items-center gap-6">
                          <span className="font-medium min-w-[120px] text-right">{match.home_team_name}</span>
                          <div className="flex items-center gap-2 min-w-[60px] justify-center">
                            {match.status !== 'Не начался' ? (
                              <span className="text-xl font-bold">{match.home_score} : {match.away_score}</span>
                            ) : (
                              <span className="text-muted-foreground">vs</span>
                            )}
                          </div>
                          <span className="font-medium min-w-[120px]">{match.away_team_name}</span>
                        </div>
                      </div>
                      <div>{getStatusBadge(match.status)}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">Матчи скоро появятся</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="champions">
          <Card className="animate-scale-in">
            <CardHeader>
              <CardTitle className="text-2xl font-['Montserrat']">Чемпионы лиги</CardTitle>
            </CardHeader>
            <CardContent>
              {champions.length > 0 ? (
                <div className="space-y-4">
                  {champions.map((champion) => (
                    <div key={champion.id} className="p-6 border rounded-lg bg-gradient-to-r from-primary/10 to-transparent">
                      <div className="flex items-center gap-4 mb-2">
                        <Icon name="Trophy" size={32} className="text-primary" />
                        <div>
                          <h3 className="text-2xl font-bold font-['Montserrat']">{champion.season}</h3>
                          <p className="text-xl font-semibold text-primary">{champion.team_name}</p>
                        </div>
                      </div>
                      {champion.description && (
                        <p className="text-muted-foreground ml-12 mt-2">{champion.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">Чемпионы скоро появятся</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="regulations">
          <Card className="animate-scale-in">
            <CardHeader>
              <CardTitle className="text-2xl font-['Montserrat']">Регламент лиги</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <p className="whitespace-pre-wrap">{regulations}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Index;