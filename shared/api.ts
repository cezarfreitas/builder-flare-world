export interface DemoResponse {
  message: string;
}

export interface Event {
  id: number;
  title: string;
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
  title: string;
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

export interface AdminEventResponse {
  success: boolean;
  event?: Event;
  confirmations?: Array<{
    id: number;
    guest_name: string;
    confirmed_at: string;
  }>;
  total_confirmations?: number;
  error?: string;
}

export interface MasterAdminLoginRequest {
  password: string;
}

export interface MasterAdminLoginResponse {
  success: boolean;
  error?: string;
}

export interface EventWithStats extends Event {
  total_confirmations: number;
  last_confirmation?: string;
}

export interface MasterAdminResponse {
  success: boolean;
  events?: EventWithStats[];
  total_events?: number;
  error?: string;
}

export interface DeleteEventResponse {
  success: boolean;
  error?: string;
}

export interface UpdateEventRequest {
  title: string;
  date_time: string;
  location: string;
  full_address?: string;
  phone?: string;
  maps_link?: string;
  message?: string;
}

export interface UpdateEventResponse {
  success: boolean;
  event?: Event;
  error?: string;
}

export interface ClearConfirmationsResponse {
  success: boolean;
  error?: string;
}
