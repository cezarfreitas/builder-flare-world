import { RequestHandler } from "express";
import { getConnection } from "../db";
import {
  CreateEventRequest,
  CreateEventResponse,
  EventDetailsResponse,
  ConfirmGuestRequest,
  ConfirmGuestResponse,
  AdminEventResponse,
  MasterAdminLoginRequest,
  MasterAdminLoginResponse,
  MasterAdminResponse,
  DeleteEventResponse,
  UpdateEventRequest,
  UpdateEventResponse,
  ClearConfirmationsResponse,
  ConfirmFamilyRequest,
  ConfirmFamilyResponse,
} from "@shared/api";

function generateLinkCode(): string {
  return Math.random().toString(36).substring(2, 8) + Date.now().toString(36);
}

export const createEvent: RequestHandler = async (req, res) => {
  try {
    const {
      title,
      date_time,
      location,
      full_address,
      phone,
      maps_link,
      message,
    }: CreateEventRequest = req.body;

    if (!title || !date_time || !location) {
      const response: CreateEventResponse = {
        success: false,
        error: "Título, data/hora e local são obrigatórios",
      };
      return res.status(400).json(response);
    }

    const linkCode = generateLinkCode();
    const connection = await getConnection();

    try {
      const [result] = (await connection.execute(
        "INSERT INTO events (title, date_time, location, full_address, phone, maps_link, message, link_code) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [
          title,
          date_time,
          location,
          full_address || null,
          phone || null,
          maps_link || null,
          message || null,
          linkCode,
        ],
      )) as any;

      const [rows] = (await connection.execute(
        "SELECT * FROM events WHERE id = ?",
        [result.insertId],
      )) as any;

      const response: CreateEventResponse = {
        success: true,
        event: rows[0],
      };

      res.json(response);
    } finally {
      await connection.end();
    }
  } catch (error) {
    console.error("Error creating event:", error);
    const response: CreateEventResponse = {
      success: false,
      error: "Erro interno do servidor",
    };
    res.status(500).json(response);
  }
};

export const getEventByCode: RequestHandler = async (req, res) => {
  try {
    const { code } = req.params;
    const connection = await getConnection();

    try {
      const [eventRows] = (await connection.execute(
        "SELECT * FROM events WHERE link_code = ?",
        [code],
      )) as any;

      if (eventRows.length === 0) {
        const response: EventDetailsResponse = {
          success: false,
          error: "Evento não encontrado",
        };
        return res.status(404).json(response);
      }

      const [confirmationRows] = (await connection.execute(
        "SELECT id, guest_name, confirmed_at FROM confirmations WHERE event_id = ? ORDER BY confirmed_at DESC",
        [eventRows[0].id],
      )) as any;

      const response: EventDetailsResponse = {
        success: true,
        event: eventRows[0],
        confirmations: confirmationRows,
      };

      res.json(response);
    } finally {
      await connection.end();
    }
  } catch (error) {
    console.error("Error getting event:", error);
    const response: EventDetailsResponse = {
      success: false,
      error: "Erro interno do servidor",
    };
    res.status(500).json(response);
  }
};

export const confirmGuest: RequestHandler = async (req, res) => {
  try {
    const { code } = req.params;
    const { guest_name }: ConfirmGuestRequest = req.body;

    if (!guest_name || guest_name.trim().length === 0) {
      const response: ConfirmGuestResponse = {
        success: false,
        message: "Nome é obrigatório",
      };
      return res.status(400).json(response);
    }

    const connection = await getConnection();

    try {
      // Check if event exists
      const [eventRows] = (await connection.execute(
        "SELECT id FROM events WHERE link_code = ?",
        [code],
      )) as any;

      if (eventRows.length === 0) {
        const response: ConfirmGuestResponse = {
          success: false,
          message: "Evento não encontrado",
        };
        return res.status(404).json(response);
      }

      // Check if guest already confirmed (exact match)
      const [existingRows] = (await connection.execute(
        "SELECT id FROM confirmations WHERE event_id = ? AND guest_name = ?",
        [eventRows[0].id, guest_name.trim()],
      )) as any;

      if (existingRows.length > 0) {
        const response: ConfirmGuestResponse = {
          success: false,
          message: "Você já confirmou presença para este evento",
        };
        return res.status(400).json(response);
      }

      // Check for similar names (first name match) to suggest full name
      const inputFirstName = guest_name.trim().split(" ")[0].toLowerCase();
      const inputWordCount = guest_name.trim().split(" ").length;

      const [similarNamesRows] = (await connection.execute(
        "SELECT guest_name FROM confirmations WHERE event_id = ?",
        [eventRows[0].id],
      )) as any;

      const similarNames = similarNamesRows.filter((row: any) => {
        const existingFirstName = row.guest_name.split(" ")[0].toLowerCase();
        const existingName = row.guest_name.trim().toLowerCase();
        const inputName = guest_name.trim().toLowerCase();

        // Verifica se o primeiro nome é igual mas o nome completo é diferente
        return (
          existingFirstName === inputFirstName && existingName !== inputName
        );
      });

      // Se tem nome similar e o usuário digitou apenas um nome, pedir nome completo
      if (similarNames.length > 0 && inputWordCount === 1) {
        const existingName = similarNames[0].guest_name;
        const response: ConfirmGuestResponse = {
          success: false,
          message: `Já existe "${existingName}" na lista. Por favor, digite seu nome completo para evitar confusão.`,
        };
        return res.status(400).json(response);
      }

      // Se tem nome similar e o usuário digitou 2 palavras, mas ainda é muito similar, pedir mais detalhes
      if (similarNames.length > 0 && inputWordCount === 2) {
        const inputFullName = guest_name.trim().toLowerCase();
        const veryCloseMatches = similarNames.filter((row: any) => {
          const existingFullName = row.guest_name.trim().toLowerCase();
          const inputWords = inputFullName.split(" ");
          const existingWords = existingFullName.split(" ");

          // Se primeiro e segundo nome são iguais mas há diferenças sutis
          return (
            inputWords[0] === existingWords[0] &&
            inputWords[1] &&
            existingWords[1] &&
            inputWords[1].substring(0, 3) === existingWords[1].substring(0, 3)
          );
        });

        if (veryCloseMatches.length > 0) {
          const response: ConfirmGuestResponse = {
            success: false,
            message: `Já existe "${veryCloseMatches[0].guest_name}" na lista. Por favor, digite seu nome completo com mais detalhes (ex: João Silva Santos).`,
          };
          return res.status(400).json(response);
        }
      }

      // Add confirmation
      await connection.execute(
        "INSERT INTO confirmations (event_id, guest_name) VALUES (?, ?)",
        [eventRows[0].id, guest_name.trim()],
      );

      const response: ConfirmGuestResponse = {
        success: true,
        message: "Presença confirmada com sucesso!",
      };

      res.json(response);
    } finally {
      await connection.end();
    }
  } catch (error) {
    console.error("Error confirming guest:", error);
    const response: ConfirmGuestResponse = {
      success: false,
      message: "Erro interno do servidor",
    };
    res.status(500).json(response);
  }
};

export const confirmFamily: RequestHandler = async (req, res) => {
  try {
    const { code } = req.params;
    const { guest_names }: ConfirmFamilyRequest = req.body;

    if (!guest_names || !Array.isArray(guest_names) || guest_names.length === 0) {
      const response: ConfirmFamilyResponse = {
        success: false,
        message: "Lista de nomes é obrigatória",
      };
      return res.status(400).json(response);
    }

    // Validate all names
    const validNames = guest_names
      .map(name => name?.trim())
      .filter(name => name && name.length > 0);

    if (validNames.length === 0) {
      const response: ConfirmFamilyResponse = {
        success: false,
        message: "Pelo menos um nome válido é obrigatório",
      };
      return res.status(400).json(response);
    }

    const connection = await getConnection();

    try {
      // Check if event exists
      const [eventRows] = (await connection.execute(
        "SELECT id FROM events WHERE link_code = ?",
        [code],
      )) as any;

      if (eventRows.length === 0) {
        const response: ConfirmFamilyResponse = {
          success: false,
          message: "Evento não encontrado",
        };
        return res.status(404).json(response);
      }

      const eventId = eventRows[0].id;
      let confirmedCount = 0;
      const alreadyConfirmed = [];
      const similarNames = [];

      // Generate unique batch ID for this family registration
      const familyBatchId = `family_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Check each name for duplicates and similar names
      for (const guestName of validNames) {
        // Check exact match
        const [existingRows] = (await connection.execute(
          "SELECT id FROM confirmations WHERE event_id = ? AND guest_name = ?",
          [eventId, guestName],
        )) as any;

        if (existingRows.length > 0) {
          alreadyConfirmed.push(guestName);
          continue;
        }

        // Check similar names (same first name)
        const inputFirstName = guestName.split(' ')[0].toLowerCase();
        const [similarRows] = (await connection.execute(
          "SELECT guest_name FROM confirmations WHERE event_id = ? AND LOWER(SUBSTRING_INDEX(guest_name, ' ', 1)) = ?",
          [eventId, inputFirstName],
        )) as any;

        if (similarRows.length > 0 && guestName.split(' ').length === 1) {
          similarNames.push(guestName);
          continue;
        }

        // Insert confirmation with family batch ID
        await connection.execute(
          "INSERT INTO confirmations (event_id, guest_name, family_batch_id) VALUES (?, ?, ?)",
          [eventId, guestName, familyBatchId],
        );
        confirmedCount++;
      }

      // Handle response based on results
      if (similarNames.length > 0) {
        const response: ConfirmFamilyResponse = {
          success: false,
          message: `Já existe alguém com o nome "${similarNames[0]}" confirmado. Use nome completo para distinguir.`,
        };
        return res.status(400).json(response);
      }

      if (alreadyConfirmed.length > 0 && confirmedCount === 0) {
        const response: ConfirmFamilyResponse = {
          success: false,
          message: `${alreadyConfirmed.length > 1 ? 'Estes nomes já foram confirmados' : 'Este nome já foi confirmado'}: ${alreadyConfirmed.join(', ')}`,
        };
        return res.status(400).json(response);
      }

      const totalAttempted = validNames.length;
      let message = '';

      if (confirmedCount === totalAttempted) {
        message = confirmedCount === 1
          ? 'Presença confirmada com sucesso!'
          : `${confirmedCount} presenças confirmadas com sucesso!`;
      } else {
        message = `${confirmedCount} de ${totalAttempted} presenças confirmadas.`;
        if (alreadyConfirmed.length > 0) {
          message += ` Já confirmados: ${alreadyConfirmed.join(', ')}`;
        }
      }

      const response: ConfirmFamilyResponse = {
        success: true,
        message,
        confirmed_count: confirmedCount,
      };

      res.json(response);
    } finally {
      await connection.end();
    }
  } catch (error) {
    console.error("Error confirming family:", error);
    const response: ConfirmFamilyResponse = {
      success: false,
      message: "Erro interno do servidor",
    };
    res.status(500).json(response);
  }
};

export const getAdminEvent: RequestHandler = async (req, res) => {
  try {
    const { code } = req.params;
    const connection = await getConnection();

    try {
      const [eventRows] = (await connection.execute(
        "SELECT * FROM events WHERE link_code = ?",
        [code],
      )) as any;

      if (eventRows.length === 0) {
        const response: AdminEventResponse = {
          success: false,
          error: "Evento não encontrado",
        };
        return res.status(404).json(response);
      }

      const [confirmationRows] = (await connection.execute(
        "SELECT id, guest_name, confirmed_at FROM confirmations WHERE event_id = ? ORDER BY confirmed_at DESC",
        [eventRows[0].id],
      )) as any;

      const response: AdminEventResponse = {
        success: true,
        event: eventRows[0],
        confirmations: confirmationRows,
        total_confirmations: confirmationRows.length,
      };

      res.json(response);
    } finally {
      await connection.end();
    }
  } catch (error) {
    console.error("Error getting admin event:", error);
    const response: AdminEventResponse = {
      success: false,
      error: "Erro interno do servidor",
    };
    res.status(500).json(response);
  }
};

export const masterAdminLogin: RequestHandler = async (req, res) => {
  try {
    const { password }: MasterAdminLoginRequest = req.body;

    // Senha master hardcoded (em produção seria melhor usar variáveis de ambiente)
    const MASTER_PASSWORD = "morango2024";

    if (password === MASTER_PASSWORD) {
      const response: MasterAdminLoginResponse = {
        success: true,
      };
      res.json(response);
    } else {
      const response: MasterAdminLoginResponse = {
        success: false,
        error: "Senha incorreta",
      };
      res.status(401).json(response);
    }
  } catch (error) {
    console.error("Error in master admin login:", error);
    const response: MasterAdminLoginResponse = {
      success: false,
      error: "Erro interno do servidor",
    };
    res.status(500).json(response);
  }
};

export const getMasterAdminData: RequestHandler = async (req, res) => {
  try {
    const connection = await getConnection();

    try {
      // Buscar todos os eventos com estatísticas
      const [eventRows] = (await connection.execute(`
        SELECT
          e.*,
          COUNT(c.id) as total_confirmations,
          MAX(c.confirmed_at) as last_confirmation
        FROM events e
        LEFT JOIN confirmations c ON e.id = c.event_id
        GROUP BY e.id
        ORDER BY e.created_at DESC
      `)) as any;

      const response: MasterAdminResponse = {
        success: true,
        events: eventRows,
        total_events: eventRows.length,
      };

      res.json(response);
    } finally {
      await connection.end();
    }
  } catch (error) {
    console.error("Error getting master admin data:", error);
    const response: MasterAdminResponse = {
      success: false,
      error: "Erro interno do servidor",
    };
    res.status(500).json(response);
  }
};

export const deleteEvent: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await getConnection();

    try {
      // Verificar se o evento existe
      const [eventRows] = (await connection.execute(
        "SELECT id FROM events WHERE id = ?",
        [id],
      )) as any;

      if (eventRows.length === 0) {
        const response: DeleteEventResponse = {
          success: false,
          error: "Evento não encontrado",
        };
        return res.status(404).json(response);
      }

      // Deletar confirmações relacionadas (CASCADE deveria fazer isso automaticamente)
      await connection.execute("DELETE FROM confirmations WHERE event_id = ?", [
        id,
      ]);

      // Deletar o evento
      await connection.execute("DELETE FROM events WHERE id = ?", [id]);

      const response: DeleteEventResponse = {
        success: true,
      };

      res.json(response);
    } finally {
      await connection.end();
    }
  } catch (error) {
    console.error("Error deleting event:", error);
    const response: DeleteEventResponse = {
      success: false,
      error: "Erro interno do servidor",
    };
    res.status(500).json(response);
  }
};

export const updateEvent: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      date_time,
      location,
      full_address,
      phone,
      maps_link,
      message,
    }: UpdateEventRequest = req.body;

    if (!title || !date_time || !location) {
      const response: UpdateEventResponse = {
        success: false,
        error: "Título, data/hora e local são obrigatórios",
      };
      return res.status(400).json(response);
    }

    const connection = await getConnection();

    try {
      // Verificar se o evento existe
      const [eventRows] = (await connection.execute(
        "SELECT id FROM events WHERE id = ?",
        [id],
      )) as any;

      if (eventRows.length === 0) {
        const response: UpdateEventResponse = {
          success: false,
          error: "Evento não encontrado",
        };
        return res.status(404).json(response);
      }

      // Atualizar o evento
      await connection.execute(
        "UPDATE events SET title = ?, date_time = ?, location = ?, full_address = ?, phone = ?, maps_link = ?, message = ? WHERE id = ?",
        [
          title,
          date_time,
          location,
          full_address || null,
          phone || null,
          maps_link || null,
          message || null,
          id,
        ],
      );

      // Buscar o evento atualizado
      const [updatedEventRows] = (await connection.execute(
        "SELECT * FROM events WHERE id = ?",
        [id],
      )) as any;

      const response: UpdateEventResponse = {
        success: true,
        event: updatedEventRows[0],
      };

      res.json(response);
    } finally {
      await connection.end();
    }
  } catch (error) {
    console.error("Error updating event:", error);
    const response: UpdateEventResponse = {
      success: false,
      error: "Erro interno do servidor",
    };
    res.status(500).json(response);
  }
};

export const clearConfirmations: RequestHandler = async (req, res) => {
  try {
    const { eventId } = req.params;
    const connection = await getConnection();

    try {
      // Verificar se o evento existe
      const [eventRows] = (await connection.execute(
        "SELECT id FROM events WHERE id = ?",
        [eventId],
      )) as any;

      if (eventRows.length === 0) {
        const response: ClearConfirmationsResponse = {
          success: false,
          error: "Evento não encontrado",
        };
        return res.status(404).json(response);
      }

      // Deletar todas as confirmações do evento
      await connection.execute("DELETE FROM confirmations WHERE event_id = ?", [
        eventId,
      ]);

      const response: ClearConfirmationsResponse = {
        success: true,
      };

      res.json(response);
    } finally {
      await connection.end();
    }
  } catch (error) {
    console.error("Error clearing confirmations:", error);
    const response: ClearConfirmationsResponse = {
      success: false,
      error: "Erro interno do servidor",
    };
    res.status(500).json(response);
  }
};
