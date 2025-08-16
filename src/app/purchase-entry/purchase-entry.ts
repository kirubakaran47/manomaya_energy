import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-purchase-entry',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './purchase-entry.html',
  styleUrl: './purchase-entry.css'
})
export class PurchaseEntry {

}
