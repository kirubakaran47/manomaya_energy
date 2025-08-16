import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
declare var $: any;

@Component({
  selector: 'app-stock',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './stock.html',
  styleUrl: './stock.css'
})
export class Stock {
salesEntries = [
  { id: 1, date: '2025-07-28', categoryName: 'Petrol', liters: 155.00, rate: 103.39, unitPrice: 98.00, supplierName: 'Nayara' },
  { id: 2, date: '2025-07-28', categoryName: 'Diesel', liters: 150.00, rate: 101.39, unitPrice: 94.00, supplierName: 'Nayara' },
  { id: 3, date: '2025-07-29', categoryName: 'Petrol', liters: 160.00, rate: 103.30, unitPrice: 98.50, supplierName: 'Nayara' },
  { id: 4, date: '2025-07-29', categoryName: 'Diesel', liters: 180.00, rate: 101.35, unitPrice: 95.00, supplierName: 'Nayara' }
];
currentEntry: any = null;

constructor() { }

ngOnInit(): void {
}

 openEditModal(entry: any): void {
    this.currentEntry = { ...entry }; 
    $('#editFuelModal').modal('show'); 
  }

updateEntry(): void {
  if (this.currentEntry) {
    const updatedIndex = this.salesEntries.findIndex(entry => entry.id === this.currentEntry.id);
    if (updatedIndex > -1) {
      this.salesEntries[updatedIndex] = { ...this.currentEntry };
    }
    this.closeModal();
  }
}
 deleteEntry(id: number): void {
  const index = this.salesEntries.findIndex(entry => entry.id === id);
  if (index > -1) {
    this.salesEntries.splice(index, 1);
 }
}
 closeModal(): void {
  this.currentEntry = null;
  $('#editFuelModal').modal('hide'); 
 }
}
 