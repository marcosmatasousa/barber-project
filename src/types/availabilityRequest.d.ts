interface availabilityDate {
  date: string;
  startTime: string;
  endTime: string;
}

export interface agendaRequestBody {
  availabilityDates: availabilityDate[];
}
