interface availabilityDate {
  date: string;
  startTime: string;
  endTime: string;
}

export interface availabilityRequestBody {
  availabilityDates: availabilityDate[];
}
