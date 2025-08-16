
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { Dashboard } from './dashboard/dashboard';
import { ShiftEntry } from './shift-entry/shift-entry';
import { ShiftEntryList } from './shift-entry-list/shift-entry-list';
import { Vendor } from './vendor/vendor';
import { AddVendor } from './add-vendor/add-vendor';
import { ProductMaster } from './product-master/product-master';
import { PurchaseEntry } from './purchase-entry/purchase-entry';
import { Adduser } from './adduser/adduser';
import { UserDetsils } from './user-detsils/user-detsils';
import { Setting } from './setting/setting';
// import { Stock } from './stock/stock';
import { RpsDetails } from './rps-details/rps-details';
import { Login } from './login/login';
import { Tax } from './tax/tax';
export const routes: Routes = [
  { path: 'dashboard', component: Dashboard },
  { path: 'addUser', component: Adduser },
  { path: 'userDetails', component: UserDetsils },
  { path: 'shiftEntry', component: ShiftEntry },
  { path: 'shiftEntryList', component: ShiftEntryList },
  { path: 'vendorList', component: Vendor },
  { path: 'addVendor', component: AddVendor },
  { path: 'productMaster', component: ProductMaster },
  { path: 'purchaseEntry', component: PurchaseEntry },
  // { path: 'stock', component: Stock },
  { path: 'rpsDetails', component: RpsDetails },
  { path: 'settings', component: Setting },
  { path: 'taxDetails', component: Tax },
  { path: 'login', component: Login },
  { path: '', redirectTo: 'login', pathMatch: 'full' }, 
  { path: '**', redirectTo: 'login' }
];


@NgModule({
  imports: [RouterModule.forRoot(routes,{ useHash: true })],
  exports: [RouterModule]
})

export class AppRoutingModule { } 