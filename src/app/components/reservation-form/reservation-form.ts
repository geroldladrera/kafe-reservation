import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReservationService } from '../../services/reservation';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';


@Component({
  selector: 'app-reservation-form',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatButtonModule,
    MatCheckboxModule,
    MatRadioModule,
    MatSnackBarModule,
    FormsModule,
    CommonModule
  ],
  templateUrl: './reservation-form.html',
  styleUrls: ['./reservation-form.css']
})

export class ReservationFormComponent implements OnInit {
  minDate = new Date(2024, 6, 24); // July is 6 (0-based index)
  maxDate = new Date(2024, 6, 31);
  unavailableSlots: string[] = ['19:30', '20:00']; // Dummy unavailable slots

  timeSlots: string[] = [];
  reservation: any = {};
  errorMessage = '';

  regions = [
    { name: 'Main Hall', maxSize: 12, childrenAllowed: true, smokingAllowed: false },
    { name: 'Bar', maxSize: 4, childrenAllowed: false, smokingAllowed: false },
    { name: 'Riverside', maxSize: 8, childrenAllowed: true, smokingAllowed: false },
    { name: 'Riverside (Smoking)', maxSize: 6, childrenAllowed: false, smokingAllowed: true }
  ];

  constructor(
    private reservationService: ReservationService,
    private snackBar: MatSnackBar
    ) {}

  ngOnInit() {
    this.generateTimeSlots();
  }

  getUnavailableSlots(): string[] {
    if (!this.reservation.date) return [];
    const dateKey = this.reservation.date.toISOString().split('T')[0];
    return this.unavailableSlotsByDate[dateKey] || [];
  }
  
  getAvailableSlotsCount(): number {
    const unavailable = this.getUnavailableSlots();
    return this.timeSlots.length - unavailable.length;
  }

  isSlotUnavailable(slot: string): boolean {
    return this.getUnavailableSlots().includes(slot);
  }

  // Example booked slots by date
  unavailableSlotsByDate: { [key: string]: string[] } = {
    '2024-07-24': ['18:00', '18:30'],
    '2024-07-25': ['19:30', '20:00'],
    '2024-07-26': ['20:30'],
  };

  generateTimeSlots() {
    this.timeSlots = []; // reset to avoid duplicates
    const startHour = 18; // 6 PM
    const endHour = 22;   // 10 PM
    for (let hour = startHour; hour < endHour; hour++) {
      this.timeSlots.push(`${hour}:00`);
      this.timeSlots.push(`${hour}:30`);
    }
    console.log('Generated time slots:', this.timeSlots);
  }

  onRegionChange() {
    const selected = this.regions.find(r => r.name === this.reservation.region);
    if (!selected) return;
  
    this.errorMessage = ''; // reset first

    if (this.reservation.partySize > selected.maxSize) {
      this.errorMessage = `Max size for ${selected.name} is ${selected.maxSize}`;
      return;
    }

    if (this.reservation.hasChildren && !selected.childrenAllowed) {
      this.errorMessage = `${selected.name} does not allow children.`;
      return;
    }

    if (this.reservation.smoking && !selected.smokingAllowed) {
      this.errorMessage = `${selected.name} does not allow smoking.`;
      return;
    }

  }

  validateConstraints() {
    const selected = this.regions.find(r => r.name === this.reservation.region);
    if (!selected) return;
  
    if (this.reservation.partySize > selected.maxSize) {
      this.errorMessage = `Max size for ${selected.name} is ${selected.maxSize}`;
      return;
    }
  
    if (this.reservation.hasChildren && !selected.childrenAllowed) {
      this.errorMessage = `${selected.name} does not allow children.`;
      return;
    }
  
    if (this.reservation.smoking && !selected.smokingAllowed) {
      this.errorMessage = `${selected.name} does not allow smoking.`;
      return;
    }
  
    this.errorMessage = '';
  }
  

  onSubmit() {
    const isAvailable = this.reservationService.checkAvailability(this.reservation);
    if (!isAvailable) {
      this.errorMessage = 'This slot is no longer available. Please select another.';
      return;
    }
  
    const dateKey = this.reservation.date.toISOString().split('T')[0];
    if (!this.unavailableSlotsByDate[dateKey]) {
      this.unavailableSlotsByDate[dateKey] = [];
    }
    this.unavailableSlotsByDate[dateKey].push(this.reservation.time);
  
    this.reservationService.reserve(this.reservation);
  
    // Show snackbar
    this.snackBar.open('Reservation confirmed!', 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  
    // Reset the form
    this.reservation = {};
  }
  
}
