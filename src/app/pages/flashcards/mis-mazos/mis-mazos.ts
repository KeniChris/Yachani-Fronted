import { Component, DestroyRef, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subscription, switchMap, tap } from 'rxjs';
import { MazoResponse, ProgresoResponse } from '../../../core/models/flashcards.models';
import { FlashcardsApiService } from '../../../core/services/flashcards-api.service';
import { errorApi } from '../../../core/services/recursos-ui';
import { progresosDe } from '../../../core/services/progreso-mazos';
@Component({ selector:'app-mis-mazos',standalone:true,imports:[RouterLink,MatButtonModule,MatProgressBarModule],templateUrl:'./mis-mazos.html',styleUrls:['../flashcards.css','./mis-mazos.css'] })
export class MisMazos {
  private readonly api=inject(FlashcardsApiService);private readonly destroy=inject(DestroyRef);private carga?:Subscription;
  readonly mazos=signal<MazoResponse[]>([]);readonly progresos=signal<Record<number,ProgresoResponse|null>>({});readonly cargando=signal(true);readonly error=signal('');
  constructor(){this.cargar();}
  cargar():void{this.carga?.unsubscribe();this.cargando.set(true);this.error.set('');this.progresos.set({});this.carga=this.api.propios().pipe(tap(m=>this.mazos.set(m)),switchMap(mazos=>progresosDe(mazos.map(m=>m.idMazo),id=>this.api.progreso(id))),takeUntilDestroyed(this.destroy)).subscribe({next:p=>{this.progresos.set(p);this.cargando.set(false);},error:e=>{this.error.set(errorApi(e));this.cargando.set(false);}});}
}
