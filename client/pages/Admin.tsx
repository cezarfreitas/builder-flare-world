import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  MapPin,
  MessageSquare,
  Users,
  Download,
  Heart,
  Building,
  Phone,
  Navigation,
  AlertCircle,
  Trash2,
} from "lucide-react";
import { AdminEventResponse, ClearConfirmationsResponse } from "@shared/api";
import { Button } from "@/components/ui/button";

export default function Admin() {
  const { code } = useParams<{ code: string }>();
  const [eventData, setEventData] = useState<AdminEventResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [clearingConfirmations, setClearingConfirmations] = useState(false);

  useEffect(() => {
    if (code) {
      fetchEventData();
    }
  }, [code]);

  useEffect(() => {
    if (eventData?.success && eventData.event?.title) {
      document.title = `${eventData.event.title} - Admin`;
    } else {
      document.title = "Administração";
    }
  }, [eventData]);

  const fetchEventData = async () => {
    try {
      const response = await fetch(`/api/admin/${code}`);
      const data: AdminEventResponse = await response.json();
      setEventData(data);
    } catch (error) {
      console.error("Error fetching admin event:", error);
      setEventData({
        success: false,
        error: "Erro ao carregar dados do evento",
      });
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!eventData?.confirmations) return;

    const csvContent = [
      ["Nome", "Data de Confirmação"],
      ...eventData.confirmations.map((conf) => [
        conf.guest_name,
        new Date(conf.confirmed_at).toLocaleString("pt-BR", {
          timeZone: "America/Sao_Paulo",
        }),
      ]),
    ];

    const csvString = csvContent.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvString], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `confirmados-${eventData.event?.title || "evento"}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleClearConfirmations = async () => {
    if (!eventData?.event || !code) return;

    const confirmed = window.confirm(
      `Tem certeza que deseja limpar TODA a lista de confirmados? Esta ação não pode ser desfeita.\n\nAtualmente há ${eventData.confirmations?.length || 0} confirmação(ões).`,
    );

    if (!confirmed) return;

    setClearingConfirmations(true);

    try {
      const response = await fetch(
        `/api/admin/${eventData.event.id}/confirmations`,
        {
          method: "DELETE",
        },
      );

      const result: ClearConfirmationsResponse = await response.json();

      if (result.success) {
        // Atualizar dados localmente
        setEventData({
          ...eventData,
          confirmations: [],
        });

        alert("Lista de confirmados limpa com sucesso!");
      } else {
        alert(`Erro ao limpar lista: ${result.error}`);
      }
    } catch (error) {
      console.error("Error clearing confirmations:", error);
      alert("Erro de conexão ao limpar a lista.");
    } finally {
      setClearingConfirmations(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/30 to-primary/10 flex items-center justify-center p-4 sm:p-6">
        <Card className="w-full max-w-lg">
          <CardContent className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              <span className="text-muted-foreground">Carregando dados...</span>
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
                "O link pode estar incorreto ou você pode não ter permissão para acessar."}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const event = eventData.event;
  const confirmations = eventData.confirmations || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/30 to-primary/10 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card className="shadow-2xl border-0">
          <CardHeader className="text-center space-y-4 pb-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Heart className="w-8 h-8 text-primary fill-primary" />
            </div>
            <CardTitle className="text-2xl sm:text-3xl font-bold text-foreground">
              {event.title}
            </CardTitle>
            <CardDescription className="text-base sm:text-lg text-muted-foreground">
              Gestão do seu momento especial
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Event Details */}
        <Card className="shadow-2xl border-0">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Detalhes do Momento</span>
              <Badge variant="secondary" className="text-sm">
                {confirmations.length} confirmado
                {confirmations.length !== 1 ? "s" : ""}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 p-6 rounded-xl space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-base">
                    {new Date(event.date_time).toLocaleString("pt-BR", {
                      timeZone: "America/Sao_Paulo",
                    })}
                  </span>
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
                    <span className="text-base">{event.phone}</span>
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
                      Ver no Google Maps
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

            <div className="flex gap-3">
              <Button
                onClick={() =>
                  window.open(`/convite/${event.link_code}`, "_blank")
                }
                variant="outline"
                className="flex-1"
              >
                Ver Página de Confirmação
              </Button>
              <Button
                onClick={exportToCSV}
                disabled={confirmations.length === 0}
                className="flex-1"
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar Lista
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Confirmations List */}
        <Card className="shadow-2xl border-0">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Lista de Confirmados ({confirmations.length})
              </CardTitle>
              {confirmations.length > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleClearConfirmations}
                  disabled={clearingConfirmations}
                  className="gap-2"
                >
                  {clearingConfirmations ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  {clearingConfirmations ? "Limpando..." : "Limpar Lista"}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {confirmations.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">
                  Ainda não há confirmações para este momento especial.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Compartilhe o link para que seus queridos possam confirmar
                  presença.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {confirmations.map((confirmation, index) => (
                  <div
                    key={confirmation.id}
                    className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary">
                          {index + 1}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-base">
                          {confirmation.guest_name}
                        </span>
                        {confirmation.family_batch_id && (
                          <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium dark:bg-blue-900 dark:text-blue-200">
                            <Users className="w-3 h-3" />
                            Família
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        {new Date(confirmation.confirmed_at).toLocaleDateString(
                          "pt-BR",
                          { timeZone: "America/Sao_Paulo" },
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(confirmation.confirmed_at).toLocaleTimeString(
                          "pt-BR",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                            timeZone: "America/Sao_Paulo",
                          },
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
