import { Component, DestroyRef, Input, effect, inject, signal, untracked } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subscription } from 'rxjs';
import { FlashcardsApiService } from '../../../core/services/flashcards-api.service';
import { errorApi,idPositivo,textoRequerido } from '../../../core/services/recursos-ui';
@Component({selector:'app-datos-mazo',standalone:true,imports:[RouterLink,ReactiveFormsModule,MatButtonModule,MatFormFieldModule,MatInputModule],templateUrl:'./datos-mazo.html',styleUrls:['../flashcards.css','./datos-mazo.css']})
export class DatosMazo {
  readonly parametro=signal<string|undefined>(undefined);@Input()set mazoId(v:string|undefined){this.parametro.set(v);}
  readonly id=signal<number|null>(null);readonly cargando=signal(false);readonly listo=signal(false);readonly guardando=signal(false);readonly error=signal('');
  private readonly api=inject(FlashcardsApiService);private readonly router=inject(Router);private readonly destroy=inject(DestroyRef);private carga?:Subscription;
  readonly form=new FormGroup({titulo:new FormControl('',{nonNullable:true,validators:[textoRequerido,Validators.maxLength(120)]}),descripcion:new FormControl('',{nonNullable:true,validators:Validators.maxLength(500)})});
  constructor(){effect(()=>{const p=this.parametro();untracked(()=>this.cargar(p));});}
  cargar(p=this.parametro()):void{this.carga?.unsubscribe();const id=idPositivo(p);this.id.set(id);this.error.set('');this.listo.set(false);this.form.reset();if(p!==undefined&&!id){this.error.set('El identificador del mazo no es válido.');return;}if(!id){this.listo.set(true);return;}this.cargando.set(true);this.carga=this.api.detalle(id).pipe(takeUntilDestroyed(this.destroy)).subscribe({next:r=>{this.form.reset({titulo:r.mazo.titulo,descripcion:r.mazo.descripcion??''});this.listo.set(true);this.cargando.set(false);},error:e=>{this.error.set(errorApi(e));this.cargando.set(false);}});}
  guardar():void{this.form.markAllAsTouched();if(this.form.invalid||!this.listo()||this.guardando())return;const id=this.id();const body={titulo:this.form.controls.titulo.value.trim(),descripcion:this.form.controls.descripcion.value.trim()};this.guardando.set(true);this.error.set('');(id?this.api.editar(id,body):this.api.crear(body)).pipe(takeUntilDestroyed(this.destroy)).subscribe({next:m=>{this.guardando.set(false);void this.router.navigate(['/flashcards',m.idMazo],{queryParams:id?{}:{editor:'agregar'}});},error:e=>{this.guardando.set(false);this.error.set(errorApi(e));}});}
}
