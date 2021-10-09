/// <reference types='cypress'/>

import { format, prepareLocalStorage } from "../support/utils";

describe("Dev Finances", () => {
  beforeEach(() => {
    cy.visit("https://devfinance-agilizei.netlify.app", {
      onBeforeLoad: (win) => {
        prepareLocalStorage(win);
      },
    });

    cy.get("#data-table tbody tr").should("have.length", 2);
  });

  it("deve poder inserir uma transação de entrada", () => {
    cy.get("#transaction .button").click();
    cy.get("#description").type("Salário");
    cy.get("#amount").type(1500);
    cy.get("#date").type("2021-10-15");
    cy.get("button").contains("Salvar").click();

    cy.get("#data-table tbody tr").should("have.length", 3);
  });

  it("deve poder inserir uma transação de saída", () => {
    cy.get("#transaction .button").click();
    cy.get("#description").type("Almoço");
    cy.get("#amount").type(-25);
    cy.get("#date").type("2021-10-15");
    cy.get("button").contains("Salvar").click();

    cy.get("#data-table tbody tr").should("have.length", 3);
  });

  it("deve poder remover uma transação de entrada e saída", () => {
    const entrada = "Salário";
    const saida = "Almoço";

    // Estratégia 1: voltar para o elemento pai, e avançar para um td img + atrb
    cy.get("td.description")
      .contains(entrada)
      .parent()
      .find("img[onclick*=remove]")
      .click();

    // (Melhor) - Estratégia 2: buscar todos os irmãos, e buscar o que tem img + atrb
    cy.get("td.description")
      .contains(saida)
      .siblings()
      .children("img[onclick*=remove]")
      .click();

    cy.get("#data-table tbody tr").should("have.length", 0);
  });

  it("validar saldo com diversas transações", () => {
    let incomes = 0;
    let expenses = 0;

    cy.get("#data-table tbody tr").each(($element, index, $list) => {
      cy.get($element)
        .find("td.income, td.expense")
        .invoke("text")
        .then((text) => {
          if (text.includes("-")) {
            expenses = expenses + format(text);
          } else {
            incomes = incomes + format(text);
          }
        });
    });

    cy.get("#incomeDisplay")
      .invoke("text")
      .then((text) => {
        let income = format(text);
        let expectedIncome = incomes;

        expect(income).to.eq(expectedIncome);
      });

    cy.get("#expenseDisplay")
      .invoke("text")
      .then((text) => {
        let expense = format(text);
        let expectedExpense = expenses;

        expect(expense).to.eq(expectedExpense);
      });

    cy.get("#totalDisplay")
      .invoke("text")
      .then((text) => {
        let total = format(text);
        let expectedTotal = incomes + expenses;

        expect(total).to.eq(expectedTotal);
      });
  });
});
