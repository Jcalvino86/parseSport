import { Component } from '@angular/core';
import { FormControl, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';

import { Observable } from 'rxjs/Observable';
import { startWith } from 'rxjs/operators/startWith';
import { map } from 'rxjs/operators/map';

/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

/** @title Input with a custom ErrorStateMatcher */
@Component({
  selector: 'app-parser',
  templateUrl: './parser.component.html',
  styleUrls: ['./parser.component.scss']
})
export class ParserComponent {
  data: any;
  examples: Object[] = [
    { title : 'futbol', clave : 'F.C. Barcelona 3-2 Real Madrid'},
    { title : 'tenis', clave : 'Anna Karolina Schmiedlova (1) 1 40-Adv 1 (0) *Varvara Lepchenko'},
    { title : 'futbol americano', clave : 'Pittsburgh Steelers 3-7 Minnesota Vikings 3rd Quarter'}
  ];

  sport = new FormControl('', [
    Validators.required,
  ]);

  matcher = new MyErrorStateMatcher();

  setValue(text) {
    this.sport.setValue(text);

  }

  // futbol
  futbol(texto) {
    const points = texto.match(/(\d)+/g); // " 3-2 "
    const equips = texto.split(texto.match(/\s(\d)+(\-)+(\d)+\s/g).toString()); //  FCB  RM
    const response = {
      'teamAName': equips[0],
      'teamBName': equips[1],
      'teamAScore': points[0],
      'teamBScore': points[1]
    };
    return response;
  }
  // END futbol

  // tennis
  tennis(texto) {
    const expre = /\b(\d)+[-.]+\w{3}|(\d)+[-.](\d)+|(\d)+\b/g
    const values = texto.match(expre);
    const teamNames = texto.replace(expre, '').split(' ()    () ');
    const response = {
      'teamAName': '',
      'teamBName': '',
      'teamAScore': values[2].split('-')[0],
      'teamBScore': values[2].split('-')[1],
      'teamAGames': values[1],
      'teamBGames': values[3],
      'teamBServing': false,
      'teamAServing': false,
      'scoreboard': {
        'elements': [{
          'title': 'Sets',
          'teamASets': values[0],
          'teamBSets': values[4]
        }]
      }
    };
    if (teamNames[1].split('*').length > 1) {
      response.teamBServing = true;
      response.teamAServing = false;
      response.teamAName = teamNames[0];
      response.teamBName = teamNames[1].split('*')[1];
    } else {
      response.teamBServing = false;
      response.teamAServing = true;
      response.teamBName = teamNames[0].split('*')[1];
      response.teamAName = teamNames[1];
    }
    return (response);
  }
  // END Tenis

  //  American Football
  americanFootball(texto) {
    const data = texto.split(/(\d)+/g);
    const response = {
      'teamAName': data[0].slice(0, -1),
      'teamBName': data[4].slice(1, -1),
      'teamAScore': data[1],
      'teamBScore': data[3],
      'currentPeriod': data[5] + data[6]
    };
    return (response);
  }
  // END American Football

  evalueString(texto) {
    const data = texto.split(/(\d)+/g);
    if (!data[4]) {
      this.sport.setErrors({ error: 'Formato incorrecto' });
      delete this.data;
      return;
    }
    const response = {
      'tennis': data[4].slice(1, -1),
      'futbol': data[5] + data[6]
    };
    if (response.futbol.toString() === 'NaN') {
      console.log('Es una Expresion para futbol', texto);
      this.data = this.futbol(texto);
    } else if (response.tennis === '') {
      console.log('Es una Expresion para tennis:', texto);
      this.data = this.tennis(texto);
    } else {
      console.log('Es una Expresion para americanFootball:', texto);
      this.data = this.americanFootball(texto);
    }
  }
}
