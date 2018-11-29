describe('Github Login', function () {
  context('Authorisation', function () {
    it('Cannot sign up without entering details', function () {
      cy.visit('www.github.com')
      cy.get('.mr-4 > .octicon').should('exist')
      cy.get('.home-hero-signup > .btn-mktg').click()
      cy.get('#signup-form > .flash').contains('There were problems creating your account.')
    })
  })
})
