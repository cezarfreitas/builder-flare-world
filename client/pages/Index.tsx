import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, MapPin, MessageSquare, Share2, CheckCircle } from "lucide-react";
import { CreateEventRequest, CreateEventResponse } from "@shared/api";

export default function Index() {
  const [formData, setFormData] = useState<CreateEventRequest>({
    date_time: "",
    location: "",
    message: ""
  });
  const [loading, setLoading] = useState(false);
  const [createdEvent, setCreatedEvent] = useState<CreateEventResponse | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const result: CreateEventResponse = await response.json();
      setCreatedEvent(result);
      
      if (result.success) {
        setFormData({ date_time: "", location: "", message: "" });
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
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/30 to-primary/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl shadow-2xl border-0">
          <CardHeader className="text-center space-y-4 pb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold text-foreground">
              Evento Criado com Sucesso!
            </CardTitle>
            <CardDescription className="text-lg text-muted-foreground">
              Seu link de confirmação está pronto para ser compartilhado
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="bg-muted/50 p-6 rounded-xl space-y-4">
              <h3 className="font-semibold text-foreground">Detalhes do Evento:</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-primary" />
                  <span>{new Date(createdEvent.event.date_time).toLocaleString('pt-BR')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-primary" />
                  <span>{createdEvent.event.location}</span>
                </div>
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

            <div className="flex gap-3">
              <Button 
                onClick={() => setCreatedEvent(null)} 
                variant="outline" 
                className="flex-1"
              >
                Criar Outro Evento
              </Button>
              <Button 
                onClick={() => window.open(confirmationLink, '_blank')} 
                className="flex-1"
              >
                Ver Página de Confirmação
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/30 to-primary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-2xl border-0">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <Calendar className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold text-foreground">
            Sistema de Confirmação
          </CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            Crie seu evento e gere um link para confirmação de convidados
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="date_time" className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                Data e Hora do Evento
              </Label>
              <Input
                id="date_time"
                type="datetime-local"
                value={formData.date_time}
                onChange={(e) => setFormData({ ...formData, date_time: e.target.value })}
                required
                className="text-base"
              />
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
              <Label htmlFor="message" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                Mensagem (Opcional)
              </Label>
              <Textarea
                id="message"
                placeholder="Ex: Venha celebrar conosco! Traje esporte fino."
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
                  Criando Evento...
                </div>
              ) : (
                "Criar Evento"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
