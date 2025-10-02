import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminDashboardService } from '../../services/admin-dashboard-api';

@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css']
})
export class AdminDashboard implements OnInit {
  usuarios: any[] = [];

  constructor(private adminDashboardService: AdminDashboardService) { }

  ngOnInit(): void {
    this.adminDashboardService.getUsuarios().subscribe(data => {
      
      this.usuarios = data;
      console.log(data);
    });
  }

}
