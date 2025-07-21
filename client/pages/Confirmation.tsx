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
          
          <CardContent className="space-y-4">
            {/* Compact Event Details */}
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground text-base">Detalhes do Evento:</h3>

              {/* Essential Info Only */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary flex-shrink-0" />
                  <span>{new Date(event.date_time).toLocaleString('pt-BR')}</span>
                </div>

                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium">{event.location}</div>
                    {event.full_address && (
                      <div className="text-muted-foreground text-xs">{event.full_address}</div>
                    )}
                  </div>
                </div>

                {/* Compact Action Buttons */}
                <div className="flex gap-2 pt-1">
                  {event.phone && (
                    <a
                      href={`tel:${event.phone}`}
                      className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200 dark:bg-green-900 dark:text-green-300"
                    >
                      <Phone className="w-3 h-3" />
                      <span className="hidden sm:inline">Ligar</span>
                    </a>
                  )}

                  {event.maps_link && (
                    <a
                      href={event.maps_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300"
                    >
                      <Navigation className="w-3 h-3" />
                      <span className="hidden sm:inline">Maps</span>
                    </a>
                  )}
                </div>

                {event.message && (
                  <div className="flex items-start gap-2 pt-1">
                    <MessageSquare className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground">{event.message}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Confirmation Section */}
            <div className="border-t border-border pt-6">
              {confirmationResult?.success ? (
                <div className="text-center space-y-6 p-6 bg-green-50 border border-green-200 rounded-xl dark:bg-green-950 dark:border-green-800">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto dark:bg-green-800">
                    <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-300" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl sm:text-2xl font-bold text-green-800 dark:text-green-200">
                      Presença Confirmada! 🎉
                    </h3>
                    <p className="text-green-700 dark:text-green-300 text-base">
                      {confirmationResult.message}
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400">
                      Aguardamos você no evento!
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-center pb-4">
                    <h3 className="text-lg font-bold text-foreground mb-2">
                      Confirme sua presença:
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Digite seu nome para confirmar que irá participar
                    </p>
                  </div>

                  <form onSubmit={handleConfirmation} className="space-y-4">
                    <div className="space-y-3">
                      <Label htmlFor="guest_name" className="text-base font-semibold">
                        Seu nome completo:
                      </Label>
                      <Input
                        id="guest_name"
                        placeholder="Ex: João Silva"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        required
                        className="text-base h-14 px-4 border-2 focus:border-primary"
                      />
                    </div>

                    {confirmationResult && !confirmationResult.success && (
                      <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-destructive" />
                          <p className="text-destructive text-sm font-medium">
                            {confirmationResult.message}
                          </p>
                        </div>
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={confirming || !guestName.trim()}
                      className="w-full h-14 text-base font-bold rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all"
                    >
                      {confirming ? (
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                          Confirmando...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5" />
                          Confirmar Presença
                        </div>
                      )}
                    </Button>
                  </form>
                </div>
              )}
            </div>
          </CardContent>
        </Card>


      </div>
    </div>
  );
}
