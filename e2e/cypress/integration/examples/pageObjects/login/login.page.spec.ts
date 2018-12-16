import { page, visitable, fillable, clickable } from "cypress-page-object";

const loginPage = page({
  visit: visitable('/login'),
  fillUsername: fillable('#username'),
  fillPassword: fillable('#password'),
  submit: clickable('[type="submit"]'),

  errorMessage() {
    return cy.get('.error');
  },

  successMessage() {
    return cy.get('.success');
  }
});

context('Testing with cypress-page-object', () => {

  it('User denied access with invalid details', () => {
    loginPage
      .visit()
      .fillUsername('invalidUser')
      .fillPassword('invalidPassword')
      .submit()
      .errorMessage()
      .should('contain', 'Your username is invalid!');
  });

  it('User granted access with valid details', () => {
    loginPage
      .visit()
      .fillUsername('tomsmith')
      .fillPassword('SuperSecretPassword!')
      .submit()
      .successMessage()
      .should('contain', 'You logged into a secure area!');
  });

});