export interface Event {
  id: number;
  name: string;
  description?: string;
  venue: string;
  dateTime: string;
  category: string;
  capacity: number;
}
