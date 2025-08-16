import { Component,OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';
import { filter } from 'rxjs/operators';
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule,CommonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar implements OnInit{
  activeMenu: string = '';
  activeSubMenu: string = '';
userRoles: number[] = [];
constructor(private router: Router, private cd: ChangeDetectorRef) {}


 ngOnInit(): void {
  const rolesString = localStorage.getItem('roles');
  this.userRoles = rolesString ? JSON.parse(rolesString) : [];

    // Set active menu on load
    this.setActiveMenu(this.router.url);

    // Update on every route change
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.setActiveMenu(event.urlAfterRedirects);
      }
    });
  }
setActiveMenu(url: string): void {
  if (url.startsWith('/shiftEntry') || url.startsWith('/manageShiftEntry')) {
    this.activeMenu = 'shiftEntry';
  } else if (url.startsWith('/addUser') || url.startsWith('/userDetails')) {
    this.activeMenu = 'manage';
  } else if (url.startsWith('/purchaseEntry')) {
    this.activeMenu = 'purchaseEntry';
  } else if (url.startsWith('/productMaster') || url.startsWith('/vendorList') || url.startsWith('/rpsDetails') || url.startsWith('/addVendor') || url.startsWith('/taxDetails') ) {
  this.activeMenu = 'productMaster';
  if (url.startsWith('/vendorList') || url.startsWith('/addVendor')) {
    this.activeSubMenu = 'vendor';
  } else {
    this.activeSubMenu = ''; 
  }
  } else if (url.startsWith('/settings')) {
    this.activeMenu = 'settings';
  } else {
    this.activeMenu = '';
    this.activeSubMenu = '';
  }
}

toggleMenu(menu: string): void {
  if (menu === 'productMaster') {
    // Toggle Product Master
    this.activeMenu = this.activeMenu === 'productMaster' ? '' : 'productMaster';
    if (this.activeMenu !== 'productMaster') {
      this.activeSubMenu = ''; 
    }
  } else {
    this.activeMenu = menu;
    this.activeSubMenu = ''; 
  }
}

toggleSubMenu(subMenu: string): void {

  this.activeSubMenu = this.activeSubMenu === subMenu ? '' : subMenu;
}

  // toggleMenu(menu: string): void {
  //   this.activeMenu = this.activeMenu === menu ? '' : menu;
  // }
   toggleMobileMenu(): void {
    document.body.classList.toggle('mobile-menu-open');
  }
}
