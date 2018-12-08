import { Given, Then, When } from "cypress-cucumber-preprocessor/steps";
import myAssertion from "../../helpers/myAssertion";


Given(`webpack is configured`, () => {});

Then(`this test should work just fine!`, () => {
  myAssertion();
});
