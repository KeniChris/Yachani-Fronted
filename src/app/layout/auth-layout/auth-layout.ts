import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { Brand } from '../brand/brand';

@Component({
  selector: 'app-auth-layout',
  host: { class: 'yachani-dark' },
  standalone: true,
  imports: [RouterLink, RouterOutlet, MatButtonModule, Brand],
  templateUrl: './auth-layout.html',
  styleUrl: './auth-layout.css',
})
export class AuthLayout {}
