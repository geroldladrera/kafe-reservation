import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private reservations: any[] = [];

  checkAvailability(reservation: any): boolean {
    // no double booking at same date/time
    return !this.reservations.some(r =>
      r.date === reservation.date &&
      r.time === reservation.time &&
      r.region === reservation.region
    );
  }

  reserve(reservation: any) {
    this.reservations.push(reservation);
  }
}
