import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import type { IApiResponse } from '@core/models/api.model';

/** Single HttpClient wrapper. Base URL comes from the environment file. */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly _Http = inject(HttpClient);
  private readonly base = environment.apiBaseUrl;

  get<T>(endpoint: string): Observable<IApiResponse<T>> {
    return this._Http.get<IApiResponse<T>>(this.base + endpoint);
  }

  post<T>(endpoint: string, body: unknown): Observable<IApiResponse<T>> {
    return this._Http.post<IApiResponse<T>>(this.base + endpoint, body);
  }
}
