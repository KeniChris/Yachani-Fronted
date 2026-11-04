import { Component, DestroyRef, Input, TemplateRef, computed, effect, inject, signal, untracked } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, Subscription } from 'rxjs';
import { MazoDetalleResponse,TarjetaResponse } from '../../../core/models/flashcards.models';
import { FlashcardsApiService } from '../../../core/services/flashcards-api.service';
import { errorApi,idPositivo,textoRequerido } from '../../../core/services/recursos-ui';
import { CompartirMazo } from '../compartir-mazo/compartir-mazo';
@Component({selector:'app-tarjetas',standalone:true,imports:[RouterLink,ReactiveFormsModule,MatButtonModule,MatDialogModule,MatExpansionModule,MatFormFieldModule,MatInputModule],templateUrl:'./tarjetas.html',styleUrls:['../flashcards.css','./tarjetas.css']})
export class Tarjetas {
  readonly id=signal<number|null>(null);@Input()set mazoId(v:string){this.id.set(idPositivo(v));}@Input()set editor(v:string){if(v==='agregar')this.editorAbierto.set(true);}
  readonly detalle=signal<MazoDetalleResponse|null>(null);readonly mazo=computed(()=>this.detalle()?.mazo);readonly tarjetas=computed(()=>this.detalle()?.tarjetas??[]);
  readonly cargando=signal(false);readonly error=signal('');readonly exito=signal('');readonly guardando=signal(false);readonly errorDialogo=signal('');readonly editorAbierto=signal(false);
  readonly form=new FormGroup({tarjeta:new FormControl<number|null>(null),pregunta:new FormControl('',{nonNullable:true,validators:[textoRequerido,Validators.maxLength(1000)]}),respuesta:new FormControl('',{nonNullable:true,validators:[textoRequerido,Validators.maxLength(1000)]})});
  private readonly api=inject(FlashcardsApiService);private readonly dialog=inject(MatDialog);private readonly destroy=inject(DestroyRef);private carga?:Subscription;
  constructor(){effect(()=>{const id=this.id();untracked(()=>this.cargar(id));});}
  cargar(id=this.id()):void{this.carga?.unsubscribe();this.detalle.set(null);this.error.set('');if(!id){this.error.set('El identificador del mazo no es válido.');return;}this.cargando.set(true);this.carga=this.api.detalle(id).pipe(takeUntilDestroyed(this.destroy)).subscribe({next:d=>{this.detalle.set(d);this.cargando.set(false);},error:e=>{this.error.set(errorApi(e));this.cargando.set(false);}});}
  editar(t?:TarjetaResponse):void{this.form.reset({tarjeta:t?.idTarjeta??null,pregunta:t?.pregunta??'',respuesta:t?.respuesta??''});this.error.set('');this.editorAbierto.set(true);}
  guardar():void{const id=this.id();this.form.markAllAsTouched();if(!id||this.form.invalid||this.guardando())return;const t=this.form.controls.tarjeta.value;const body={pregunta:this.form.controls.pregunta.value.trim(),respuesta:this.form.controls.respuesta.value.trim()};this.guardando.set(true);this.error.set('');(t?this.api.editarTarjeta(id,t,body):this.api.agregarTarjeta(id,body)).pipe(takeUntilDestroyed(this.destroy)).subscribe({next:()=>{this.guardando.set(false);this.editorAbierto.set(false);this.form.reset();this.exito.set('Tarjeta guardada.');this.cargar();},error:e=>{this.guardando.set(false);this.error.set(errorApi(e));}});}
  compartir():void{const id=this.id();if(!id||!this.tarjetas().length)return;this.dialog.open(CompartirMazo,{width:'600px',maxWidth:'calc(100vw - 32px)',data:{idMazo:id}}).afterClosed().pipe(takeUntilDestroyed(this.destroy)).subscribe(r=>{if(r)this.cargar();});}
  abrir(template:TemplateRef<unknown>,tarjeta?:TarjetaResponse):void{this.errorDialogo.set('');this.dialog.open(template,{width:'600px',maxWidth:'calc(100vw - 32px)',data:tarjeta});}
  private ejecutar<T>(op:Observable<T>,ref:MatDialogRef<unknown>,mensaje:string):void{if(this.guardando())return;this.guardando.set(true);ref.disableClose=true;this.errorDialogo.set('');op.pipe(takeUntilDestroyed(this.destroy)).subscribe({next:()=>{this.guardando.set(false);ref.close();this.exito.set(mensaje);this.cargar();},error:e=>{this.guardando.set(false);ref.disableClose=false;this.errorDialogo.set(errorApi(e));}});}
  eliminar(t:TarjetaResponse,ref:MatDialogRef<unknown>):void{const id=this.id();if(!id||this.ultimaPublicada())return;this.ejecutar(this.api.eliminarTarjeta(id,t.idTarjeta),ref,'Tarjeta eliminada.');}
  readonly ultimaPublicada=computed(()=>this.mazo()?.estado==='PUBLICADO'&&this.tarjetas().length<=1);
  retirar(ref:MatDialogRef<unknown>):void{const id=this.id();if(id)this.ejecutar(this.api.retirarPublicacion(id),ref,'Publicación retirada. El mazo sigue en tus borradores.');}
}
