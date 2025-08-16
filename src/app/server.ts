import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class Server {
  constructor(private http: HttpClient) {}
   public urlFinal = "https://petrosoul.com/manomaya_energy/api/";
  // sendServer(postData: any) {
  //   const headers = new HttpHeaders({ 'Content-Type': 'application/json' }); 
  //   return this.http.post('https://petrosoul.com/manomaya_energy/api/', postData, { headers });
  // }
  
  sendServer(postData: any) {

   const accessToken = localStorage.getItem('access_token');
    const httpOptions = {
      headers: {
        'Authorization': `Bearer ${accessToken}`, 
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
    };
    let url = this.urlFinal + postData.api_url;
    let posting: any[] = postData;
    return this.http.post(url, posting, httpOptions);
  }
}
