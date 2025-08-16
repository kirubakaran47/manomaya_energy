import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, AbstractControl, Validators, ValidationErrors } from '@angular/forms';
import { Server } from '../server';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import iziToast from 'izitoast';
import Swal from 'sweetalert2';
declare var $: any;

type RoleKey =
  | 'dashboard'
  | 'shift_entry'
  | 'purchase_entry'
  | 'staff'
  | 'manage_product'
  | 'add_vendor'
  | 'vendor_details'
  | 'rps_details'
  | 'user_profile';
interface RolePermission {
  read: number;
  edit: number;
  delete: number;
  add: number;
}

@Component({
  selector: 'app-user-detsils',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './user-detsils.html',
  styleUrl: './user-detsils.css'
})
export class UserDetsils {
  isLoading = false;
  selectedUser: any;
  isUserVisible: boolean = false;
  editForm!: FormGroup;
  // editIndex: number = -1;
  users: any[] = [];
  limit: string = '50';
  offset: string = '0';
  preview: any = {
    profile: '',
    passbook: '',
    pancard: '',
    aadhar: ''
  };
  roles: any[] = [];
  id: any;
  editData: any;
  files: any = {};
  uploadedFiles: { [key: string]: File | null } = {
    profile: null,
    passbook: null,
    pancard: null,
    aadhar: null,
  };
  resetPasswordForm!: FormGroup;
  constructor(private serverService: Server, private fb: FormBuilder, private http: HttpClient) { }
  ngOnInit(): void {
    // $(document).ready(function () {
    //   $('#user_datatable').DataTable();
    // });
    this.editForm = this.fb.group({
      username: ['', Validators.required],
      fullname: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      email: [''],
      address: ['', Validators.required],
      address2: [''],
      address3: [''],
      city: ['', Validators.required],
      state: ['', Validators.required],
      country: ['', Validators.required],
      pincode: ['', [Validators.required, Validators.pattern(/^[0-9]{6}$/)]],
      gender: ['', Validators.required],
      status: ['', Validators.required],
      access: ['', Validators.required],
      profile: ['', [Validators.required]],
      passbook: ['', [Validators.required]],
      pancard: ['', [Validators.required]],
      aadhar: ['', [Validators.required]],
    });

    this.resetPasswordForm = this.fb.group({
      current_password: ['', Validators.required],
      new_password: ['', [Validators.required, Validators.minLength(6)]],
      confirm_password: ['', Validators.required]
    }, {
      validators: [
        this.passwordMismatchValidator,
        this.newPasswordNotSameAsCurrentValidator
      ]
    });
    this.getRoles();
    this.fetchUsers();
  }
  // fileValidator(control: AbstractControl): ValidationErrors | null {
  //   return control.value && control.value.length ? null : { fileRequired: true };
  // }

  fetchUsers() {
    setTimeout(() => {
      this.isLoading = true;
    }, 800);
    const username = localStorage.getItem('username');
    const user_id = localStorage.getItem('user_id');
    const requestData = {
      moduleType: 'user',
      api_type: 'api',
      api_url: 'userReport',
      user_id: user_id,
      id: '',
      username: '',
      limit: this.limit,
      offset: this.offset
    };

    this.serverService.sendServer(requestData).subscribe({
      next: (response: any) => {
        if (response.status && response.data) {
          this.isLoading = false;
          this.users = response.data;
          this.id = response.data.id
          const table = $('#user_datatable').DataTable();
          table.destroy();

          // Re-init after short delay to ensure DOM is updated
          setTimeout(() => {
            $('#user_datatable').DataTable();
          }, 0);
        }
      }
    });
  }


  roleMap: Record<RoleKey, RolePermission> = {
    dashboard: { read: 101, add: 102, edit: 103, delete: 104 },
    shift_entry: { read: 111, add: 112, edit: 113, delete: 114 },
    purchase_entry: { read: 121, add: 122, edit: 123, delete: 124 },
    staff: { read: 131, add: 132, edit: 133, delete: 134 },
    manage_product: { read: 141, add: 142, edit: 143, delete: 144 },
    add_vendor: { read: 151, add: 152, edit: 153, delete: 154 },
    vendor_details: { read: 161, add: 162, edit: 163, delete: 164 },
    rps_details: { read: 171, add: 172, edit: 173, delete: 174 },
    user_profile: { read: 181, add: 182, edit: 183, delete: 184 }
  };
  selectedRoles: number[] = [];

  toggleAll(permissionType: 'read' | 'add' | 'edit' | 'delete', event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;

    Object.keys(this.roleMap).forEach((key) => {
      const roleKey = key as RoleKey;
      const permissionCode = this.roleMap[roleKey][permissionType];

      const alreadySelected = this.selectedRoles.includes(permissionCode);

      if (isChecked && !alreadySelected) {
        this.selectedRoles.push(permissionCode);
      }

      if (!isChecked && alreadySelected) {
        this.selectedRoles = this.selectedRoles.filter(code => code !== permissionCode);
      }
    });

    console.log('Selected Roles after toggleAll:', this.selectedRoles);
  }

  togglePermission(roleKey: RoleKey, permissionType: keyof RolePermission, event: any) {
    const permissionCode = this.roleMap[roleKey][permissionType];
    const isChecked = event.target.checked;

    if (isChecked) {
      if (!this.selectedRoles.includes(permissionCode)) {
        this.selectedRoles.push(permissionCode);
      }
    } else {
      this.selectedRoles = this.selectedRoles.filter(code => code !== permissionCode);
    }

    console.log('Selected Permissions:', this.selectedRoles);
  }

  getRoles(): void {
    const accessToken = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json'
    });

    this.http.get<any[]>('https://petrosoul.com/manomaya_energy/api/roles', { headers }).subscribe({
      next: (data) => {
        this.roles = data.filter(role => role.status === 1);
      },
      error: (err) => {
        console.error('Failed to load roles:', err);
      }
    });
  }

  editUser(user: any, index: number): void {
    this.isLoading = true;
    this.selectedUser = user;
    const requestData = {
      moduleType: 'user',
      api_type: 'api',
      api_url: 'userEdit',
      user_id: user.id,
      id: user.id
    };

    this.serverService.sendServer(requestData).subscribe({
      next: (response: any) => {
        if (response.status && response.data) {
          const data = response.data;
          this.isLoading = false;
          //  Set form values with the fetched data
          this.editForm.patchValue({
            username: data.username || '',
            fullname: data.full_name || '',
            email: data.email || '',
            phone: data.phone || '',
            address: data.address_1 || '',
            address2: data.address_2 || '',
            address3: data.address_3 || '',
            city: data.city || '',
            state: data.state || '',
            country: data.country || '',
            pincode: data.pincode || '',
            gender: data.gender || '',
            status: data.active_status || '',
            access: data.role_id || '',
          });

          // 🖼️ Preview images
          this.preview = {
            profile: data.profile_image_url || '',
            passbook: data.bank_passbook_url || '',
            pancard: data.pancard_url || '',
            aadhar: data.aadhar_url || '',
          };

          // 👇 Dynamically remove required validators if image already exists
          if (this.preview.profile) {
            this.editForm.get('profile')?.clearValidators();
            this.editForm.get('profile')?.updateValueAndValidity();
          }
          if (this.preview.passbook) {
            this.editForm.get('passbook')?.clearValidators();
            this.editForm.get('passbook')?.updateValueAndValidity();
          }
          if (this.preview.pancard) {
            this.editForm.get('pancard')?.clearValidators();
            this.editForm.get('pancard')?.updateValueAndValidity();
          }
          if (this.preview.aadhar) {
            this.editForm.get('aadhar')?.clearValidators();
            this.editForm.get('aadhar')?.updateValueAndValidity();
          }

          // ✅ Role Permissions
          try {
            if (typeof data.roles === 'string') {
              this.selectedRoles = JSON.parse(data.roles.replace(/'/g, '"'));
            } else if (Array.isArray(data.roles)) {
              this.selectedRoles = data.roles;
            } else {
              this.selectedRoles = [];
            }
          } catch (err) {
            // console.error('Role parsing error:', err);
            this.selectedRoles = [];
          }

          // Show modal
          $('#editUserModal').modal('show');
        } else {
          console.warn('No user data found in response.');
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Failed to fetch user data:', err);
      }
    });
  }


  async updateUser() {
    // Mark all fields as touched
    Object.keys(this.editForm.controls).forEach(controlName => {
      const control = this.editForm.get(controlName);
      if (control) {
        control.markAsTouched();
      }
    });

    if (this.editForm.valid) {
      const formData = new FormData();

      // Append all form fields
      formData.append('username', this.editForm.value.username);
      formData.append('full_name', this.editForm.value.fullname);
      formData.append('email', this.editForm.value.email);
      formData.append('phone', this.editForm.value.phone);
      formData.append('address_1', this.editForm.value.address);
      formData.append('address_2', this.editForm.value.address2 || '');
      formData.append('address_3', this.editForm.value.address3 || '');
      formData.append('city', this.editForm.value.city);
      formData.append('state', this.editForm.value.state);
      formData.append('country', this.editForm.value.country);
      formData.append('pincode', this.editForm.value.pincode);
      formData.append('gender', this.editForm.value.gender);
      formData.append('role_id', this.editForm.value.access);
      formData.append('active_status', this.editForm.value.status);

      // Append files

      if (this.files['profile']) {
        formData.append('profile_image', this.files['profile']);
      } else if (this.preview.profile) {
        formData.append('profile_image_url', this.preview.profile);
      }

      if (this.files['passbook']) {
        formData.append('bank_passbook', this.files['passbook']);
      } else if (this.preview.passbook) {
        formData.append('bank_passbook_url', this.preview.passbook);
      }

      if (this.files['pancard']) {
        formData.append('pancard', this.files['pancard']);
      } else if (this.preview.pancard) {
        formData.append('pancard_url', this.preview.pancard);
      }

      if (this.files['aadhar']) {
        formData.append('aadhar', this.files['aadhar']);
      } else if (this.preview.aadhar) {
        formData.append('aadhar_url', this.preview.aadhar);
      }

      formData.append('emp_id', this.selectedUser?.id || '');
      formData.append('roles', JSON.stringify(this.selectedRoles));

      // Optional: show loading
      Swal.fire({ title: 'Please wait...', allowOutsideClick: false });
      Swal.showLoading();

      try {
        const accessToken = localStorage.getItem('access_token');

        const response = await fetch('https://petrosoul.com/manomaya_energy/api/userUpdate', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json'
          },
          body: formData
        });

        const result = await response.json();
        Swal.close();

        if (result.status === true) {
          iziToast.success({
            message: 'User Updated Successfully',
            position: 'topRight'
          });
          this.editForm.reset();
          this.preview = {};
          this.selectedRoles = [];
          $('#editUserModal').modal('hide');
          this.fetchUsers();
        } else {
          console.error('Server Error:', result);
          iziToast.error({
            message: result.message || 'Error creating user',
            position: 'topRight'
          });
        }
      } catch (err) {
        console.error('Fetch Error:', err);
        Swal.close();
        iziToast.error({
          message: 'Network error occurred',
          position: 'topRight'
        });
      }
    }
  }




  closeModal(): void {
    $('#editUserModal').modal('hide');
  }
  deleteUser(user: any, index: number): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This user will be permanently deleted!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        // Build request payload
        const requestData = {
          moduleType: 'user',
          api_type: 'api',
          api_url: 'destroy',
          user_id: user.user_id || user.id,
          id: user.id
        };

        // Call server API to delete
        this.serverService.sendServer(requestData).subscribe({
          next: (res: any) => {
            if (res.status) {
              // Remove user from UI list
              this.users.splice(index, 1);

              Swal.fire({
                title: 'Deleted!',
                text: 'The user has been deleted.',
                icon: 'success',
                timer: 300,
                showConfirmButton: false
              });
              this.fetchUsers();
            } else {
              Swal.fire('Error', res.message || 'Failed to delete user.', 'error');
            }
          },
          error: (err) => {
            console.error('Delete error:', err);
            Swal.fire('Error', 'Something went wrong while deleting the user.', 'error');
          }
        });
      }
    });
  }


  onFileChange(event: any, field: string) {
    const file = event.target.files[0];
    if (file) {
      this.files[field] = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.preview[field] = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  viewImage(src: string) {
    window.open(src, '_blank');
  }


  changePasswordUser(user: any, index: number): void {
    this.selectedUser = user;
    this.resetPasswordForm.reset(); // clear previous input
    $('#resetPasswordModal').modal('show'); // open the modal
  }
  // Ensure new password ≠ current password
  newPasswordNotSameAsCurrentValidator(form: AbstractControl) {
    const current = form.get('current_password')?.value;
    const newPass = form.get('new_password')?.value;

    if (current && newPass && current === newPass) {
      return { newPasswordSameAsCurrent: true };
    }
    return null;
  }

  // Ensure confirm_password === new_password
  passwordMismatchValidator(form: AbstractControl) {
    const newPass = form.get('new_password')?.value;
    const confirmPass = form.get('confirm_password')?.value;

    if (newPass && confirmPass && newPass !== confirmPass) {
      return { passwordMismatch: true };
    }
    return null;
  }
  submitPasswordReset(): void {
    if (this.resetPasswordForm.invalid || !this.selectedUser) return;

    const formValue = this.resetPasswordForm.value;

    const requestData = {
      moduleType: 'user',
      api_type: 'api',
      api_url: 'resetPassword',
      user_id: this.selectedUser.id,
      emp_id: this.selectedUser.id, // adjust if needed
      mode: '',
      current_password: formValue.current_password,
      new_password: formValue.new_password
    };
    Swal.fire({ title: 'Please wait...', allowOutsideClick: false });
    Swal.showLoading();
    this.serverService.sendServer(requestData).subscribe({
      next: (res: any) => {
        Swal.close();
        if (res.status) {

          iziToast.success({
            message: 'Password reset successfully!',
            position: 'topRight'
          });
          $('#resetPasswordModal').modal('hide');
          this.fetchUsers();
        } else {
          iziToast.error({
            message: 'Password reset failed: ' + (res.message || 'Unknown error'),
            position: 'topRight'
          });
        }
      },
      error: (err) => {
        console.error('Reset error:', err);
        // alert('An error occurred during password reset.');
        iziToast.error({
          message: err,
          position: 'topRight'
        });
      }
    });
  }

}
