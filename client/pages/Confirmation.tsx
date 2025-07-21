import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, MapPin, MessageSquare, CheckCircle, AlertCircle, PartyPopper, Building, Phone, Navigation } from "lucide-react";
import { EventDetailsResponse, ConfirmGuestRequest, ConfirmGuestResponse } from "@shared/api";

export default function Confirmation() {
  const { code } = useParams<{ code: string }>();
  const [eventData, setEventData] = useState<EventDetailsResponse | null>(null);
  const [guestName, setGuestName] = useState("");
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmGuestResponse | null>(null);

  useEffect(() => {
    if (code) {
      fetchEventData();
    }
  }, [code]);

  const fetchEventData = async () => {
    try {
      const response = await fetch(`/api/events/${code}`);
      const data: EventDetailsResponse = await response.json();
      setEventData(data);
    } catch (error) {
      console.error('Error fetching event:', error);
      setEventData({
        success: false,
        error: 'Erro ao carregar evento'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) return;
    
    setConfirming(true);
    
    try {
      const response = await fetch(`/api/events/${code}/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ guest_name: guestName.trim() } as ConfirmGuestRequest),
      });
      
      const result: ConfirmGuestResponse = await response.json();
      setConfirmationResult(result);
      
      if (result.success) {
        setGuestName("");
        // Refresh event data to show updated confirmations
        fetchEventData();
      }
    } catch (error) {
      console.error('Error confirming guest:', error);
      setConfirmationResult({
        success: false,
        message: 'Erro ao confirmar presença. Tente novamente.'
      });
    } finally {
      setConfirming(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/30 to-primary/10 flex items-center justify-center p-4 sm:p-6">
        <Card className="w-full max-w-lg">
          <CardContent className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              <span className="text-muted-foreground">Carregando evento...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!eventData?.success || !eventData.event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/30 to-primary/10 flex items-center justify-center p-4 sm:p-6">
        <Card className="w-full max-w-lg shadow-2xl border-0">
          <CardHeader className="text-center space-y-4">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <CardTitle className="text-2xl font-bold">Evento Não Encontrado</CardTitle>
            <CardDescription>
              {eventData?.error || 'O link do evento pode estar incorreto ou expirado.'}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const event = eventData.event;
  const confirmations = eventData.confirmations || [];

  // Calculate days remaining
  const calculateDaysRemaining = (eventDateTime: string) => {
    const eventDate = new Date(eventDateTime);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day
    eventDate.setHours(0, 0, 0, 0); // Reset time to start of day

    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  };

  const daysRemaining = calculateDaysRemaining(event.date_time);

  const getDaysRemainingText = (days: number) => {
    if (days < 0) {
      return `Evento já aconteceu (${Math.abs(days)} dia${Math.abs(days) !== 1 ? 's' : ''} atrás)`;
    } else if (days === 0) {
      return "Evento é hoje! 🎉";
    } else if (days === 1) {
      return "Falta apenas 1 dia!";
    } else {
      return `Faltam ${days} dias`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/30 to-primary/10 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-2xl space-y-4 sm:space-y-6">
        {/* Event Details Card */}
        <Card className="shadow-2xl border-0">
          <CardHeader className="text-center space-y-4 pb-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <PartyPopper className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl sm:text-3xl font-bold text-foreground">
              Confirmação de Presença
            </CardTitle>
            <CardDescription className="text-base sm:text-lg text-muted-foreground">
              Você foi convidado para um evento especial
            </CardDescription>

            {/* Days Remaining */}
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
              daysRemaining < 0
                ? 'bg-muted text-muted-foreground'
                : daysRemaining === 0
                ? 'bg-primary text-primary-foreground animate-pulse'
                : daysRemaining <= 7
                ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            }`}>
              <Calendar className="w-4 h-4" />
              {getDaysRemainingText(daysRemaining)}
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="bg-muted/50 p-6 rounded-xl space-y-4">
              <h3 className="font-semibold text-foreground text-lg">Detalhes do Evento:</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-base">{new Date(event.date_time).toLocaleString('pt-BR')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-base">{event.location}</span>
                </div>
                {event.full_address && (
                  <div className="flex items-start gap-3">
                    <Building className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-base">{event.full_address}</span>
                  </div>
                )}
                {event.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                    <a
                      href={`tel:${event.phone}`}
                      className="text-base text-primary hover:underline"
                    >
                      {event.phone}
                    </a>
                  </div>
                )}
                {event.maps_link && (
                  <div className="flex items-center gap-3">
                    <Navigation className="w-5 h-5 text-primary flex-shrink-0" />
                    <a
                      href={event.maps_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-base text-primary hover:underline"
                    >
                      Como chegar (Google Maps)
                    </a>
                  </div>
                )}
                {event.message && (
                  <div className="flex items-start gap-3">
                    <MessageSquare className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-base">{event.message}</span>
                  </div>
                )}
              </div>
            </div>

            {confirmationResult?.success ? (
              <div className="text-center space-y-4 p-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  Presença Confirmada!
                </h3>
                <p className="text-muted-foreground">
                  {confirmationResult.message}
                </p>
              </div>
            ) : (
              <form onSubmit={handleConfirmation} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="guest_name" className="text-base font-semibold">
                    Confirme sua presença:
                  </Label>
                  <Input
                    id="guest_name"
                    placeholder="Digite seu nome completo"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    required
                    className="text-base h-12"
                  />
                </div>

                {confirmationResult && !confirmationResult.success && (
                  <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <p className="text-destructive text-sm">{confirmationResult.message}</p>
                  </div>
                )}

                <Button 
                  type="submit" 
                  disabled={confirming || !guestName.trim()}
                  className="w-full h-12 text-base font-semibold"
                >
                  {confirming ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Confirmando...
                    </div>
                  ) : (
                    "Confirmar Presença"
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>


      </div>
    </div>
  );
}
