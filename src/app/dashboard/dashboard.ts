import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {
  shift = {
    shiftDate: '',
    shiftNo: '',
    openingTime: '',
    closingTime: '',
    entries: [{ pump: '', nozzle: '', fuelType: 'Petrol', opening: 0, closing: 0, sales: 0, operatorName: '' }],
    paymentModes: {
      cash: 0,
      card: 0,
      upi: 0,
      credit: 0
    },
    expenses: [{ description: '', amount: 0 }],
    comments: ''
  };
  ngOnInit() {

}

  addRow() {
    this.shift.entries.push({ pump: '', nozzle: '', fuelType: 'Petrol', opening: 0, closing: 0, sales: 0, operatorName: '' });
  }

  removeRow(index: number) {
    this.shift.entries.splice(index, 1);
    this.updateTotalSales();
  }

  updateSales(index: number) {
    const entry = this.shift.entries[index];
    entry.sales = Math.max(0, entry.closing - entry.opening);
    this.updateTotalSales();
  }

  updateTotalSales() {
    this.shift.entries.forEach(entry => entry.sales = Math.max(0, entry.closing - entry.opening));
  }

  get totalSales() {
    return this.shift.entries.reduce((acc, entry) => acc + entry.sales, 0);
  }
}
