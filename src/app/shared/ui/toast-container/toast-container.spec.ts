import { TestBed } from '@angular/core/testing';

import { ToastContainer } from './toast-container';
import { NotificationsState } from '../../state/notifications';

describe('ToastContainer', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [ToastContainer] });
  });

  it('não renderiza nada sem notificações', () => {
    const fixture = TestBed.createComponent(ToastContainer);
    fixture.detectChanges();

    expect((fixture.nativeElement.textContent as string).trim()).toBe('');
  });

  it('mostra a mensagem de erro e permite fechar manualmente', () => {
    const fixture = TestBed.createComponent(ToastContainer);
    fixture.detectChanges();

    const notifications = TestBed.inject(NotificationsState);
    notifications.notificarErro('Cidade não encontrada.');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Cidade não encontrada.');

    const fecharBtn: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    fecharBtn.click();
    fixture.detectChanges();

    expect((fixture.nativeElement.textContent as string).trim()).toBe('');
  });
});
