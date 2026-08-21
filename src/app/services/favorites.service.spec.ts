import { TestBed } from '@angular/core/testing';

import { FavoritesService } from './favorites.service';

describe('FavoritesService', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should start empty when localStorage has no data', () => {
    const service = TestBed.inject(FavoritesService);

    expect(service.favorites()).toEqual([]);
  });

  it('should add a favorite and persist it', () => {
    const service = TestBed.inject(FavoritesService);

    service.add(25);

    expect(service.favorites()).toEqual([25]);
    expect(localStorage.getItem('pokemon-favorites')).toBe('[25]');
  });

  it('should not duplicate favorites', () => {
    const service = TestBed.inject(FavoritesService);

    service.add(25);
    service.add(25);

    expect(service.favorites()).toEqual([25]);
  });

  it('should remove a favorite', () => {
    const service = TestBed.inject(FavoritesService);

    service.add(1);
    service.add(25);
    service.remove(1);

    expect(service.favorites()).toEqual([25]);
    expect(service.isFavorite(1)).toBeFalse();
  });

  it('should toggle favorites on and off', () => {
    const service = TestBed.inject(FavoritesService);

    service.toggle(150);
    expect(service.isFavorite(150)).toBeTrue();

    service.toggle(150);
    expect(service.isFavorite(150)).toBeFalse();
  });

  it('should restore only valid favorite ids from localStorage', () => {
    localStorage.setItem('pokemon-favorites', JSON.stringify([1, 25, 25, 0, -1, 'invalid']));

    const service = TestBed.inject(FavoritesService);

    expect(service.favorites()).toEqual([1, 25]);
  });

  it('should ignore invalid localStorage data', () => {
    localStorage.setItem('pokemon-favorites', 'invalid-json');

    const service = TestBed.inject(FavoritesService);

    expect(service.favorites()).toEqual([]);
  });
});
