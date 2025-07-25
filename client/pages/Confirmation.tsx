import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Calendar,
  Clock,
  MapPin,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Heart,
  Building,
  Phone,
  Navigation,
  Users,
  Plus,
  Minus,
} from "lucide-react";
import {
  EventDetailsResponse,
  ConfirmGuestRequest,
  ConfirmGuestResponse,
  ConfirmFamilyRequest,
  ConfirmFamilyResponse,
} from "@shared/api";
import { fireConfirmationConfetti } from "@/lib/confetti-utils";

export default function Confirmation() {
  const { code } = useParams<{ code: string }>();
  const [eventData, setEventData] = useState<EventDetailsResponse | null>(null);
  const [guestName, setGuestName] = useState("");
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmGuestResponse | null>(null);
  const [isSimilarNameError, setIsSimilarNameError] = useState(false);

  // Family confirmation state
  const [isFamilyMode, setIsFamilyMode] = useState(false);
  const [familyNames, setFamilyNames] = useState<string[]>(["", ""]);
  const [familyConfirmationResult, setFamilyConfirmationResult] =
    useState<ConfirmFamilyResponse | null>(null);

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
      console.error("Error fetching event:", error);
      setEventData({
        success: false,
        error: "Erro ao carregar evento",
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
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          guest_name: guestName.trim(),
        } as ConfirmGuestRequest),
      });

      const result: ConfirmGuestResponse = await response.json();
      setConfirmationResult(result);

      // Detectar se é erro de nome similar
      const isSimilarError =
        !result.success &&
        result.message?.includes("Já existe") &&
        result.message?.includes("nome completo");
      setIsSimilarNameError(isSimilarError);

      if (result.success) {
        setGuestName("");
        setIsSimilarNameError(false);
        // Refresh event data to show updated confirmations
        fetchEventData();

        // 🎉 CONFETE!
        setTimeout(() => {
          fireConfirmationConfetti();
        }, 300);
      }
    } catch (error) {
      console.error("Error confirming guest:", error);
      setConfirmationResult({
        success: false,
        message: "Erro ao confirmar presença. Tente novamente.",
      });
    } finally {
      setConfirming(false);
    }
  };

  const handleFamilyConfirmation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || confirming) return;

    // Filter out empty names
    const validNames = familyNames
      .map((name) => name.trim())
      .filter((name) => name.length > 0);

    if (validNames.length === 0) {
      setFamilyConfirmationResult({
        success: false,
        message: "Adicione pelo menos um nome para confirmar presença.",
      });
      return;
    }

    setConfirming(true);
    setFamilyConfirmationResult(null);

    try {
      const requestData: ConfirmFamilyRequest = {
        guest_names: validNames,
      };

      const response = await fetch(`/api/events/${code}/confirm-family`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      const result: ConfirmFamilyResponse = await response.json();
      setFamilyConfirmationResult(result);

      if (result.success) {
        setFamilyNames(["", ""]);
        // Refresh event data to show updated confirmations
        fetchEventData();

        // 🎉 CONFETE para família!
        setTimeout(() => {
          fireConfirmationConfetti();
        }, 300);
      }
    } catch (error) {
      console.error("Error confirming family:", error);
      setFamilyConfirmationResult({
        success: false,
        message: "Erro ao confirmar presenças. Tente novamente.",
      });
    } finally {
      setConfirming(false);
    }
  };

  const addFamilyMember = () => {
    setFamilyNames([...familyNames, ""]);
  };

  const removeFamilyMember = (index: number) => {
    if (familyNames.length > 2) {
      const newNames = familyNames.filter((_, i) => i !== index);
      setFamilyNames(newNames);
    }
  };

  const updateFamilyName = (index: number, value: string) => {
    const newNames = [...familyNames];
    newNames[index] = value;
    setFamilyNames(newNames);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/30 to-primary/10 flex items-center justify-center p-4 sm:p-6">
        <Card className="w-full max-w-lg">
          <CardContent className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              <span className="text-muted-foreground">
                Carregando momento especial...
              </span>
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
            <CardTitle className="text-2xl font-bold">
              Momento Não Encontrado
            </CardTitle>
            <CardDescription>
              {eventData?.error ||
                "O link do evento pode estar incorreto ou expirado."}
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
    const eventSaoPaulo = new Date(
      eventDate.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }),
    );
    const todaySaoPaulo = new Date(
      today.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }),
    );

    eventSaoPaulo.setHours(0, 0, 0, 0); // Reset time to start of day
    todaySaoPaulo.setHours(0, 0, 0, 0); // Reset time to start of day

    const diffTime = eventSaoPaulo.getTime() - todaySaoPaulo.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  };

  const daysRemaining = calculateDaysRemaining(event.date_time);

  const getDaysRemainingText = (days: number) => {
    if (days < 0) {
      return `Momento já aconteceu (${Math.abs(days)} dia${Math.abs(days) !== 1 ? "s" : ""} atrás)`;
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
          <CardHeader className="text-center space-y-4 pb-2 pt-3 sm:pt-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Heart className="w-8 h-8 text-primary fill-primary" />
            </div>
            <CardTitle className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary text-center leading-tight mt-1 sm:mt-4">
              {event.title}
            </CardTitle>
            <CardDescription className="text-base sm:text-lg text-muted-foreground mt-1 sm:mt-4">
              Você foi convidado para este momento especial 🍓
            </CardDescription>

            {/* Days Remaining */}
            <div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
                daysRemaining < 0
                  ? "bg-muted text-muted-foreground"
                  : daysRemaining === 0
                    ? "bg-primary text-primary-foreground animate-pulse"
                    : daysRemaining <= 7
                      ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                      : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              }`}
            >
              <Calendar className="w-4 h-4" />
              {getDaysRemainingText(daysRemaining)}
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Ultra-Minimal Event Details */}
            <div className="space-y-3">
              {/* Essential Info - Minimal */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-primary" />
                  <span>
                    {new Date(event.date_time).toLocaleString("pt-BR", {
                      timeZone: "America/Sao_Paulo",
                      hour12: false,
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
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
                      <a
                        href={`https://wa.me/${event.phone.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-green-600 hover:text-green-700 text-xs"
                      >
                        <MessageSquare className="w-3 h-3" />
                        WhatsApp
                      </a>
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

            {/* Lista de confirmados quando há mais de 3 pessoas */}
            {confirmations.length > 3 && (
              <div className="border-t border-border pt-4">
                <details className="group">
                  <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <span className="inline-flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Ver lista de confirmados ({confirmations.length})
                      <span className="group-open:rotate-180 transition-transform">
                        ▼
                      </span>
                    </span>
                  </summary>
                  <div className="mt-3 space-y-1 max-h-32 overflow-y-auto">
                    {confirmations.slice(0, 20).map((confirmation, index) => (
                      <div
                        key={confirmation.id}
                        className="flex items-center gap-2 text-xs text-muted-foreground"
                      >
                        <span className="w-4 h-4 flex items-center justify-center bg-green-100 text-green-700 rounded-full text-[10px] font-bold dark:bg-green-900 dark:text-green-300">
                          ��
                        </span>
                        {confirmation.guest_name}
                      </div>
                    ))}
                    {confirmations.length > 20 && (
                      <p className="text-xs text-muted-foreground italic">
                        ... e mais {confirmations.length - 20} confirmações
                      </p>
                    )}
                  </div>
                </details>
              </div>
            )}

            {/* Confirmation Section */}
            <div className="border-t border-border pt-4">
              {confirmationResult?.success ||
              familyConfirmationResult?.success ? (
                <div className="text-center space-y-3 p-6 bg-gradient-to-r from-green-50 to-primary/5 rounded-xl border border-green-200 dark:from-green-950 dark:to-primary/10 dark:border-green-800 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="relative">
                    <CheckCircle className="w-12 h-12 text-green-600 mx-auto dark:text-green-400 animate-in zoom-in duration-300" />
                    <div className="absolute inset-0 w-12 h-12 mx-auto rounded-full bg-green-500/20 animate-ping" />
                  </div>
                  <h3 className="font-bold text-xl text-green-800 dark:text-green-200 animate-in slide-in-from-bottom-2 duration-700">
                    {familyConfirmationResult?.success
                      ? `${familyConfirmationResult.confirmed_count || 1} Presença${(familyConfirmationResult.confirmed_count || 1) > 1 ? "s" : ""} Confirmada${(familyConfirmationResult.confirmed_count || 1) > 1 ? "s" : ""}! 🎉`
                      : "Presença Confirmada! 🎉"}
                  </h3>
                  <p className="text-base text-green-700 dark:text-green-300 animate-in slide-in-from-bottom-1 duration-1000">
                    Obrigado por confirmar! Nos vemos em "{event.title}" 🍓
                  </p>
                  <div className="mt-4 p-3 bg-primary/10 rounded-lg">
                    <p className="text-sm text-primary font-medium">
                      ✨ Prepare-se para um momento especial!
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Mode Selection */}
                  <div className="flex gap-2 p-1 bg-muted rounded-lg">
                    <button
                      type="button"
                      onClick={() => {
                        setIsFamilyMode(false);
                        setConfirmationResult(null);
                        setFamilyConfirmationResult(null);
                        setIsSimilarNameError(false);
                      }}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                        !isFamilyMode
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Heart className="w-4 h-4" />
                      Individual
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsFamilyMode(true);
                        setConfirmationResult(null);
                        setFamilyConfirmationResult(null);
                        setIsSimilarNameError(false);
                      }}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                        isFamilyMode
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Users className="w-4 h-4" />
                      Família
                    </button>
                  </div>

                  {!isFamilyMode ? (
                    /* Individual Form */
                    <form onSubmit={handleConfirmation} className="space-y-3">
                      <Label htmlFor="guest_name" className="font-semibold">
                        {isSimilarNameError
                          ? "Por favor, digite seu nome completo:"
                          : "Confirme sua presença abaixo:"}
                      </Label>
                      <div className="space-y-1">
                        <Input
                          id="guest_name"
                          placeholder={
                            isSimilarNameError
                              ? "Ex: João Silva Santos (nome e sobrenome completo)"
                              : "Digite seu nome completo"
                          }
                          value={guestName}
                          onChange={(e) => {
                            setGuestName(e.target.value);
                            if (
                              isSimilarNameError &&
                              e.target.value.trim().split(" ").length > 1
                            ) {
                              setIsSimilarNameError(false);
                              setConfirmationResult(null);
                            }
                          }}
                          required
                          className={`h-11 ${isSimilarNameError ? "border-orange-300 focus:border-orange-500 bg-orange-50 dark:bg-orange-950/20" : ""}`}
                        />
                        {guestName.trim().length > 0 && (
                          <div className="flex items-center gap-2 text-xs">
                            <div
                              className={`w-2 h-2 rounded-full ${
                                guestName.trim().split(" ").length >= 2
                                  ? "bg-green-500"
                                  : "bg-yellow-500"
                              }`}
                            />
                            <span
                              className={`${
                                guestName.trim().split(" ").length >= 2
                                  ? "text-green-600 dark:text-green-400"
                                  : "text-yellow-600 dark:text-yellow-400"
                              }`}
                            >
                              {guestName.trim().split(" ").length >= 2
                                ? "✓ Nome completo"
                                : "Adicione sobrenome"}
                            </span>
                          </div>
                        )}
                      </div>

                      {confirmationResult && !confirmationResult.success && (
                        <div
                          className={`p-3 border rounded-lg ${
                            isSimilarNameError
                              ? "bg-orange-50 border-orange-200 dark:bg-orange-950/20 dark:border-orange-800"
                              : "bg-destructive/10 border-destructive/20"
                          }`}
                        >
                          <p
                            className={`text-sm ${
                              isSimilarNameError
                                ? "text-orange-800 dark:text-orange-200"
                                : "text-destructive"
                            }`}
                          >
                            {isSimilarNameError && (
                              <span className="inline-flex items-center gap-1 mr-2">
                                ⚠️
                              </span>
                            )}
                            {confirmationResult.message}
                          </p>
                          {isSimilarNameError && (
                            <p className="text-xs text-orange-600 dark:text-orange-300 mt-2">
                              💡 Dica: Digite nome e sobrenome para distinguir
                              de outras pessoas com o mesmo primeiro nome.
                            </p>
                          )}
                        </div>
                      )}

                      {guestName.trim().length > 0 &&
                        guestName.trim().split(" ").length === 1 &&
                        !confirmationResult && (
                          <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-950/20 dark:border-blue-800">
                            <p className="text-xs text-blue-700 dark:text-blue-300">
                              💡 Recomendado: Digite nome e sobrenome (ex: "João
                              Silva") para evitar confusão com outros
                              convidados.
                            </p>
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
                  ) : (
                    /* Family Form */
                    <form
                      onSubmit={handleFamilyConfirmation}
                      className="space-y-3"
                    >
                      <Label className="font-semibold">
                        Confirme a presença da família abaixo:
                      </Label>

                      <div className="space-y-2">
                        {familyNames.map((name, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              placeholder={`Nome completo ${index + 1}${index < 2 ? " (obrigatório)" : " (opcional)"}`}
                              value={name}
                              onChange={(e) =>
                                updateFamilyName(index, e.target.value)
                              }
                              required={index < 2}
                              className="h-10"
                            />
                            {familyNames.length > 2 && index >= 2 && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeFamilyMember(index)}
                                className="p-2 h-10 w-10"
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        onClick={addFamilyMember}
                        className="w-full h-10 font-medium"
                        disabled={familyNames.length >= 10}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar Familiar{" "}
                        {familyNames.length >= 10 ? "(máximo 10)" : ""}
                      </Button>

                      {familyConfirmationResult &&
                        !familyConfirmationResult.success && (
                          <div className="p-3 border rounded-lg bg-destructive/10 border-destructive/20">
                            <p className="text-sm text-destructive">
                              {familyConfirmationResult.message}
                            </p>
                          </div>
                        )}

                      <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-950/20 dark:border-blue-800">
                        <p className="text-xs text-blue-700 dark:text-blue-300">
                          💡 Digite nomes completos (nome e sobrenome) para
                          evitar confusão. Mínimo 2 campos, máximo 10.
                        </p>
                      </div>

                      <Button
                        type="submit"
                        disabled={
                          confirming ||
                          familyNames.filter((name) => name.trim().length > 0)
                            .length === 0
                        }
                        className="w-full h-11 font-semibold"
                      >
                        {confirming ? (
                          <>
                            <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                            Confirmando Família...
                          </>
                        ) : (
                          `Confirmar ${familyNames.filter((name) => name.trim().length > 0).length} Presença${familyNames.filter((name) => name.trim().length > 0).length !== 1 ? "s" : ""}`
                        )}
                      </Button>
                    </form>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
