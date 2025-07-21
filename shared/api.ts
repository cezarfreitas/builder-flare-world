export interface DemoResponse {
  message: string;
}

export interface Event {
  id: number;
  date_time: string;
  location: string;
  full_address?: string;
  phone?: string;
  maps_link?: string;
  message?: string;
  link_code: string;
  created_at: string;
}

export interface CreateEventRequest {
  date_time: string;
  location: string;
  full_address?: string;
  phone?: string;
  maps_link?: string;
  message?: string;
}

export interface CreateEventResponse {
  success: boolean;
  event?: Event;
  error?: string;
}

export interface ConfirmGuestRequest {
  guest_name: string;
}

export interface ConfirmGuestResponse {
  success: boolean;
  message: string;
}

export interface EventDetailsResponse {
  success: boolean;
  event?: Event;
  confirmations?: Array<{
    id: number;
    guest_name: string;
    confirmed_at: string;
  }>;
  error?: string;
}
