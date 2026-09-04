import { api } from './api';
import { TimelineEvent } from '../types';

class TimelineService {
  async getEvents(): Promise<TimelineEvent[]> {
    const response = await api.get<TimelineEvent[]>('/timeline');
    return response.data;
  }

  async addEvent(event: TimelineEvent): Promise<TimelineEvent> {
    const response = await api.post<TimelineEvent>('/timeline', event);
    return response.data;
  }
}

export const timelineService = new TimelineService();
