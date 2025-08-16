import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Server } from '../server';
import iziToast from 'izitoast';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-rps-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rps-details.html',
  styleUrl: './rps-details.css'
})
export class RpsDetails implements OnInit {
  isLoading = false;
  savedRows: any[] = [];
  limit: string = '10';
  offset: string = '0';
  rows: any[] = [
    { date: '', category: 'MS', liters: '', rate: '', errors: {} }
  ];
  editingIndex: number | null = null;
  isEditMode: boolean = false;
  editingRpsId: string | null = null;
  editRowData: any = {};
  constructor(private http: HttpClient, private serverService: Server) { }

  ngOnInit(): void {
    this.fetchRpsList();
  }

  addRow() {
    this.rows.push({ date: '', category: 'MS', liters: '', rate: '', errors: {} });
  }

  removeRow(index: number) {
    if (this.rows.length > 1) {
      this.rows.splice(index, 1);
    }
  }

  validateRow(row: any): boolean {
    row.errors = {};

    if (!row.date) {
      row.errors.date = 'Date is required.';
    }

    if (!row.category) {
      row.errors.category = 'Category is required.';
    }

    if (!row.liters || row.liters <= 0) {
      row.errors.liters = 'Liters must be greater than 0.';
    }

    if (!row.rate || row.rate <= 0) {
      row.errors.rate = 'Rate must be greater than 0.';
    }

    return Object.keys(row.errors).length === 0;
  }

    // Fetch saved RPS entries
  fetchRpsList(): void {
    setTimeout(() => {
      this.isLoading = true;
    }, 800);
    const user_id = localStorage.getItem('user_id');
    const requestData = {
      moduleType: 'RpsDetail',
      api_type: 'api',
      api_url: 'rpsList',
      user_id: user_id,
      category_name: '',
      limit: this.limit,
      offset: this.offset
    };

    this.serverService.sendServer(requestData).subscribe({
      next: (response: any) => {
        if (response?.data) {
          this.isLoading = false;
          this.savedRows = response.data;
        }
        
      }
    });
  }

  // Save all valid rows
  saveRps(): void {
    this.isLoading = true;
    const user_id = localStorage.getItem('user_id');
    const validRows = this.rows.filter(row => this.validateRow(row));

    if (validRows.length === 0) {
      this.isLoading = false;
      iziToast.error({
        message: 'Please correct the errors before saving.',
        position: 'topRight'
      });
      return;
    }

    validRows.forEach((row, index) => {
      const requestData = {
        moduleType: 'RpsDetail',
        api_type: 'api',
        api_url: 'rpsSave',
        user_id: user_id,
        date: row.date,
        category_name: row.category,
        number_of_liters: row.liters,
        rate: row.rate
      };

      this.serverService.sendServer(requestData).subscribe({
        next: (response: any) => {
          this.isLoading = false;
          if (response.status === true || response?.message === 'RPS details added successfully') {
            if (index === validRows.length - 1) {
              
              iziToast.success({
                message: 'RpsDetail saved Successfully',
                position: 'topRight'
              });
             
              this.fetchRpsList();
            }
               this.rows = [{ date: '', category: 'MS', liters: '', rate: '', errors: {} }];
          } else {
            iziToast.error({
              message: response?.message || 'Failed to save a record',
              position: 'topRight'
            });
          }
        },
        error: (error: any) => {
          this.isLoading = false;
          console.error(error);
          iziToast.error({
            message: 'Network error while saving.',
            position: 'topRight'
          });
        }
      });
    });
  }



editRpsDetails(index: number): void {
  const row = this.savedRows[index];
  const rpsId = row?.id;
  if (!rpsId) return;

  this.isLoading = true;
  const accessToken = localStorage.getItem('access_token');

  fetch(`https://petrosoul.com/manomaya_energy/api/rpsEdit/${rpsId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json'
    }
  })
    .then(res => res.json())
    .then(data => {
      this.isLoading = false;

      if (data.status || data.data) {
        const rpsData = data.data;

        // Enable edit mode
        this.isEditMode = true;
        this.editingRpsId = rpsId;

        // Populate editable row
        this.rows = [{
          date: rpsData.date,
          category: rpsData.category_name,
          liters: rpsData.number_of_liters,
          rate: rpsData.rate,
          errors: {}
        }];
      } else {
        iziToast.error({
          message: data.message || 'Failed to fetch RPS details',
          position: 'topRight'
        });
      }
    })
    .catch(err => {
      this.isLoading = false;
      console.error(err);
      iziToast.error({
        message: 'Network error occurred',
        position: 'topRight'
      });
    });
}

updateRps(): void {
  this.isLoading = true;
  const user_id = localStorage.getItem('user_id');
  const row = this.rows[0];

  if (!this.editingRpsId) return;

  const requestData = {
    moduleType: 'RpsDetail',
    api_type: 'api',
    api_url: 'rpsUpdate',
    user_id: user_id,
    date: row.date,
    category_name: row.category,
    number_of_liters: row.liters,
    rate: row.rate,
    id: this.editingRpsId
  };

  this.serverService.sendServer(requestData).subscribe({
    next: (response: any) => {
      this.isLoading = false;
      if (response?.status === true || response?.message === 'RPS details update successfully') {
        iziToast.success({
          message: 'RPS record updated successfully.',
          position: 'topRight'
        });

        // Reset form and flags
        this.rows = [{ date: '', category: 'MS', liters: '', rate: '', errors: {} }];
        this.isEditMode = false;
        this.editingRpsId = null;

        this.fetchRpsList();
      } else {
        iziToast.error({
          message: response?.message || 'Failed to update record',
          position: 'topRight'
        });
      }
    },
    error: (error: any) => {
      this.isLoading = false;
      console.error(error);
      iziToast.error({
        message: 'Network error occurred during update.',
        position: 'topRight'
      });
    }
  });
}

// saveEdit(): void {
//   if (this.editingIndex !== null) {
//     this.savedRows[this.editingIndex] = { ...this.editRowData };
//     this.editingIndex = null;
//     this.editRowData = {};
//     iziToast.success({ message: 'Row updated successfully.', position: 'topRight' });
//   }
// }


  deleteRpsdetsils(index: number): void {
    const rpsdetails = this.savedRows[index];
    if (!rpsdetails?.id) return;

    Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete "${rpsdetails?.id}". This action cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then(async (result) => {
      if (result.isConfirmed) {
        Swal.fire({ title: 'Deleting...', allowOutsideClick: false });
        Swal.showLoading();

        const accessToken = localStorage.getItem('access_token');

        try {
          const response = await fetch(`https://petrosoul.com/manomaya_energy/api/rpsDelete/${rpsdetails.id}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Accept': 'application/json'
            }
          });

          const resData = await response.json();

          Swal.close();

          if (resData.status === true || resData.message === 'RPS details deleted successfully') {
            iziToast.success({
              message: 'RPS details deleted successfully!',
              position: 'topRight'
            });

            this.fetchRpsList();
          } else {
            iziToast.error({
              message: resData.message || 'Delete failed',
              position: 'topRight'
            });
          }
        } catch (err) {
          Swal.close();
          console.error(err);
          iziToast.error({
            message: 'Network error occurred',
            position: 'topRight'
          });
        }
      }
    });
  }
}
