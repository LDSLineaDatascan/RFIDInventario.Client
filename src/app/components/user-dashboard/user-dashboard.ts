import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserDashboardServices } from '../../services/user-dashboard-api';

@Component({
  selector: 'app-user-dashboard',
  imports: [CommonModule],
  templateUrl: './user-dashboard.html',
  styleUrls: ['./user-dashboard.css'],
})
export class UserDashboard implements OnInit {

  usuarios: any[] = [];

  constructor(private userDashboardService: UserDashboardServices) { }

  ngOnInit(): void {
    this.userDashboardService.getDashboardUser().subscribe(data => {
      this.usuarios = data;
      console.log(data);
    });
  }

}


