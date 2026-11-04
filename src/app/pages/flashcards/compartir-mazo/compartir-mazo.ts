import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, distinctUntilChanged, forkJoin, of, startWith, switchMap } from 'rxjs';
import { GrupoRecursos,TemaResponse } from '../../../core/models/recursos.models';
import { MazoResponse } from '../../../core/models/flashcards.models';
import { FlashcardsApiService } from '../../../core/services/flashcards-api.service';
import { RecursosApiService } from '../../../core/services/recursos-api.service';
import { AuthService } from '../../../core/services/auth.service';
import { errorApi } from '../../../core/services/recursos-ui';
@Component({selector:'app-compartir-mazo',standalone:true,imports:[RouterLink,ReactiveFormsModule,MatDialogModule,MatButtonModule,MatFormFieldModule,MatSelectModule],templateUrl:'./compartir-mazo.html',styleUrls:['../flashcards.css','./compartir-mazo.css']})
export class CompartirMazo {
  readonly data=inject<{idMazo?:number;idGrupo?:number}>(MAT_DIALOG_DATA);private readonly ref=inject(MatDialogRef<CompartirMazo>);private readonly api=inject(FlashcardsApiService);private readonly recursos=inject(RecursosApiService);private readonly auth=inject(AuthService);private readonly destroy=inject(DestroyRef);
  readonly mazos=signal<MazoResponse[]>([]);readonly grupos=signal<GrupoRecursos[]>([]);readonly temas=signal<TemaResponse[]>([]);readonly cargando=signal(true);readonly cargandoTemas=signal(false);readonly guardando=signal(false);readonly error=signal('');readonly errorTemas=signal('');readonly paso=signal(this.data.idMazo?2:1);
  readonly seleccionado=signal<number|null>(this.data.idMazo??null);readonly mazo=computed(()=>this.mazos().find(m=>m.idMazo===this.seleccionado()));
  readonly form=new FormGroup({grupo:new FormControl<number|null>(null,Validators.required),tema:new FormControl<number|null>(null,Validators.required)});
  constructor(){
    this.form.controls.grupo.valueChanges.pipe(startWith(null),distinctUntilChanged(),switchMap(id=>{this.form.controls.tema.reset();this.temas.set([]);this.errorTemas.set('');this.cargandoTemas.set(!!id);return id?this.recursos.temas(id).pipe(catchError(e=>{this.errorTemas.set(errorApi(e));return of([] as TemaResponse[]);})):of([] as TemaResponse[]);}),takeUntilDestroyed()).subscribe(t=>{this.temas.set(t);this.cargandoTemas.set(false);});
    forkJoin({mazos:this.api.propios(),grupos:this.recursos.grupos()}).pipe(takeUntilDestroyed()).subscribe({next:r=>{this.mazos.set(r.mazos.filter(m=>m.cantidadTarjetas>0));this.grupos.set(r.grupos.filter(g=>g.idCreador===this.auth.usuario()?.idUsuario||g.tipoGrupo==='ESTUDIANTES'||g.permitirPublicaciones));if(this.data.idGrupo&&this.grupos().some(g=>g.idGrupo===this.data.idGrupo))this.form.controls.grupo.setValue(this.data.idGrupo);this.cargando.set(false);},error:e=>{this.error.set(errorApi(e));this.cargando.set(false);}});
  }
  guardar():void{this.form.markAllAsTouched();const grupo=this.form.controls.grupo.value,tema=this.form.controls.tema.value,mazo=this.mazo();if(!grupo||!tema||!mazo||this.form.invalid||this.guardando()||this.cargandoTemas()||!this.grupos().some(g=>g.idGrupo===grupo)||!this.temas().some(t=>t.idTema===tema))return;this.guardando.set(true);this.error.set('');this.ref.disableClose=true;this.api.compartir(grupo,mazo.idMazo,tema).pipe(takeUntilDestroyed(this.destroy)).subscribe({next:r=>this.ref.close(r),error:e=>{this.guardando.set(false);this.ref.disableClose=false;this.error.set(errorApi(e));}});}
}
