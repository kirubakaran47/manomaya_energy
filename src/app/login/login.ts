import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Server } from '../server';
import iziToast from 'izitoast';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  isLoading = false;
  email = '';
  password = '';
  errorMessage = '';
  templateAuthView = true;
  // rememberMe: any;
  showPassword: boolean = false;

  constructor(private router: Router, private serverService: Server) { }
  ngOnInit() {
  const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
  if (token) {
    this.router.navigate(['/dashboard'], { replaceUrl: true });
  }
}
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
  // onSubmit() {
  //   if (this.email === 'demo@example.com' && this.password === 'password123') {
  //     localStorage.setItem('access_token', 'demo-token-123');
  //     this.router.navigate(['/dashboard'], { replaceUrl: true });
  //   } else {
  //     this.errorMessage = 'Invalid email or password';
  //   }
  // }
    onSubmit() {
    this.isLoading = true;
    const requestData = {
      moduleType: 'login',
      api_type: 'web',
      api_url: 'login', 
      username: this.email,
      password: this.password
    };

    this.serverService.sendServer(requestData).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        console.log('Login Response:', response);

        if (response?.message === 'Login successful') {
          // const user_id = response.user.id; 
          // const userCode = response.user.userCode; 
          // const username = response.user.username; 
          localStorage.setItem('user_id', response.user.id);  
          localStorage.setItem('userCode', response.user.userCode);  
          localStorage.setItem('username', response.user.username); 
          localStorage.setItem('role', response.user.role);  
          localStorage.setItem('roles', response.user.roles);   
          const token = response.token || 'demo-token';
            localStorage.setItem('access_token', token);  
        //   if (this.rememberMe) {
        //   localStorage.setItem('access_token', token);  
        // } else {
        //   sessionStorage.setItem('access_token', token);  
        // }
          iziToast.success({
            message: 'Login successful',
            position: 'topRight'
          });
          this.router.navigate(['/dashboard'], { replaceUrl: true });
        } else {
          
          this.errorMessage = 'Login failed';
          iziToast.error({
            message: 'Invalid email or password',
            position: 'topRight'
          });
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error(err);
        this.errorMessage = 'Server error';
        iziToast.error({
          message: 'Server error during login',
          position: 'topRight'
        });
      }
    });
  }
}
