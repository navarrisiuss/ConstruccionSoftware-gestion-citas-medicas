import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { HelpChatComponent } from './help-chat.component';

describe('HelpChatComponent', () => {
  let component: HelpChatComponent;
  let fixture: ComponentFixture<HelpChatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HelpChatComponent , HttpClientTestingModule],
    })
    .compileComponents();

    fixture = TestBed.createComponent(HelpChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
