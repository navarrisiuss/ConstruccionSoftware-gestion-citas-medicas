import {Component} from '@angular/core';
import {Patient} from '../../../models/patient.model';
import {Gender} from '../../../models/gender.enum';
import {FormsModule} from '@angular/forms';


@Component({
  selector: 'app-register-patient',
  imports: [
    FormsModule
  ],
  templateUrl: './register-patient.component.html',
  styleUrl: './register-patient.component.css'
})
export class RegisterPatientComponent {

}
