import { Component } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-compartir-mazo',
  standalone: true,
  imports: [
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './compartir-mazo.html',
  styleUrls: ['../../../recursos/recursos.css', '../../flashcards.css', './compartir-mazo.css'],
})
export class CompartirMazo {
  readonly formulario = new FormGroup({
    idGrupo: new FormControl('1', { nonNullable: true, validators: Validators.required }),
    idTema: new FormControl('2', { nonNullable: true, validators: Validators.required }),
  });
}
