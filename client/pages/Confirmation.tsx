import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, MapPin, MessageSquare, CheckCircle, AlertCircle, Heart, Building, Phone, Navigation } from "lucide-react";
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

  useEffect(() => {
    if (eventData?.success && eventData.event?.title) {
      document.title = `🍓 ${eventData.event.title} - Confirmação`;
    } else {
      document.title = "🍓 Confirmação de Presença";
    }
  }, [eventData]);

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
              <span className="text-muted-foreground">Carregando momento especial...</span>
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
            <CardTitle className="text-2xl font-bold">Momento Não Encontrado</CardTitle>
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

    // Converter para fuso horário de São Paulo
    const eventSaoPaulo = new Date(eventDate.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
    const todaySaoPaulo = new Date(today.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));

    eventSaoPaulo.setHours(0, 0, 0, 0); // Reset time to start of day
    todaySaoPaulo.setHours(0, 0, 0, 0); // Reset time to start of day

    const diffTime = eventSaoPaulo.getTime() - todaySaoPaulo.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  };

  const daysRemaining = calculateDaysRemaining(event.date_time);

  const getDaysRemainingText = (days: number) => {
    if (days < 0) {
      return `Momento já aconteceu (${Math.abs(days)} dia${Math.abs(days) !== 1 ? 's' : ''} atrás)`;
    } else if (days === 0) {
      return "O momento especial é hoje! 🍓";
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
              <Heart className="w-8 h-8 text-primary fill-primary" />
            </div>
            <CardTitle className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary text-center leading-tight">
              {event.title}
            </CardTitle>
            <CardDescription className="text-base sm:text-lg text-muted-foreground">
              Você foi convidado para este momento especial 🍓
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
            {/* Ultra-Minimal Event Details */}
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground text-base">Detalhes do Momento:</h3>

              {/* Essential Info - Minimal */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-primary" />
                  <span>{new Date(event.date_time).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="font-medium">{event.location}</span>
                </div>

                {event.full_address && (
                  <div className="text-xs text-muted-foreground ml-6">
                    {event.full_address}
                  </div>
                )}

                {/* Action Links with Text */}
                {(event.phone || event.maps_link) && (
                  <div className="flex gap-2 ml-6">
                    {event.phone && (
                      <>
                        <a
                          href={`tel:${event.phone}`}
                          className="flex items-center gap-1 text-green-600 hover:text-green-700 text-xs"
                        >
                          <Phone className="w-3 h-3" />
                          Ligar
                        </a>
                        <a
                          href={`https://wa.me/${event.phone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-green-600 hover:text-green-700 text-xs"
                        >
                          <MessageSquare className="w-3 h-3" />
                          WhatsApp
                        </a>
                      </>
                    )}

                    {event.maps_link && (
                      <a
                        href={event.maps_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-xs"
                      >
                        <Navigation className="w-3 h-3" />
                        Como chegar
                      </a>
                    )}
                  </div>
                )}

                {event.message && (
                  <div className="text-xs sm:text-xs text-muted-foreground border-l-2 border-muted pl-3 ml-3 font-normal sm:font-semibold sm:text-sm">
                    {event.message}
                  </div>
                )}
              </div>
            </div>

            {/* Simple Confirmation */}
            <div className="border-t border-border pt-4">
              {confirmationResult?.success ? (
                <div className="text-center space-y-3 p-4 bg-green-50 rounded-lg dark:bg-green-950">
                  <CheckCircle className="w-8 h-8 text-green-600 mx-auto dark:text-green-400" />
                  <h3 className="font-semibold text-green-800 dark:text-green-200">
                    Presença Confirmada! 🎉
                  </h3>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Obrigado por confirmar! Nos vemos em "{event.title}" 🍓
                  </p>
                </div>
              ) : (
                <form onSubmit={handleConfirmation} className="space-y-3">
                  <Label htmlFor="guest_name" className="font-semibold">
                    Confirme sua presença para "{event.title}":
                  </Label>
                  <Input
                    id="guest_name"
                    placeholder="Digite seu nome completo"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    required
                    className="h-11"
                  />

                  {confirmationResult && !confirmationResult.success && (
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                      <p className="text-destructive text-sm">{confirmationResult.message}</p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={confirming || !guestName.trim()}
                    className="w-full h-11 font-semibold"
                  >
                    {confirming ? (
                      <>
                        <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                        Confirmando...
                      </>
                    ) : (
                      "Confirmar Presença"
                    )}
                  </Button>
                </form>
              )}
            </div>
          </CardContent>
        </Card>


      </div>
    </div>
  );
}
