import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, MapPin, MessageSquare, Users, Heart, Building, Phone, Navigation, AlertCircle, Eye, Shield, Loader2, Trash2, Edit } from "lucide-react";
import { MasterAdminLoginRequest, MasterAdminLoginResponse, MasterAdminResponse, EventWithStats, DeleteEventResponse, UpdateEventRequest, UpdateEventResponse } from "@shared/api";
import confetti from 'canvas-confetti';

export default function MasterAdmin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [eventsData, setEventsData] = useState<MasterAdminResponse | null>(null);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [deletingEventId, setDeletingEventId] = useState<number | null>(null);
  const [editingEvent, setEditingEvent] = useState<EventWithStats | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    date: "",
    time: "",
    location: "",
    full_address: "",
    phone: "",
    maps_link: "",
    message: ""
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchEventsData();
    }
  }, [isAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");

    try {
      const loginData: MasterAdminLoginRequest = { password };
      const response = await fetch('/api/master-admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });
      
      const result: MasterAdminLoginResponse = await response.json();
      
      if (result.success) {
        setIsAuthenticated(true);
        setPassword("");

        // 🎉 Confete para o admin master!
        setTimeout(() => {
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.6 },
            colors: ['#E91E63', '#9C27B0', '#3F51B5', '#2196F3', '#FF5722']
          });
        }, 400);
      } else {
        setLoginError(result.error || 'Erro ao fazer login');
      }
    } catch (error) {
      console.error('Error during login:', error);
      setLoginError('Erro de conexão. Tente novamente.');
    } finally {
      setLoginLoading(false);
    }
  };

  const fetchEventsData = async () => {
    setEventsLoading(true);
    try {
      const response = await fetch('/api/master-admin/events');
      const data: MasterAdminResponse = await response.json();
      setEventsData(data);
    } catch (error) {
      console.error('Error fetching events:', error);
      setEventsData({
        success: false,
        error: 'Erro ao carregar eventos'
      });
    } finally {
      setEventsLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId: number, eventTitle: string) => {
    const confirmed = window.confirm(
      `Tem certeza que deseja excluir o momento "${eventTitle}"?\n\nEsta ação não pode ser desfeita e todas as confirmações também serão removidas.`
    );

    if (!confirmed) return;

    setDeletingEventId(eventId);
    try {
      const response = await fetch(`/api/master-admin/events/${eventId}`, {
        method: 'DELETE',
      });

      const result: DeleteEventResponse = await response.json();

      if (result.success) {
        // Atualizar lista removendo o evento excluído
        if (eventsData?.events) {
          setEventsData({
            ...eventsData,
            events: eventsData.events.filter(event => event.id !== eventId),
            total_events: (eventsData.total_events || 1) - 1
          });
        }
      } else {
        alert(`Erro ao excluir: ${result.error}`);
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Erro de conexão ao excluir o evento.');
    } finally {
      setDeletingEventId(null);
    }
  };

  const handleEditEvent = (event: EventWithStats) => {
    setEditingEvent(event);

    // Preencher formulário com dados do evento (usando timezone de São Paulo)
    const eventDate = new Date(event.date_time);
    const saoPauloDate = new Date(eventDate.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
    const date = saoPauloDate.toISOString().split('T')[0];
    const time = saoPauloDate.toTimeString().split(' ')[0].slice(0, 5);

    setEditForm({
      title: event.title,
      date: date,
      time: time,
      location: event.location,
      full_address: event.full_address || "",
      phone: event.phone || "",
      maps_link: event.maps_link || "",
      message: event.message || ""
    });

    setEditOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;

    setEditLoading(true);

    try {
      const updateData: UpdateEventRequest = {
        title: editForm.title,
        date_time: `${editForm.date}T${editForm.time}`,
        location: editForm.location,
        full_address: editForm.full_address || undefined,
        phone: editForm.phone || undefined,
        maps_link: editForm.maps_link || undefined,
        message: editForm.message || undefined
      };

      const response = await fetch(`/api/master-admin/events/${editingEvent.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const result: UpdateEventResponse = await response.json();

      if (result.success && result.event) {
        // Atualizar lista com evento editado
        if (eventsData?.events) {
          const updatedEvents = eventsData.events.map(event =>
            event.id === editingEvent.id
              ? { ...event, ...result.event! }
              : event
          );

          setEventsData({
            ...eventsData,
            events: updatedEvents
          });
        }

        setEditOpen(false);
        setEditingEvent(null);
      } else {
        alert(`Erro ao atualizar: ${result.error}`);
      }
    } catch (error) {
      console.error('Error updating event:', error);
      alert('Erro de conexão ao atualizar o evento.');
    } finally {
      setEditLoading(false);
    }
  };

  const getEventStatus = (event: EventWithStats) => {
    const eventDate = new Date(event.date_time);
    const today = new Date();
    
    const eventSaoPaulo = new Date(eventDate.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
    const todaySaoPaulo = new Date(today.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
    
    if (eventSaoPaulo.toDateString() === todaySaoPaulo.toDateString()) {
      return { label: "Hoje", variant: "default" as const, color: "bg-primary" };
    } else if (eventSaoPaulo < todaySaoPaulo) {
      return { label: "Finalizado", variant: "secondary" as const, color: "bg-muted" };
    } else {
      const diffTime = eventSaoPaulo.getTime() - todaySaoPaulo.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return { 
        label: `${diffDays} dia${diffDays !== 1 ? 's' : ''}`, 
        variant: "outline" as const, 
        color: "bg-green-100" 
      };
    }
  };

  // Tela de login
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/30 to-primary/10 flex items-center justify-center p-4 sm:p-6">
        <Card className="w-full max-w-md shadow-2xl border-0">
          <CardHeader className="text-center space-y-4 pb-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl sm:text-3xl font-bold text-foreground">
              Admin Master
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              Acesso restrito para administradores
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  Senha Master
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Digite a senha de acesso"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="text-base h-11"
                />
              </div>

              {loginError && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-destructive text-sm">{loginError}</p>
                </div>
              )}

              <Button 
                type="submit" 
                disabled={loginLoading || !password.trim()}
                className="w-full h-11 text-base font-semibold"
              >
                {loginLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Verificando...
                  </div>
                ) : (
                  "Acessar Painel"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Tela principal após login
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/30 to-primary/10 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className="shadow-2xl border-0">
          <CardHeader className="flex flex-row items-center justify-between pb-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Heart className="w-6 h-6 text-primary fill-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-foreground">
                    Painel Master Admin
                  </CardTitle>
                  <CardDescription className="text-base text-muted-foreground">
                    Gerenciamento completo de todos os momentos especiais
                  </CardDescription>
                </div>
              </div>
            </div>
            <Button 
              onClick={() => setIsAuthenticated(false)}
              variant="outline"
              size="sm"
            >
              Sair
            </Button>
          </CardHeader>
        </Card>

        {/* Estatísticas */}
        {eventsData?.success && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{eventsData.total_events || 0}</p>
                    <p className="text-sm text-muted-foreground">Total de Momentos</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {eventsData.events?.reduce((total, event) => total + event.total_confirmations, 0) || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">Total de Confirmações</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {eventsData.events?.filter(event => {
                        const eventDate = new Date(event.date_time);
                        const today = new Date();
                        return eventDate > today;
                      }).length || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">Próximos Momentos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Lista de Eventos */}
        <Card className="shadow-2xl border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-primary fill-primary" />
              Todos os Momentos Especiais
            </CardTitle>
          </CardHeader>
          <CardContent>
            {eventsLoading ? (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                <p className="text-muted-foreground">Carregando momentos especiais...</p>
              </div>
            ) : !eventsData?.success ? (
              <div className="text-center py-8">
                <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4 opacity-50" />
                <p className="text-destructive">{eventsData?.error || 'Erro ao carregar dados'}</p>
                <Button 
                  onClick={fetchEventsData}
                  variant="outline"
                  className="mt-4"
                >
                  Tentar Novamente
                </Button>
              </div>
            ) : eventsData.events?.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">Nenhum momento especial criado ainda.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {eventsData.events?.map((event) => {
                  const status = getEventStatus(event);
                  return (
                    <div 
                      key={event.id} 
                      className="p-6 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors border"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                            <Heart className="w-6 h-6 text-primary fill-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-lg truncate">{event.title}</h3>
                              <Badge variant={status.variant} className="text-xs">
                                {status.label}
                              </Badge>
                            </div>
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-primary flex-shrink-0" />
                                <span>{new Date(event.date_time).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</span>
                              </div>
                              {event.full_address && (
                                <div className="flex items-center gap-2">
                                  <Building className="w-4 h-4 text-primary flex-shrink-0" />
                                  <span className="truncate">{event.full_address}</span>
                                </div>
                              )}
                              {event.message && (
                                <div className="flex items-start gap-2">
                                  <MessageSquare className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                                  <span className="line-clamp-2">{event.message}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Users className="w-4 h-4 text-green-600" />
                            <span className="font-semibold text-green-600">
                              {event.total_confirmations} confirmação{event.total_confirmations !== 1 ? 'ões' : ''}
                            </span>
                          </div>
                          <div className="space-y-1">
                            <Button
                              onClick={() => window.open(`/admin/${event.link_code}`, '_blank')}
                              size="sm"
                              variant="outline"
                              className="w-full"
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              Gerenciar
                            </Button>
                            <Button
                              onClick={() => window.open(`/convite/${event.link_code}`, '_blank')}
                              size="sm"
                              className="w-full"
                            >
                              Ver Convite
                            </Button>
                            <Button
                              onClick={() => handleEditEvent(event)}
                              size="sm"
                              variant="secondary"
                              className="w-full"
                            >
                              <Edit className="w-3 h-3 mr-1" />
                              Editar
                            </Button>
                            <Button
                              onClick={() => handleDeleteEvent(event.id, event.title)}
                              disabled={deletingEventId === event.id}
                              size="sm"
                              variant="destructive"
                              className="w-full"
                            >
                              {deletingEventId === event.id ? (
                                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                              ) : (
                                <Trash2 className="w-3 h-3 mr-1" />
                              )}
                              {deletingEventId === event.id ? 'Excluindo...' : 'Excluir'}
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-3 border-t border-border text-xs text-muted-foreground">
                        <span>Código: {event.link_code}</span>
                        <span>Criado: {new Date(event.created_at).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</span>
                        {event.last_confirmation && (
                          <span>Última confirmação: {new Date(event.last_confirmation).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal de Edição */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit className="w-5 h-5 text-primary" />
                Editar Momento Especial
              </DialogTitle>
              <DialogDescription>
                Faça as alterações necessárias no seu momento especial
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title" className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-primary fill-primary" />
                  Título do Momento
                </Label>
                <Input
                  id="edit-title"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  required
                  className="text-base"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-date" className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    Data do Momento
                  </Label>
                  <Input
                    id="edit-date"
                    type="date"
                    value={editForm.date}
                    onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                    required
                    className="text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-time" className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    Hora do Momento
                  </Label>
                  <Input
                    id="edit-time"
                    type="time"
                    value={editForm.time}
                    onChange={(e) => setEditForm({ ...editForm, time: e.target.value })}
                    required
                    className="text-base"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-location" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  Local do Momento
                </Label>
                <Input
                  id="edit-location"
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  required
                  className="text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-full_address" className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-primary" />
                  Endereço Completo
                </Label>
                <Input
                  id="edit-full_address"
                  value={editForm.full_address}
                  onChange={(e) => setEditForm({ ...editForm, full_address: e.target.value })}
                  className="text-base"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-phone" className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-primary" />
                    Telefone para Contato
                  </Label>
                  <Input
                    id="edit-phone"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-maps_link" className="flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-primary" />
                    Link do Google Maps
                  </Label>
                  <Input
                    id="edit-maps_link"
                    value={editForm.maps_link}
                    onChange={(e) => setEditForm({ ...editForm, maps_link: e.target.value })}
                    className="text-base"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-message" className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-primary" />
                  Mensagem (Opcional)
                </Label>
                <Textarea
                  id="edit-message"
                  value={editForm.message}
                  onChange={(e) => setEditForm({ ...editForm, message: e.target.value })}
                  className="min-h-20 text-base resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditOpen(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={editLoading}
                  className="flex-1"
                >
                  {editLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Salvando...
                    </div>
                  ) : (
                    "Salvar Alterações"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
