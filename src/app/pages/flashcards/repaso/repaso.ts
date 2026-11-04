import { Component, DestroyRef, Input, TemplateRef, computed, effect, inject, signal, untracked } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subscription, forkJoin, of } from 'rxjs';
import { MazoDetalleResponse, ProgresoResponse, TarjetaResponse } from '../../../core/models/flashcards.models';
import { ContextoGrupoService } from '../../../core/services/contexto-grupo.service';
import { AuthService } from '../../../core/services/auth.service';
import { FlashcardsApiService } from '../../../core/services/flashcards-api.service';
import { errorApi,idPositivo } from '../../../core/services/recursos-ui';
@Component({selector:'app-repaso',standalone:true,providers:[ContextoGrupoService],imports:[RouterLink,MatButtonModule,MatDialogModule,MatProgressBarModule],templateUrl:'./repaso.html',styleUrls:['../flashcards.css','./repaso.css']})
export class Repaso {
  readonly id=signal<number|null>(null);@Input()set mazoId(v:string){this.id.set(idPositivo(v));}
  readonly esGrupo=signal(false);@Input()set enGrupo(v:boolean|string){this.esGrupo.set(v===true||v==='true');}
  readonly contexto=inject(ContextoGrupoService);private readonly api=inject(FlashcardsApiService);private readonly auth=inject(AuthService);private readonly dialog=inject(MatDialog);private readonly router=inject(Router);private readonly destroy=inject(DestroyRef);private carga?:Subscription;private envio?:Subscription;
  readonly detalle=signal<MazoDetalleResponse|null>(null);readonly progreso=signal<ProgresoResponse|null>(null);readonly tema=signal('');readonly cargando=signal(false);readonly error=signal('');readonly guardando=signal(false);readonly errorDialogo=signal('');
  readonly estado=signal<'resumen'|'pregunta'|'respuesta'|'resultado'>('resumen');readonly cola=signal<TarjetaResponse[]>([]);readonly indice=signal(0);readonly actual=computed(()=>this.cola()[this.indice()]);readonly mazo=computed(()=>this.detalle()?.mazo);readonly tarjetas=computed(()=>this.detalle()?.tarjetas??[]);
  readonly propio=computed(()=>this.mazo()?.idAutor===this.auth.usuario()?.idUsuario);readonly puedeRetirar=computed(()=>this.esGrupo()&&this.contexto.miembro()&&(this.propio()||this.contexto.administrador()));
  readonly porcentajeAprendido=computed(()=>{const p=this.progreso();return p?.totalTarjetas?Math.round(100*p.tarjetasAprendidas/p.totalTarjetas):0;});
  readonly pendientes=computed(()=>this.tarjetas().filter(t=>!this.progreso()?.tarjetas.find(e=>e.idTarjeta===t.idTarjeta)?.aprendida));
  readonly destino=computed(()=>this.esGrupo()?['/grupos',this.contexto.idGrupo(),'flashcards']:['/flashcards']);
  constructor(){effect(()=>{const id=this.id(),enGrupo=this.esGrupo(),grupo=this.contexto.idGrupo();untracked(()=>this.cargar(id,enGrupo,grupo));});}
  cargar(id=this.id(),enGrupo=this.esGrupo(),grupo=this.contexto.idGrupo()):void{this.carga?.unsubscribe();this.envio?.unsubscribe();this.detalle.set(null);this.progreso.set(null);this.error.set('');this.guardando.set(false);this.estado.set('resumen');if(!id||(enGrupo&&!grupo)){this.error.set('El identificador del mazo o del grupo no es válido.');return;}this.cargando.set(true);this.carga=forkJoin({detalle:enGrupo?this.api.detalleGrupo(grupo!,id):this.api.detalle(id),progreso:this.api.progreso(id),publicaciones:enGrupo?this.api.delGrupo(grupo!):of([])}).pipe(takeUntilDestroyed(this.destroy)).subscribe({next:r=>{this.detalle.set(r.detalle);this.progreso.set(r.progreso);this.tema.set(r.publicaciones.find(p=>p.mazo.idMazo===id)?.nombreTema??'');this.cargando.set(false);},error:e=>{this.error.set(errorApi(e));this.cargando.set(false);}});}
  iniciar(modo:'continuar'|'todas'|'pendientes'):void{if(this.guardando())return;const p=this.progreso();const lista=modo==='todas'?this.tarjetas():modo==='pendientes'?this.pendientes():this.tarjetas().filter(t=>!p?.tarjetas.find(e=>e.idTarjeta===t.idTarjeta)?.vista);this.cola.set(lista);this.indice.set(0);this.error.set('');this.estado.set(lista.length?'pregunta':'resultado');}
  responder(aprendida:boolean):void{const id=this.id(),t=this.actual();if(!id||!t||this.guardando()||this.estado()!=='respuesta')return;this.guardando.set(true);this.error.set('');this.envio=this.api.guardarProgreso(id,t.idTarjeta,aprendida).pipe(takeUntilDestroyed(this.destroy)).subscribe({next:p=>{this.progreso.set(p);this.guardando.set(false);if(this.indice()+1>=this.cola().length)this.estado.set('resultado');else{this.indice.update(i=>i+1);this.estado.set('pregunta');}},error:e=>{this.guardando.set(false);this.error.set(errorApi(e));}});}
  abrir(template:TemplateRef<unknown>):void{this.errorDialogo.set('');this.dialog.open(template,{width:'600px',maxWidth:'calc(100vw - 32px)'});}
  retirar(ref:MatDialogRef<unknown>):void{const id=this.id(),grupo=this.contexto.idGrupo();if(!id||!grupo||!this.puedeRetirar()||this.guardando())return;this.guardando.set(true);ref.disableClose=true;this.api.retirarDeGrupo(grupo,id).pipe(takeUntilDestroyed(this.destroy)).subscribe({next:()=>{this.guardando.set(false);ref.close();void this.router.navigate(this.destino());},error:e=>{this.guardando.set(false);ref.disableClose=false;this.errorDialogo.set(errorApi(e));}});}
}
