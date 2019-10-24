describe("dom-testing-library commands", () => {
  beforeEach(() => {
    cy.visit("http://localhost:13370");
  });
  it("findByPlaceholderText", () => {
    cy.findByPlaceholderText("Placeholder Text")
      .click()
      .type("Hello Placeholder");
  });

  it("findByLabelText", () => {
    cy.findByLabelText("Label For Input Labelled By Id")
      .click()
      .type("Hello Input Labelled By Id");
  });

  it("findByAltText", () => {
    cy.findByAltText("Image Alt Text").click();
  });

  it("findByTestId", () => {
    cy.findByTestId("image-with-random-alt-tag").click();
  });

  it("findAllByText", () => {
    cy.findAllByText(/^Jackie Chan/).click({ multiple: true });
  });

  it("queryByText", () => {
    cy.queryAllByText("Button Text").should("exist");
    cy.queryByText("Non-existing Button Text", { timeout: 100 }).should(
      "not.exist"
    );
  });

  it("findByText within", () => {
    cy.get("#nested").within(() => {
      cy.findByText("Button Text").click();
    });
  });

  // it('findByText in container', () => {
  //   cy.get('#nested').then(subject => {
  //     cy.findByText('Button Text', {container: subject}).click()
  //   })
  // })

  it("findByTestId only throws the error message", () => {
    const testId = "Some random id";
    const errorMessage = `Unable to find an element by: [data-testid="${testId}"]`;
    cy.on("fail", err => {
      expect(err.message).to.eq(errorMessage);
    });

    cy.findByTestId(testId).click();
  });

  it("findByText only throws the error message", () => {
    const text = "Some random text";
    const errorMessage = `Unable to find an element with the text: ${text}. This could be because the text is broken up by multiple elements. In this case, you can provide a function for your text matcher to make your matcher more flexible.`;
    cy.on("fail", err => {
      expect(err.message).to.eq(errorMessage);
    });

    cy.findByText("Some random text").click();
  });
});

/* global cy */
