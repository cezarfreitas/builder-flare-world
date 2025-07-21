import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, MapPin, MessageSquare, Share2, CheckCircle, Heart, Building, Phone, Navigation } from "lucide-react";
import { CreateEventRequest, CreateEventResponse } from "@shared/api";

export default function Index() {
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    time: "",
    location: "",
    full_address: "",
    phone: "",
    maps_link: "",
    message: ""
  });
  const [loading, setLoading] = useState(false);
  const [createdEvent, setCreatedEvent] = useState<CreateEventResponse | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const eventData: CreateEventRequest = {
        title: formData.title,
        date_time: `${formData.date}T${formData.time}`,
        location: formData.location,
        full_address: formData.full_address,
        phone: formData.phone,
        maps_link: formData.maps_link,
        message: formData.message
      };

      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });
      
      const result: CreateEventResponse = await response.json();
      setCreatedEvent(result);
      
      if (result.success) {
        setFormData({ title: "", date: "", time: "", location: "", full_address: "", phone: "", maps_link: "", message: "" });
      }
    } catch (error) {
      console.error('Error creating event:', error);
      setCreatedEvent({
        success: false,
        error: 'Erro ao criar evento. Tente novamente.'
      });
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    if (createdEvent?.event) {
      const link = `${window.location.origin}/convite/${createdEvent.event.link_code}`;
      navigator.clipboard.writeText(link);
    }
  };

  if (createdEvent?.success && createdEvent.event) {
    const confirmationLink = `${window.location.origin}/convite/${createdEvent.event.link_code}`;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/30 to-primary/10 flex items-center justify-center p-4 sm:p-6">
        <Card className="w-full max-w-2xl shadow-2xl border-0">
          <CardHeader className="text-center space-y-4 pb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Heart className="w-8 h-8 text-primary fill-primary" />
            </div>
            <CardTitle className="text-2xl sm:text-3xl font-bold text-foreground">
            {createdEvent.event.title}
          </CardTitle>
          <CardDescription className="text-base sm:text-lg text-muted-foreground">
            Seu momento especial foi criado com sucesso! 🍓
          </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="bg-muted/50 p-6 rounded-xl space-y-4">
              <h3 className="font-semibold text-foreground">Detalhes do Evento:</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-primary" />
                  <span>{new Date(createdEvent.event.date_time).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-primary" />
                  <span>{createdEvent.event.location}</span>
                </div>
                {createdEvent.event.full_address && (
                  <div className="flex items-start gap-3">
                    <Building className="w-5 h-5 text-primary mt-0.5" />
                    <span>{createdEvent.event.full_address}</span>
                  </div>
                )}
                {createdEvent.event.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-primary" />
                    <span>{createdEvent.event.phone}</span>
                  </div>
                )}
                {createdEvent.event.maps_link && (
                  <div className="flex items-center gap-3">
                    <Navigation className="w-5 h-5 text-primary" />
                    <a
                      href={createdEvent.event.maps_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Ver no Google Maps
                    </a>
                  </div>
                )}
                {createdEvent.event.message && (
                  <div className="flex items-start gap-3">
                    <MessageSquare className="w-5 h-5 text-primary mt-0.5" />
                    <span>{createdEvent.event.message}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <Label htmlFor="confirmation-link" className="text-base font-semibold">
                Link de Confirmação:
              </Label>
              <div className="flex gap-2">
                <Input
                  id="confirmation-link"
                  value={confirmationLink}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button onClick={copyLink} size="icon" variant="outline">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Compartilhe este link com seus convidados para que possam confirmar presença.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex gap-3">
                <Button
                  onClick={() => setCreatedEvent(null)}
                  variant="outline"
                  className="flex-1"
                >
                  Criar Outro Momento
                </Button>
                <Button
                  onClick={() => window.open(confirmationLink, '_blank')}
                  className="flex-1"
                >
                  Ver Página de Confirmação
                </Button>
              </div>
              <Button
                onClick={() => window.open(`/admin/${createdEvent.event.link_code}`, '_blank')}
                variant="secondary"
                className="w-full"
              >
                Administrar Lista de Convidados
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/30 to-primary/10 flex items-center justify-center p-4 sm:p-6">
      <Card className="w-full max-w-2xl shadow-2xl border-0">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <Heart className="w-8 h-8 text-primary fill-primary" />
          </div>
          <CardTitle className="text-2xl sm:text-3xl font-bold text-foreground">
            Encontros Doces
          </CardTitle>
          <CardDescription className="text-base sm:text-lg text-muted-foreground">
            Organize seu evento especial e compartilhe momentos únicos
          </CardDescription>
          <button
            onClick={() => window.location.href = '/master-admin'}
            className="absolute top-2 right-2 w-2 h-2 bg-transparent opacity-0 hover:opacity-20 transition-opacity"
            title="Admin Master"
          />
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-primary fill-primary" />
                Título do Momento
              </Label>
              <Input
                id="title"
                placeholder="Ex: Festa de Aniversário da Maria"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="text-base"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  Data do Evento
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                  className="text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="time" className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  Hora do Evento
                </Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  required
                  className="text-base"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                Local do Evento
              </Label>
              <Input
                id="location"
                placeholder="Ex: Salão de Festas do Condomínio"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
                className="text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="full_address" className="flex items-center gap-2">
                <Building className="w-4 h-4 text-primary" />
                Endereço Completo
              </Label>
              <Input
                id="full_address"
                placeholder="Ex: Rua das Flores, 123 - Centro - São Paulo/SP"
                value={formData.full_address}
                onChange={(e) => setFormData({ ...formData, full_address: e.target.value })}
                className="text-base"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-primary" />
                  Telefone para Contato
                </Label>
                <Input
                  id="phone"
                  placeholder="Ex: (11) 99999-9999"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maps_link" className="flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-primary" />
                  Link do Google Maps
                </Label>
                <Input
                  id="maps_link"
                  placeholder="Cole o link do Google Maps aqui"
                  value={formData.maps_link}
                  onChange={(e) => setFormData({ ...formData, maps_link: e.target.value })}
                  className="text-base"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                Mensagem (Opcional)
              </Label>
              <Textarea
                id="message"
                placeholder="Ex: Venha compartilhar este momento doce conosco! 🍓"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="min-h-20 text-base resize-none"
              />
            </div>

            {createdEvent?.error && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-destructive text-sm">{createdEvent.error}</p>
              </div>
            )}

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full h-12 text-base font-semibold"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Preparando seu momento...
                </div>
              ) : (
                "Criar Momento Especial"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
