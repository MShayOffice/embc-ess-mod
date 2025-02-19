import { ThrowStmt } from '@angular/compiler';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import {
  GetSecurityPhraseResponse,
  VerifySecurityPhraseRequest
} from 'src/app/core/api/models';
import { EvacueeSessionService } from 'src/app/core/services/evacuee-session.service';
import { EssFileSecurityPhraseService } from './essfile-security-phrase.service';

@Component({
  selector: 'app-essfile-security-phrase',
  templateUrl: './essfile-security-phrase.component.html',
  styleUrls: ['./essfile-security-phrase.component.scss']
})
export class EssfileSecurityPhraseComponent implements OnInit {
  securityPhraseForm: FormGroup;
  securityPhrase: GetSecurityPhraseResponse;
  // givenAnswer: string;
  attemptsRemaning = 3;
  isLoading = false;
  showLoader = false;
  correctAnswerFlag = false;
  wrongAnswerFlag = false;
  color = '#169BD5';

  constructor(
    private router: Router,
    private essFileSecurityPhraseService: EssFileSecurityPhraseService,
    private evacueeSessionService: EvacueeSessionService,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    this.createSecurityPhraseForm();

    if (this.evacueeSessionService.essFileNumber === undefined) {
      this.router.navigate(['responder-access/search/evacuee']);
    } else {
      this.essFileSecurityPhraseService
        .getSecurityPhrase(this.evacueeSessionService.essFileNumber)
        .subscribe((results) => {
          console.log(results);
          this.securityPhrase = results;
        });
    }
  }

  /**
   * Function that redirects to Search Results page
   */
  goToSearchResults() {
    this.router.navigate(['responder-access/search/evacuee']);
  }

  /**
   * Funtion that send answers to the backend and decided which screen to show according to backend response
   */
  next() {
    this.showLoader = !this.showLoader;
    const body: VerifySecurityPhraseRequest = {
      answer: this.securityPhraseForm.get('phraseAnswer').value
    };

    this.essFileSecurityPhraseService
      .verifySecurityPhrase(this.evacueeSessionService.essFileNumber, body)
      .subscribe((results) => {
        console.log(results);
        this.showLoader = !this.showLoader;
        if (results.isCorrect) {
          this.wrongAnswerFlag = false;
          this.correctAnswerFlag = true;
          setTimeout(() => {
            this.router.navigate(['responder-access/search/essfile-dashboard']);
          }, 1000);
        } else {
          this.securityPhraseForm.get('phraseAnswer').reset();
          this.attemptsRemaning--;
          this.wrongAnswerFlag = true;
        }
      });
  }

  /**
   * Function that redirects to Evacuation Registration page
   */
  goToEvacRegistration() {
    this.router.navigate(['ess-wizard/evacuee-profile/collection-notice']);
  }

  private createSecurityPhraseForm() {
    this.securityPhraseForm = this.formBuilder.group({
      phraseAnswer: ['']
    });
  }
}
