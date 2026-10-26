import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink, RouterOutlet } from '@angular/router';

@Component({
  imports: [RouterLink, RouterOutlet],
  selector: 'app-auth-layout',
  styleUrl: './auth-layout.css',
  templateUrl: './auth-layout.html',
})
export class AuthLayout {
  readonly esRecuperacion = inject(ActivatedRoute).snapshot.data['variante'] === 'recuperacion';
}
