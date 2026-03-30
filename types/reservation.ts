export interface Room {
  id: number;
  name: string;
}

export interface Reservation {
  id: number;
  user_id: number;
  room_id: number;
  reservation_date: string; // YYYY-MM-DD
  start_time: string; // HH:MM
  end_time: string; // HH:MM
  created_at: string;
  user_name: string; // joined: "First L."
}
