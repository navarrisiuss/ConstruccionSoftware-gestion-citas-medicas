import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core'; // Asegúrate de importar AfterViewChecked
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-help-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './help-chat.component.html',
  styleUrls: ['./help-chat.component.css']
})
export class HelpChatComponent implements OnInit, OnDestroy, AfterViewChecked { // Implementa AfterViewChecked explícitamente
  @ViewChild('chatContent') private chatContent?: ElementRef; // Hazlo opcional con '?'

  visible: boolean = false;
  userInput: string = '';
  messages: { text: string; type: 'user' | 'ai' }[] = [];
  loading: boolean = false;

  private apiUrl = 'http://localhost:3000/api/chat/gemini';
  private subscription: Subscription = new Subscription();

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    // Puedes inicializar mensajes o cargar un historial aquí si lo deseas
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ngAfterViewChecked(): void {
    // Solo intenta hacer scroll si el chat es visible Y la referencia al elemento existe
    if (this.visible && this.chatContent) {
      this.scrollToBottom();
    }
  }

  toggle(): void {
    this.visible = !this.visible;
    if (this.visible) {
      // Pequeño retardo para asegurar que el contenido se renderice antes del scroll
      // y que chatContent ya esté definido.
      setTimeout(() => {
        if (this.chatContent) { // Doble verificación para mayor seguridad
          this.scrollToBottom();
        }
      }, 50); // Un retardo pequeño suele ser suficiente
    }
  }

  sendMessage(): void {
    if (this.userInput.trim() === '') {
      return;
    }

    const userMessage = this.userInput;
    this.messages.push({ text: userMessage, type: 'user' });
    this.userInput = '';
    this.loading = true;

    this.subscription.add(
      this.http.post<{ reply: string }>(this.apiUrl, { question: userMessage }).subscribe({
        next: (response) => {
          this.messages.push({ text: response.reply, type: 'ai' });
          this.loading = false;
        },
        error: (error) => {
          console.error('Error al comunicarse con el asistente:', error);
          this.messages.push({ text: 'Lo siento, hubo un error al obtener la respuesta. Por favor, inténtalo de nuevo más tarde.', type: 'ai' });
          this.loading = false;
        }
      })
    );
  }

  private scrollToBottom(): void {
    // Ya verificamos 'this.chatContent' en ngAfterViewChecked y toggle
    this.chatContent!.nativeElement.scrollTop = this.chatContent!.nativeElement.scrollHeight;
  }
}
