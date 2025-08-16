import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { Server } from '../server';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import iziToast from 'izitoast';

@Component({
  selector: 'app-shift-entry',
  standalone: true,
  imports: [NgSelectModule, CommonModule, FormsModule],
  templateUrl: './shift-entry.html',
  styleUrls: ['./shift-entry.css']
})

export class ShiftEntry {
  constructor(private serverService: Server, private http: HttpClient) {

  }

  pumpSelection: { [key: string]: boolean } = {
    // 'pump1-nozzle1-petrol': false,
    // 'pump1-nozzle2-diesel': false,
    // 'pump2-nozzle1-petrol': false,
    // 'pump2-nozzle2-diesel': false
  };
  isLoading: boolean = false;
  rpsPrice: any[] = [];
  operators: any[] = [];
  keyword: string = '';
  isPumpSelectedA: boolean = false;
  isPumpSelectedB: boolean = false;
  errorMessages: string[] = [];

  selectedPump: null | undefined;
  shiftA = {
    entries: [{
      shiftDate: '',
      pump: '',
      shift: '',
      nozzle: '',
      fuelType: '',
      opening: 0,
      closing: 0,
      sales: 0,
      operatorId: 0,
      operatorName: '',
      price: 0,
      total: 0,
      shiftcoins: 0,
      shiftgpay: 0,
      shiftphonepe: 0,
      shiftswiping: 0,
      shiftcash: 0,
      shiftcredit: 0,
      shifttotal: 0,
      shiftreceipt: 0,
      shiftgrandtotal: 0,
      shiftfueltotal: 0,
      shifttest: 0,
      shiftoilsales: 0,
      shiftdiscount: 0,
      shiftextrafuel: 0,
      shiftgtotal: 0,
      shiftdifference: 0,
      errors: {} as Record<string, string>
    }],
  };


  shiftB = {
    entries: [{
      shiftDate: '',
      pump: '',
      shift: '',
      nozzle: '',
      fuelType: '',
      opening: 0,
      closing: 0,
      sales: 0,
      operatorId: 0,
      operatorName: '',
      price: 0,
      total: 0,
      shiftcoins: 0,
      shiftgpay: 0,
      shiftphonepe: 0,
      shiftswiping: 0,
      shiftcash: 0,
      shiftcredit: 0,
      shifttotal: 0,
      shiftreceipt: 0,
      shiftgrandtotal: 0,
      shiftfueltotal: 0,
      shifttest: 0,
      shiftoilsales: 0,
      shiftdiscount: 0,
      shiftextrafuel: 0,
      shiftgtotal: 0,
      shiftdifference: 0,
      errors: {} as Record<string, string>
    }],
  };

  ngOnInit() {
    const today = new Date();
    const ddMMyyyy = today.toISOString().split('T')[0];
    this.shiftA.entries[0].shiftDate = ddMMyyyy;
    this.shiftB.entries[0].shiftDate = ddMMyyyy;
    this.getOperator();
    this.getRpsprice();
  }

  getOperator(keyword: string = ''): void {
    const user_id = localStorage.getItem('user_id');
    const requestData = {
      moduleType: 'shift_entry',
      api_type: 'api',
      api_url: 'get_operators',
      user_id: user_id,
      keyword: keyword,
    };
    this.serverService.sendServer(requestData).subscribe({
      next: (response: any) => {
        console.log('Login Response:', response);

        // Check if the response contains the operator list and assign it to operators
        if (response && response.operator_list) {
          this.operators = response.operator_list.map((op: any) => ({
            id: op.user_id,
            name: op.full_name
          }));
        }
      },
      error: (err) => {
        console.error('Error fetching operators:', err);
      }
    });
  }
  onOperatorChange(selected: any, index: number) {
    if (selected) {
      this.shiftA.entries[index].operatorId = selected.id;
      this.shiftA.entries[index].operatorName = selected.name;
      this.shiftB.entries[index].operatorId = selected.id;
      this.shiftB.entries[index].operatorName = selected.name;
      console.log('Operator selected:', selected.id, selected.name);
    } else {
      this.shiftA.entries[index].operatorId = 0;
      this.shiftB.entries[index].operatorName = '';
      this.shiftB.entries[index].operatorId = 0;
      this.shiftA.entries[index].operatorName = '';
      console.log('Operator cleared');
    }
  }

  getRpsprice(callback?: () => void): void {
    const accessToken = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json'
    });

    this.http.get<any>('https://petrosoul.com/manomaya_energy/api/get_price', { headers }).subscribe({
      next: (res) => {
        this.rpsPrice = res.data;
        console.log('Price list:', this.rpsPrice);
         if (callback) callback();
      },
      error: (err) => {
        console.error('Failed to load roles:', err);
      }
    });
  }
  onSearchChange(event: any): void {
    this.keyword = event.term;
    this.getOperator(this.keyword);
  }

  private n(v: any): number { return typeof v === 'number' ? v : parseFloat(v) || 0; }

  private updateSales(entry: any) {
    entry.sales = Math.max(0, this.n(entry.closing) - this.n(entry.opening));
    entry.total = +((this.n(entry.sales) * this.n(entry.price))).toFixed(2);
  }
  private calculateTotals(entries: any[]) {
    // this.clearError(0, 'total');
    // this.clearError(0, 'price');
    entries.forEach(e => {
      e.total = +((this.n(e.sales) * this.n(e.price))).toFixed(2);
    });

    const e0 = entries[0];

    // 1. Fuel Total
    e0.shiftfueltotal = +(
      entries.reduce((sum, e) => sum + this.n(e.total), 0)
    ).toFixed(2);

    // 2. Gross Total Calculation
    e0.shiftgtotal = +(
      this.n(e0.shiftfueltotal)
      - this.n(e0.shifttest)
      + this.n(e0.shiftoilsales)
      - this.n(e0.shiftdiscount)
      - this.n(e0.shiftextrafuel)
    ).toFixed(2);

    // 3. Total Payment Modes
    e0.shifttotal = +(
      this.n(e0.shiftcoins) +
      this.n(e0.shiftgpay) +
      this.n(e0.shiftphonepe) +
      this.n(e0.shiftswiping) +
      this.n(e0.shiftcash) +
      this.n(e0.shiftcredit)
    ).toFixed(2);

    // 4. Grand Total
    e0.shiftgrandtotal = +(
      this.n(e0.shifttotal) - this.n(e0.shiftreceipt)
    ).toFixed(2);

    // 5. Difference
    e0.shiftdifference = +(
      this.n(e0.shiftgrandtotal) - this.n(e0.shiftgtotal)
    ).toFixed(2);
  }
  updateSalesA(index: number) {
    this.updateSales(this.shiftA.entries[index]);
    this.calculateTotals(this.shiftA.entries);
  }

  updateSalesB(index: number) {
    this.updateSales(this.shiftB.entries[index]);
    this.calculateTotals(this.shiftB.entries);
  }

  calculateTotalsA() {
    this.calculateTotals(this.shiftA.entries);
  }

  calculateTotalsB() {
    this.calculateTotals(this.shiftB.entries);
  }


saveShift(shift: any, label: string) {
  this.isLoading = true;
  const user_id = localStorage.getItem('user_id');
  if (this.isValidShiftInline(shift)) {
    const entry = shift.entries[0];

    const requestData = {
      moduleType: "shift_entry",
      api_type: "api",
      api_url: "shiftEntrySave",
      user_id: user_id,
      shift_entry: {
        shift_date: entry.shiftDate,
        shift: entry.shift,
        pump_no: entry.pump,
        nozzle: entry.nozzle,
        fuel_type: entry.fuelType,
        opening_reading: entry.opening,
        closing_reading: entry.closing,
        total_sales: entry.sales,
        operator_id: entry.operatorId,
        operator_name: entry.operatorName,
        test_fuel: entry.shifttest,
        oil_sale: entry.shiftoilsales,
        discount_per: 0,
        discount: entry.shiftdiscount,
        extra_fuel: entry.shiftextrafuel,
        coins: entry.shiftcoins,
        gpay: entry.shiftgpay,
        phonepe: entry.shiftphonepe,
        swipping: entry.shiftswiping,
        cash: entry.shiftcash,
        credit: entry.shiftcredit,
        payment_total: entry.shifttotal,
        receipt: entry.shiftreceipt,
        grand_total_1: entry.shiftgrandtotal,
        grand_total_2: entry.shiftgtotal,
        difference: entry.shiftdifference
      }
    };

    this.serverService.sendServer(requestData).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        if (response.status) {
          iziToast.success({
            message: `Shift ${label} saved successfully!`,
            position: 'topRight',
            timeout: 3000
          });
          this.onCancelA();  // Assuming same for both, rename if different
        } else {
          iziToast.error({
            message: response.message || `Failed to save Shift ${label}`,
            position: 'topRight',
            timeout: 5000
          });
        }
      },
      error: (err) => {
        this.isLoading = false;
        iziToast.error({
          message: `Server error while saving Shift ${label}`,
          position: 'topRight',
          timeout: 5000
        });
        console.error(`Shift ${label} save error:`, err);
      }
    });

  } else {
    this.isLoading = false;
    iziToast.error({
      message: `Validation error while saving Shift ${label}`,
      position: 'topRight',
    });
  }
}

saveShiftA() {
  this.saveShift(this.shiftA, 'A');
}

saveShiftB() {
  this.saveShift(this.shiftB, 'B');
}


  clearError(entryIndex: number, fieldName: string) {
    if (this.shiftA.entries[entryIndex].errors?.[fieldName]) {
      delete this.shiftA.entries[entryIndex].errors[fieldName];
    }
    if (this.shiftB.entries[entryIndex].errors?.[fieldName]) {
      delete this.shiftB.entries[entryIndex].errors[fieldName];
    }
  }



  isValidShiftInline(shift: any): boolean {
    let isValid = true;

    const requiredFields: { key: string; message: string }[] = [
      { key: 'opening', message: 'Opening cannot be greater than Closing.' },
      { key: 'operatorId', message: 'Operator Name is required.' },
      { key: 'shiftDate', message: 'Shift Date is required.' },
      { key: 'pump', message: 'Pump Entry is required.' },
      { key: 'shift', message: 'Shift Entry is required.' },
      { key: 'nozzle', message: 'Fuel Type Entry is required.' },
      { key: 'closing', message: 'Closing Entry is required.' },
      { key: 'sales', message: 'Sales Entry is required.' },
      { key: 'price', message: 'Price Entry is required.' },
      { key: 'total', message: 'Total Entry is required.' },
      { key: 'shifttotal', message: 'Total Entry is required.' },
      { key: 'shiftgrandtotal', message: 'Grand Total Entry is required.' },
      { key: 'shiftfueltotal', message: 'Fuel Total Amount Entry is required.' },
      { key: 'shiftgtotal', message: 'Grand Total Entry is required.' },
    ];

    for (const entry of shift.entries) {
      entry.errors = {};

      for (const field of requiredFields) {
        if (!entry[field.key]) {
          entry.errors[field.key] = field.message;
          isValid = false;
        }
      }
    }

    return isValid;
  }



  nozzleFuelMap: any = {
    MS1: 'Petrol',
    MS2: 'Petrol',
    HSD1: 'Diesel',
    HSD2: 'Diesel'
  };

  getFuelTypeByNozzle(nozzle: string): string {
    return this.nozzleFuelMap[nozzle] || '';
  }

  // Shared method to handle pump selection
  private handlePumpSelection(
    pumpKey: string,
    shift: any,
    shiftFlag: 'A' | 'B'
  ): void {
    this.pumpSelection = {};
    this.pumpSelection[pumpKey] = true;

    if (shiftFlag === 'A') {
      this.isPumpSelectedA = true;
    } else {
      this.isPumpSelectedB = true;
    }

    const [pump, shiftValue, fuel] = pumpKey.split('-');
    const entry = shift.entries[0];

    // ✅ Pump number, shift, nozzle
    entry.pump = parseInt(pump.replace('pump', ''), 10);
    entry.shift = shiftValue.replace('shift', 'Shift ');
    entry.nozzle = fuel.toUpperCase();

    // ✅ Human-readable fuel type (Petrol/Diesel)
    entry.fuelType = this.getFuelTypeByNozzle(entry.nozzle);

    // ✅ Internal fuel code for price lookup only
    const fuelCategory = fuel.replace(/[0-9]/g, '').toUpperCase();

    // Reset fields
    const resetFields: { [key: string]: any } = {
      opening: 0,
      closing: 0,
      sales: 0,
      operatorId: '',
      price: 0,
      total: 0,
      shiftcoins: 0,
      shiftgpay: 0,
      shiftphonepe: 0,
      shiftswiping: 0,
      shiftcash: 0,
      shiftcredit: 0,
      shifttotal: 0,
      shiftreceipt: 0,
      shiftgrandtotal: 0,
      shiftfueltotal: 0,
      shifttest: 0,
      shiftoilsales: 0,
      shiftdiscount: 0,
      shiftextrafuel: 0,
      shiftgtotal: 0,
      shiftdifference: 0,
    };

    for (const key in resetFields) {
      entry[key] = resetFields[key];
    }

    // ✅ Price lookup with fuelCategory (MS/HSD)
    if (!entry.shiftDate) {
    entry.shiftDate = new Date().toISOString().split('T')[0];
  }
 if (!this.rpsPrice || !this.rpsPrice.length) {
    this.getRpsprice(() => {
      this.setFuelPrice(entry, fuelCategory);
    });
  } else {
    this.setFuelPrice(entry, fuelCategory);
  }
  }
private setFuelPrice(entry: any, fuelCategory: string) {
  const priceData = this.rpsPrice.find(
    (item: any) =>
      item.category_name.toUpperCase() === fuelCategory &&
      item.date === entry.shiftDate
  );

  if (priceData) {
    entry.price = +priceData.rate;
    console.log(`✅ Price set for ${fuelCategory}:`, entry.price);
  } else {
    console.warn(`⚠️ No price found for ${fuelCategory} on ${entry.shiftDate}`);
  }
}
  // Public wrapper methods
  onPumpSelectedA(pumpKey: string): void {
    this.handlePumpSelection(pumpKey, this.shiftA, 'A');
  }

  onPumpSelectedB(pumpKey: string): void {
    this.handlePumpSelection(pumpKey, this.shiftB, 'B');
  }

  onShiftTabChange(shift: 'A' | 'B'): void {
    this.selectedPump = null;
    this.isPumpSelectedA = false;
    this.isPumpSelectedB = false;

    Object.keys(this.pumpSelection).forEach(key => {
      this.pumpSelection[key] = false;
    });
  }
  onCancelA() {
    Object.keys(this.pumpSelection).forEach(key => {
      this.pumpSelection[key] = false;
    });
    this.isPumpSelectedA = false;
  }
  onCancelB() {
    Object.keys(this.pumpSelection).forEach(key => {
      this.pumpSelection[key] = false;
    });
    this.isPumpSelectedB = false;
  }
}
