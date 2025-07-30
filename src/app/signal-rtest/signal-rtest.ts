import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as signalR from '@microsoft/signalr';

@Component({
  selector: 'app-signalr-test',
  templateUrl: './signal-rtest.html',
  styleUrls: ['./signal-rtest.css'],
  imports:[FormsModule,CommonModule]
})
export class SignalrTestComponent implements OnInit, OnDestroy {
  private connection: signalR.HubConnection | undefined;
  public messages: string[] = [];
  public messageToSend: string = '';

  ngOnInit(): void {
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:7025/chatHub',{withCredentials: true}) // 🔁 Replace with your backend SignalR hub URL
      .withAutomaticReconnect()
      .build();

      console.log("connectionlisten")
    this.connection.on('ReceiveMessage', (messageDto:any) => {
      console.log(messageDto)
      // this.messages.push(`${user}: ${message}`);
      // alert(`New message from ${user}: ${message}`); // Optional notification
    });

    this.connection
      .start()
      .then(() => console.log('SignalR connected'))
      .catch(err => console.error('SignalR connection error:', err));
  }

  sendMessage(): void {
    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      this.connection.invoke('SendMessage', 'TestUser', this.messageToSend)
        .then(() => this.messageToSend = '')
        .catch(err => console.error(err));
    }
  }

  ngOnDestroy(): void {
    this.connection?.stop();
  }
}
