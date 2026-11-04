import { Component, DestroyRef, effect, inject, signal, untracked } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialog } from '@angular/material/dialog';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { Subscription, forkJoin, switchMap, tap } from 'rxjs';
import { MazoCompartidoResponse, ProgresoResponse } from '../../../core/models/flashcards.models';
import { TemaResponse } from '../../../core/models/recursos.models';
import { FlashcardsApiService } from '../../../core/services/flashcards-api.service';
import { RecursosApiService } from '../../../core/services/recursos-api.service';
import { ContextoGrupoService } from '../../../core/services/contexto-grupo.service';
import { errorApi } from '../../../core/services/recursos-ui';
import { progresosDe } from '../../../core/services/progreso-mazos';
import { CompartirMazo } from '../compartir-mazo/compartir-mazo';
@Component({selector:'app-mazos-grupo',standalone:true,providers:[ContextoGrupoService],imports:[RouterLink,ReactiveFormsModule,MatButtonModule,MatFormFieldModule,MatSelectModule,MatProgressBarModule],templateUrl:'./mazos-grupo.html',styleUrls:['../flashcards.css','./mazos-grupo.css']})
export class MazosGrupo {
  readonly contexto=inject(ContextoGrupoService);private readonly api=inject(FlashcardsApiService);private readonly recursos=inject(RecursosApiService);private readonly dialog=inject(MatDialog);private readonly destroy=inject(DestroyRef);private carga?:Subscription;
  readonly filtro=new FormControl<number|null>(null);private readonly tema=toSignal(this.filtro.valueChanges,{initialValue:null});
  readonly temas=signal<TemaResponse[]>([]);readonly mazos=signal<MazoCompartidoResponse[]>([]);readonly progresos=signal<Record<number,ProgresoResponse|null>>({});readonly cargando=signal(false);readonly error=signal('');
  constructor(){effect(()=>{const id=this.contexto.idGrupo(),tema=this.tema();untracked(()=>this.cargar(id,tema));});}
  cargar(id=this.contexto.idGrupo(),tema=this.tema()):void{this.carga?.unsubscribe();this.mazos.set([]);this.progresos.set({});this.error.set('');if(!id){this.error.set('El identificador del grupo no es válido.');return;}this.cargando.set(true);this.carga=forkJoin({temas:this.recursos.temas(id),mazos:this.api.delGrupo(id,tema)}).pipe(tap(r=>{this.temas.set(r.temas);this.mazos.set(r.mazos);}),switchMap(r=>progresosDe(r.mazos.map(p=>p.mazo.idMazo),id=>this.api.progreso(id))),takeUntilDestroyed(this.destroy)).subscribe({next:p=>{this.progresos.set(p);this.cargando.set(false);},error:e=>{this.error.set(errorApi(e));this.cargando.set(false);}});}
  compartir():void{if(!this.contexto.puedePublicar())return;this.dialog.open(CompartirMazo,{width:'600px',maxWidth:'calc(100vw - 32px)',data:{idGrupo:this.contexto.idGrupo()}}).afterClosed().pipe(takeUntilDestroyed(this.destroy)).subscribe(r=>{if(r)this.cargar();});}
}
