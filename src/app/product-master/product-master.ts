import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, AbstractControl, Validators, ValidationErrors } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Server } from '../server';
import iziToast from 'izitoast';
import Swal from 'sweetalert2';
declare var $: any;

@Component({
  selector: 'app-product-master',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './product-master.html',
  styleUrl: './product-master.css'
})
export class ProductMaster {
  isLoading = false;
  products: any[] = [];
  productForm!: FormGroup;
  selectedImage: File | null = null;
  preview: string | ArrayBuffer | null = null;
  limit: string = '50';
  offset: string = '0';
  editProduct: any = {};
  editImage: File | null = null;
  editImagePreview: string | ArrayBuffer | null = null;
  editIndex: number = -1;
  selectedUser: any;

  constructor(private serverService: Server, private fb: FormBuilder, private http: HttpClient) { }
  ngOnInit(): void {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      brand: ['', Validators.required],
      price: ['', Validators.required],
      unit: ['', Validators.required],
      product_img: ['', [Validators.required, this.fileValidator]],
    });
    this.fetchProduct();
  }
  fileValidator(control: AbstractControl): ValidationErrors | null {
    return control.value && control.value.length ? null : { fileRequired: true };
  }

  openaddProductModal() {
    $('#addProductModal').modal('show');
  }

  closeModal(): void {
    $('#addProductModal').modal('hide');
    this.productForm.reset();
    this.preview = null;
    this.selectedImage = null;
  }

  closeEditModal() {
    $('#editProductModal').modal('hide');
    this.editProduct = {};
    this.editImage = null;
    this.editImagePreview = null;
  }

  onImageChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedImage = file;
      this.productForm.patchValue({ image: file });

      const reader = new FileReader();
      reader.onload = (e) => this.preview = e.target?.result ?? null;
      reader.readAsDataURL(file);
    }
  }

  onEditImageChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.editImage = file;

      const reader = new FileReader();
      reader.onload = () => {
        this.editImagePreview = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  async saveProduct() {
    Object.keys(this.productForm.controls).forEach(controlName => {
      const control = this.productForm.get(controlName);
      if (control) {
        control.markAsTouched();
      }
    });
    if (this.productForm.valid) {
      const formData = new FormData();
      formData.append('name', this.productForm.get('name')?.value);
      formData.append('brand', this.productForm.get('brand')?.value);
      formData.append('price', this.productForm.get('price')?.value);
      formData.append('unit', this.productForm.get('unit')?.value);

      if (this.selectedImage) {
        formData.append('image', this.selectedImage);
      }
      Swal.fire({ title: 'Please wait...', allowOutsideClick: false });
      Swal.showLoading();
      try {
        const accessToken = localStorage.getItem('access_token');
        const response = await fetch('https://petrosoul.com/manomaya_energy/api/productSave', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json'
          },
          body: formData
        })
        const result = await response.json();
        Swal.close();
        if (result.status === true) {
          iziToast.success({
            message: 'Product saved successfully!',
            position: 'topRight'
          });
          this.productForm.reset();
          this.preview = null;
          this.closeModal();
          this.fetchProduct();  
        } else {
          console.error('Server Error:', result);
          iziToast.error({
            message: result.message || 'Failed to save product',
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

  fetchProduct() {
    setTimeout(() => {
      this.isLoading = true;
    }, 800);
    const user_id = localStorage.getItem('user_id');
    const requestData = {
      moduleType: 'ProductMaster',
      api_type: 'api',
      api_url: 'productList',
      user_id: user_id,
      product_name: '',
      limit: this.limit,
      offset: this.offset
    };

    this.serverService.sendServer(requestData).subscribe({
      next: (response: any) => {
        if (response.status && response.data) {
          this.isLoading = false;
          this.products = response.data;
        }
      }
    });
  }
  openEditModal(index: number): void {
    const productId = this.products[index]?.id;
    if (!productId) return;

    this.editIndex = index;

    // Show loading
    Swal.fire({ title: 'Loading...', allowOutsideClick: false });
    Swal.showLoading();

    const accessToken = localStorage.getItem('access_token');

    fetch(`https://petrosoul.com/manomaya_energy/api/productEdit/${productId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    })
      .then(res => res.json())
      .then(data => {
        Swal.close();

        if (data.status && data.data) {
          this.editProduct = { ...data.data };
          this.editImagePreview = this.editProduct.image_url || null;

          $('#editProductModal').modal('show');
        } else {
          iziToast.error({
            message: data.message || 'Failed to fetch product details',
            position: 'topRight'
          });
        }
      })
      .catch(err => {
        Swal.close();
        console.error(err);
        iziToast.error({
          message: 'Network error occurred',
          position: 'topRight'
        });
      });
  }
  deleteProduct(index: number): void {
    const product = this.products[index];
    if (!product?.id) return;

    Swal.fire({
      title: 'Are you sure?',
      text: 'This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then(async (result) => {
      if (result.isConfirmed) {
        Swal.fire({ title: 'Loading...', allowOutsideClick: false });
        Swal.showLoading();
        const accessToken = localStorage.getItem('access_token');

        try {
          const response = await fetch(`https://petrosoul.com/manomaya_energy/api/productDelete/${product.id}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Accept': 'application/json'
            }
          });

          const resData = await response.json();

          if (resData.message === 'Product deleted successfully') {
             Swal.close();
            iziToast.success({
              message: 'Product deleted successfully!',
              position: 'topRight'
            });

            this.fetchProduct(); 
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

async updateProduct(): Promise<void> {
  // Basic manual validation
  if (
    !this.editProduct.name ||
    !this.editProduct.brand ||
    !this.editProduct.price ||
    !this.editProduct.unit
  ) {
    Swal.fire('Validation Error', 'All fields are required', 'error');
    return;
  }

  const formData = new FormData();
  formData.append('id', this.editProduct.id); // required for update
  formData.append('name', this.editProduct.name);
  formData.append('brand', this.editProduct.brand);
  formData.append('price', this.editProduct.price);
  formData.append('unit', this.editProduct.unit);

  if (this.editImage) {
    formData.append('image', this.editImage);
  } else if (this.editProduct.image) {
    formData.append('image', this.editProduct.image);
  }

  const accessToken = localStorage.getItem('access_token');

  Swal.fire({ title: 'Updating product...', allowOutsideClick: false });
  Swal.showLoading();

  try {
    const response = await fetch('https://petrosoul.com/manomaya_energy/api/productUpdate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      },
      body: formData
    });

    const resData = await response.json();
    Swal.close();

    if (resData.message === 'Product updated successfully') {
      iziToast.success({
        message: resData.message,
        position: 'topRight'
      });

      this.closeEditModal();
      this.fetchProduct(); 
    } else {
      iziToast.error({
        message: resData.message || 'Failed to update product',
        position: 'topRight'
      });
    }
  } catch (error) {
    Swal.close();
    console.error('Update Error:', error);
    iziToast.error({
      message: 'Network error occurred',
      position: 'topRight'
    });
  }
}


}
