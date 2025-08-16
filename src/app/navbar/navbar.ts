import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Server } from '../server';
import iziToast from 'izitoast';
@Component({
  selector: 'app-navbar',
  imports: [],
  standalone: true,
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {
 constructor(private serverService: Server,private router: Router) {}
username: string = '';
role: string = '';
 selectedUser: any;
ngOnInit() {
  this.username = localStorage.getItem('username') || 'Guest';
  this.role = localStorage.getItem('role') || 'User';
  this.getUser();
}
async logout() {
  const accessToken = localStorage.getItem('access_token');
  const userId = localStorage.getItem('user_id');  

  if (!accessToken || !userId) {
    console.error('No token or user_id found!');
    return;
  }

  const requestData = {
    user_id: userId, 
    access_token: accessToken,  
  };

  try {
    const response = await fetch('https://petrosoul.com/manomaya_energy/api/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`, 
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData),  
    });

    const result = await response.json(); 
    if (result.status) {
      iziToast.success({
        message: 'Logout successful',
        position: 'topRight',
      });
      localStorage.clear();
      this.router.navigate(['/login']);
    } else {
      console.error('Error logging out from server:', result.message);
      iziToast.error({
        message: result.message || 'Error logging out from server',
        position: 'topRight',
      });
    }
  } catch (error) {
    console.error('Logout failed:', error);
    iziToast.error({
      message: 'Logout failed',
      position: 'topRight',
    });
  }
}


   toggleMobileMenu(): void {
    document.body.classList.toggle('mobile-menu-open');
  }
  getUser(): void {
  const userId = localStorage.getItem('user_id');
  if (!userId) {
    console.warn('No user_id found in localStorage.');
    return;
  }

  const requestData = {
    moduleType: 'user',
    api_type: 'api',
    api_url: 'userEdit',
    user_id: userId,
    id: userId
  };

  this.serverService.sendServer(requestData).subscribe({
    next: (response: any) => {
      if (response.status && response.data) {
        this.selectedUser = response.data; 
        console.log('User fetched:', this.selectedUser);
      } else {
        console.warn('No user data found in response.');
      }
    },
    error: (err) => {
      console.error('Failed to fetch user data:', err);
    }
  });
}

}
