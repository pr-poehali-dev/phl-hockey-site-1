import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const API_URL = 'https://functions.poehali.dev/6ba303f7-5999-4705-a914-9eea15983942';
const ADMIN_PASSWORD = 'dyezphl';

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
  home_team_id: number;
  away_team_id: number;
  home_team_name?: string;
  away_team_name?: string;
  home_score: number;
  away_score: number;
  status: string;
}

interface Champion {
  id: number;
  season: string;
  team_id: number;
  team_name: string;
  description?: string;
}

const AdminPanel = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [champions, setChampions] = useState<Champion[]>([]);
  const [leagueInfo, setLeagueInfo] = useState<any>({ league_name: 'PHL', description: '', logo_url: null, social_links: [] });
  const [regulations, setRegulations] = useState('');
  const { toast } = useToast();

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem('admin_auth', 'true');
      fetchData();
    } else {
      toast({ title: 'Ошибка', description: 'Неверный пароль', variant: 'destructive' });
    }
  };

  useEffect(() => {
    if (sessionStorage.getItem('admin_auth') === 'true') {
      setIsAuthenticated(true);
      fetchData();
    }
  }, []);

  const fetchData = async () => {
    try {
      const [teamsRes, matchesRes, championsRes, infoRes, regulationsRes] = await Promise.all([
        fetch(`${API_URL}?path=teams`),
        fetch(`${API_URL}?path=matches`),
        fetch(`${API_URL}?path=champions`),
        fetch(`${API_URL}?path=league-info`),
        fetch(`${API_URL}?path=regulations`)
      ]);

      setTeams(await teamsRes.json());
      setMatches(await matchesRes.json());
      setChampions(await championsRes.json());
      setLeagueInfo(await infoRes.json());
      const regData = await regulationsRes.json();
      setRegulations(regData.content || '');
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const saveLeagueInfo = async () => {
    try {
      await fetch(`${API_URL}?path=league-info`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leagueInfo)
      });
      toast({ title: 'Успешно', description: 'Информация о лиге обновлена' });
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось обновить', variant: 'destructive' });
    }
  };

  const saveRegulations = async () => {
    try {
      await fetch(`${API_URL}?path=regulations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: regulations })
      });
      toast({ title: 'Успешно', description: 'Регламент обновлен' });
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось обновить', variant: 'destructive' });
    }
  };

  const addTeam = async (teamData: Partial<Team>) => {
    try {
      await fetch(`${API_URL}?path=teams`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teamData)
      });
      toast({ title: 'Успешно', description: 'Команда добавлена' });
      fetchData();
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось добавить', variant: 'destructive' });
    }
  };

  const updateTeam = async (teamData: Team) => {
    try {
      await fetch(`${API_URL}?path=teams`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teamData)
      });
      toast({ title: 'Успешно', description: 'Команда обновлена' });
      fetchData();
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось обновить', variant: 'destructive' });
    }
  };

  const deleteTeam = async (id: number) => {
    try {
      await fetch(`${API_URL}?path=teams&id=${id}`, { method: 'DELETE' });
      toast({ title: 'Успешно', description: 'Команда удалена' });
      fetchData();
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось удалить', variant: 'destructive' });
    }
  };

  const addMatch = async (matchData: Partial<Match>) => {
    try {
      await fetch(`${API_URL}?path=matches`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(matchData)
      });
      toast({ title: 'Успешно', description: 'Матч добавлен' });
      fetchData();
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось добавить', variant: 'destructive' });
    }
  };

  const updateMatch = async (matchData: Match) => {
    try {
      await fetch(`${API_URL}?path=matches`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(matchData)
      });
      toast({ title: 'Успешно', description: 'Матч обновлен' });
      fetchData();
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось обновить', variant: 'destructive' });
    }
  };

  const deleteMatch = async (id: number) => {
    try {
      await fetch(`${API_URL}?path=matches&id=${id}`, { method: 'DELETE' });
      toast({ title: 'Успешно', description: 'Матч удален' });
      fetchData();
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось удалить', variant: 'destructive' });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center font-['Montserrat']">Вход в админ-панель</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Пароль</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
            <Button onClick={handleLogin} className="w-full">
              <Icon name="LogIn" size={18} className="mr-2" />
              Войти
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold font-['Montserrat']">Админ-панель</h1>
        <Button
          variant="outline"
          onClick={() => {
            setIsAuthenticated(false);
            sessionStorage.removeItem('admin_auth');
          }}
        >
          <Icon name="LogOut" size={18} className="mr-2" />
          Выйти
        </Button>
      </div>

      <Tabs defaultValue="league" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="league">О лиге</TabsTrigger>
          <TabsTrigger value="teams">Команды</TabsTrigger>
          <TabsTrigger value="matches">Матчи</TabsTrigger>
          <TabsTrigger value="champions">Чемпионы</TabsTrigger>
          <TabsTrigger value="regulations">Регламент</TabsTrigger>
        </TabsList>

        <TabsContent value="league">
          <Card>
            <CardHeader>
              <CardTitle>Информация о лиге</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Название лиги</Label>
                <Input
                  value={leagueInfo.league_name}
                  onChange={(e) => setLeagueInfo({ ...leagueInfo, league_name: e.target.value })}
                />
              </div>
              <div>
                <Label>Описание</Label>
                <Textarea
                  value={leagueInfo.description}
                  onChange={(e) => setLeagueInfo({ ...leagueInfo, description: e.target.value })}
                  rows={4}
                />
              </div>
              <div>
                <Label>Логотип лиги</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setLeagueInfo({ ...leagueInfo, logo_url: reader.result as string });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                {leagueInfo.logo_url && (
                  <img src={leagueInfo.logo_url} alt="Logo" className="mt-2 w-20 h-20 object-contain" />
                )}
              </div>
              <div>
                <Label>Социальные сети</Label>
                <SocialLinksManager 
                  socialLinks={leagueInfo.social_links || []} 
                  onUpdate={(links) => setLeagueInfo({ ...leagueInfo, social_links: links })}
                />
              </div>
              <Button onClick={saveLeagueInfo}>
                <Icon name="Save" size={18} className="mr-2" />
                Сохранить
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="teams">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Управление командами</CardTitle>
                <TeamDialog onSave={addTeam} />
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Команда</TableHead>
                    <TableHead>Дивизион</TableHead>
                    <TableHead className="text-center">И</TableHead>
                    <TableHead className="text-center">В</TableHead>
                    <TableHead className="text-center">ВО</TableHead>
                    <TableHead className="text-center">ПО</TableHead>
                    <TableHead className="text-center">П</TableHead>
                    <TableHead className="text-center">Ш</TableHead>
                    <TableHead className="text-center">Пр</TableHead>
                    <TableHead className="text-center">О</TableHead>
                    <TableHead>Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teams.map((team) => (
                    <TableRow key={team.id}>
                      <TableCell>{team.name}</TableCell>
                      <TableCell>{team.division}</TableCell>
                      <TableCell className="text-center">{team.games_played}</TableCell>
                      <TableCell className="text-center">{team.wins}</TableCell>
                      <TableCell className="text-center">{team.wins_ot}</TableCell>
                      <TableCell className="text-center">{team.losses_ot}</TableCell>
                      <TableCell className="text-center">{team.losses}</TableCell>
                      <TableCell className="text-center">{team.goals_for}</TableCell>
                      <TableCell className="text-center">{team.goals_against}</TableCell>
                      <TableCell className="text-center">{team.points}</TableCell>
                      <TableCell className="flex gap-2">
                        <TeamDialog team={team} onSave={updateTeam} />
                        <Button size="sm" variant="destructive" onClick={() => deleteTeam(team.id)}>
                          <Icon name="Trash2" size={16} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="matches">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Управление матчами</CardTitle>
                <MatchDialog teams={teams} onSave={addMatch} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {matches.map((match) => (
                  <div key={match.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex gap-4 items-center">
                      <span className="text-sm text-muted-foreground">
                        {new Date(match.match_date).toLocaleString('ru-RU')}
                      </span>
                      <span>{match.home_team_name} {match.home_score} : {match.away_score} {match.away_team_name}</span>
                      <span className="text-sm text-muted-foreground">{match.status}</span>
                    </div>
                    <div className="flex gap-2">
                      <MatchDialog teams={teams} match={match} onSave={updateMatch} />
                      <Button size="sm" variant="destructive" onClick={() => deleteMatch(match.id)}>
                        <Icon name="Trash2" size={16} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="champions">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Чемпионы лиги</CardTitle>
              <ChampionDialog teams={teams} onSave={async (data) => {
                try {
                  await fetch(`${API_URL}?path=champions`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                  });
                  toast({ title: 'Успешно', description: 'Чемпион добавлен' });
                  fetchData();
                } catch (error) {
                  toast({ title: 'Ошибка', variant: 'destructive' });
                }
              }} />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {champions.map((champion) => (
                  <div key={champion.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-semibold">{champion.season} - {champion.team_name}</div>
                      {champion.description && <div className="text-sm text-muted-foreground">{champion.description}</div>}
                    </div>
                    <Button size="sm" variant="destructive" onClick={async () => {
                      try {
                        await fetch(`${API_URL}?path=champions&id=${champion.id}`, { method: 'DELETE' });
                        toast({ title: 'Успешно', description: 'Чемпион удален' });
                        fetchData();
                      } catch (error) {
                        toast({ title: 'Ошибка', variant: 'destructive' });
                      }
                    }}>
                      <Icon name="Trash2" size={16} />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="regulations">
          <Card>
            <CardHeader>
              <CardTitle>Регламент лиги</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={regulations}
                onChange={(e) => setRegulations(e.target.value)}
                rows={15}
                placeholder="Введите текст регламента..."
              />
              <Button onClick={saveRegulations}>
                <Icon name="Save" size={18} className="mr-2" />
                Сохранить
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const SocialLinksManager = ({ socialLinks, onUpdate }: { socialLinks: any[]; onUpdate: (links: any[]) => void }) => {
  const [links, setLinks] = useState(socialLinks);
  const [newLink, setNewLink] = useState({ platform: '', url: '', icon: 'Link' });
  const { toast } = useToast();

  const addLink = async () => {
    if (!newLink.platform || !newLink.url) {
      toast({ title: 'Ошибка', description: 'Заполните все поля', variant: 'destructive' });
      return;
    }
    try {
      await fetch(`${API_URL}?path=social-links`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLink)
      });
      const updatedLinks = [...links, newLink];
      setLinks(updatedLinks);
      onUpdate(updatedLinks);
      setNewLink({ platform: '', url: '', icon: 'Link' });
      toast({ title: 'Успешно', description: 'Ссылка добавлена' });
    } catch (error) {
      toast({ title: 'Ошибка', variant: 'destructive' });
    }
  };

  const deleteLink = async (id: number) => {
    try {
      await fetch(`${API_URL}?path=social-links&id=${id}`, { method: 'DELETE' });
      const updatedLinks = links.filter(l => l.id !== id);
      setLinks(updatedLinks);
      onUpdate(updatedLinks);
      toast({ title: 'Успешно', description: 'Ссылка удалена' });
    } catch (error) {
      toast({ title: 'Ошибка', variant: 'destructive' });
    }
  };

  const iconOptions = [
    { value: 'MessageCircle', label: 'Telegram' },
    { value: 'Send', label: 'Discord' },
    { value: 'Twitch', label: 'Twitch' },
    { value: 'Youtube', label: 'YouTube' },
    { value: 'Facebook', label: 'Facebook' },
    { value: 'Instagram', label: 'Instagram' },
    { value: 'Twitter', label: 'Twitter' },
    { value: 'Link', label: 'Другое' }
  ];

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {links.map((link) => (
          <div key={link.id} className="flex items-center gap-2 p-2 border rounded">
            <Icon name={link.icon || 'Link'} size={18} />
            <span className="flex-1">{link.platform}: {link.url}</span>
            <Button size="sm" variant="destructive" onClick={() => deleteLink(link.id)}>
              <Icon name="Trash2" size={16} />
            </Button>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Input
          placeholder="Название"
          value={newLink.platform}
          onChange={(e) => setNewLink({ ...newLink, platform: e.target.value })}
        />
        <Input
          placeholder="URL"
          value={newLink.url}
          onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
        />
        <Select value={newLink.icon} onValueChange={(val) => setNewLink({ ...newLink, icon: val })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {iconOptions.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button onClick={addLink} size="sm">
        <Icon name="Plus" size={16} className="mr-2" />
        Добавить ссылку
      </Button>
    </div>
  );
};

const TeamDialog = ({ team, onSave }: { team?: Team; onSave: (data: any) => void }) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '', division: 'ПХЛ', games_played: 0, wins: 0, wins_ot: 0,
    losses_ot: 0, losses: 0, goals_for: 0, goals_against: 0, points: 0, logo_url: ''
  });

  useEffect(() => {
    if (team && open) {
      setFormData(team);
    } else if (!team && open) {
      setFormData({
        name: '', division: 'ПХЛ', games_played: 0, wins: 0, wins_ot: 0,
        losses_ot: 0, losses: 0, goals_for: 0, goals_against: 0, points: 0, logo_url: ''
      });
    }
  }, [team, open]);

  const handleSave = () => {
    onSave(formData);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {team ? (
          <Button size="sm" variant="outline"><Icon name="Pencil" size={16} /></Button>
        ) : (
          <Button><Icon name="Plus" size={18} className="mr-2" />Добавить команду</Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{team ? 'Редактировать команду' : 'Добавить команду'}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Название</Label>
            <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          </div>
          <div>
            <Label>Дивизион</Label>
            <Select value={formData.division} onValueChange={(val) => setFormData({ ...formData, division: val })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ПХЛ">ПХЛ</SelectItem>
                <SelectItem value="ВХЛ">ВХЛ</SelectItem>
                <SelectItem value="ТХЛ">ТХЛ</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {['games_played', 'wins', 'wins_ot', 'losses_ot', 'losses', 'goals_for', 'goals_against', 'points'].map((field) => (
            <div key={field}>
              <Label>{field === 'games_played' ? 'И' : field === 'wins' ? 'В' : field === 'wins_ot' ? 'ВО' : field === 'losses_ot' ? 'ПО' : field === 'losses' ? 'П' : field === 'goals_for' ? 'Ш' : field === 'goals_against' ? 'Пр' : 'О'}</Label>
              <Input type="number" value={formData[field as keyof typeof formData]} onChange={(e) => setFormData({ ...formData, [field]: parseInt(e.target.value) || 0 })} />
            </div>
          ))}
          <div className="col-span-2">
            <Label>Логотип команды</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setFormData({ ...formData, logo_url: reader.result as string });
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />
            {formData.logo_url && (
              <img src={formData.logo_url} alt="Logo" className="mt-2 w-16 h-16 object-contain" />
            )}
          </div>
        </div>
        <Button onClick={handleSave} className="w-full">Сохранить</Button>
      </DialogContent>
    </Dialog>
  );
};

const ChampionDialog = ({ teams, onSave }: { teams: Team[]; onSave: (data: any) => void }) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    season: '',
    team_id: teams.length > 0 ? teams[0].id : 0,
    team_name: teams.length > 0 ? teams[0].name : '',
    description: ''
  });

  const handleSave = () => {
    if (!formData.season || !formData.team_name) {
      return;
    }
    onSave(formData);
    setOpen(false);
    setFormData({ season: '', team_id: 0, team_name: '', description: '' });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Icon name="Plus" size={18} className="mr-2" />Добавить чемпиона</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Добавить чемпиона</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Сезон</Label>
            <Input placeholder="2024-2025" value={formData.season} onChange={(e) => setFormData({ ...formData, season: e.target.value })} />
          </div>
          <div>
            <Label>Команда</Label>
            <Select 
              value={String(formData.team_id)} 
              onValueChange={(val) => {
                const team = teams.find(t => t.id === parseInt(val));
                setFormData({ ...formData, team_id: parseInt(val), team_name: team?.name || '' });
              }}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {teams.map(t => <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Описание</Label>
            <Textarea 
              placeholder="Краткое описание сезона..." 
              value={formData.description} 
              onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
            />
          </div>
        </div>
        <Button onClick={handleSave} className="w-full">Сохранить</Button>
      </DialogContent>
    </Dialog>
  );
};

const MatchDialog = ({ teams, match, onSave }: { teams: Team[]; match?: Match; onSave: (data: any) => void }) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    match_date: new Date().toISOString().slice(0, 16),
    home_team_id: teams.length > 0 ? teams[0].id : 0, 
    away_team_id: teams.length > 1 ? teams[1].id : 0, 
    home_score: 0, 
    away_score: 0, 
    status: 'Не начался'
  });

  useEffect(() => {
    if (match && open) {
      setFormData({
        ...match,
        match_date: match.match_date.slice(0, 16)
      });
    } else if (!match && open) {
      setFormData({
        match_date: new Date().toISOString().slice(0, 16),
        home_team_id: teams.length > 0 ? teams[0].id : 0,
        away_team_id: teams.length > 1 ? teams[1].id : 0,
        home_score: 0,
        away_score: 0,
        status: 'Не начался'
      });
    }
  }, [match, open, teams]);

  const handleSave = () => {
    if (!formData.home_team_id || !formData.away_team_id) {
      return;
    }
    onSave(formData);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {match ? (
          <Button size="sm" variant="outline"><Icon name="Pencil" size={16} /></Button>
        ) : (
          <Button><Icon name="Plus" size={18} className="mr-2" />Добавить матч</Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{match ? 'Редактировать матч' : 'Добавить матч'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Дата и время</Label>
            <Input type="datetime-local" value={formData.match_date.slice(0, 16)} onChange={(e) => setFormData({ ...formData, match_date: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Команда хозяев</Label>
              <Select value={String(formData.home_team_id)} onValueChange={(val) => setFormData({ ...formData, home_team_id: parseInt(val) })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {teams.map(t => <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Команда гостей</Label>
              <Select value={String(formData.away_team_id)} onValueChange={(val) => setFormData({ ...formData, away_team_id: parseInt(val) })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {teams.map(t => <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Счет хозяев</Label>
              <Input type="number" value={formData.home_score} onChange={(e) => setFormData({ ...formData, home_score: parseInt(e.target.value) || 0 })} />
            </div>
            <div>
              <Label>Счет гостей</Label>
              <Input type="number" value={formData.away_score} onChange={(e) => setFormData({ ...formData, away_score: parseInt(e.target.value) || 0 })} />
            </div>
          </div>
          <div>
            <Label>Статус</Label>
            <Select value={formData.status} onValueChange={(val) => setFormData({ ...formData, status: val })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Не начался">Не начался</SelectItem>
                <SelectItem value="Матч идет">Матч идет</SelectItem>
                <SelectItem value="Конец матча">Конец матча</SelectItem>
                <SelectItem value="Конец матча (ОТ)">Конец матча (ОТ)</SelectItem>
                <SelectItem value="Конец матча (Б)">Конец матча (Б)</SelectItem>
                <SelectItem value="Техническое поражение">Техническое поражение</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button onClick={handleSave} className="w-full">Сохранить</Button>
      </DialogContent>
    </Dialog>
  );
};

export default AdminPanel;