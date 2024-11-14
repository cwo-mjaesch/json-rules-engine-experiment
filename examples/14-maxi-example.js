"use strict";
/*
Maxis example mit iso tech abmaße vergleich *
 * Usage:
 *   node ./examples/02-nested-boolean-logic.js
 *
 * For detailed output:
 *   DEBUG=json-rules-engine node ./examples/02-nested-boolean-logic.js
 */

require("colors");
const { Engine } = require("json-rules-engine");
const cwoData = require("./binder_example.json")

function containsIgnoreCase(value, subString) {
  return value && subString && value.toLowerCase().includes(subString.toLowerCase());
}
function normalizeStreet(street) {
  if (!street) return "";
  return street
      .replace(/\bstr\b\.?/gi, "straße")   // Ersetze "Str." durch "Straße"
      .replace(/ä/g, "ae")                 // Ersetze Umlaute
      .replace(/ö/g, "oe")
      .replace(/ü/g, "ue")
      .replace(/ß/g, "ss")
      .replace(/strasse/gi, "straße")      // Behandle "strasse" und "straße" als gleich
      .replace(/\d+/g, "")                 // Entferne Zahlen
      .replace(/\s+/g, " ")                // Entferne überflüssige Leerzeichen
      .trim()
      .toLowerCase();                      // Kleinbuchstaben für Vergleich
}


function compareDimensions(data) {
  const mismatches = [];

  data.orderPositions.items.forEach((item) => {
    const { dimensions, article, lineNumber } = item;

    const isSameDimensions =
      dimensions.length === article.length &&
      dimensions.width === article.width &&
      dimensions.height === article.height;

    if (!isSameDimensions) {
      mismatches.push({
        lineNumber,
        dimensionMismatch: {
          lengthMatch: dimensions.length === article.length,
          widthMatch: dimensions.width === article.width,
          heightMatch: dimensions.height === article.height,
        },
      });
    }
  });

  return mismatches.length === 0;
}
async function start() {
  /**
   * Setup a new engine
   */
  const engine = new Engine([], { replaceFactsInEventParams: true });
  engine.addOperator("startsWithLetter", (factValue, jsonValue) => {
    if (!factValue.length) return false;
    return factValue[0].toLowerCase() === jsonValue.toLowerCase();
  });
  engine.addOperator("compareDimensions", (factValue, jsonValue) => {
    if (!factValue) return false;
    return compareDimensions(factValue);
  });

  const llm_output = {
    generalInformation: {
      validationNotes: "",
      companyName: "Preh GmbH",
      offerNumber: 1206104,
      deliveryDate: "2024-08-07",
      customerReferenceNumber: "3302281",
      bookingDate: "2024-07-12",
      documentDate: "2024-07-12",
      currency: "EUR",
      totalAmount: 197.95,
      numberOfArticles: 1,
      validationDetails:
        "- SKU: „F443500“ | Gesamtmenge: 1 | Artikel Line IDs: 00001 (1 Stück)",
    },
    logisticInformation: {
      addresses: {
        billingAddress: {
          category: "BillingAddress",
          countryCode: "DE",
          postalCode: "97616",
          city: "Bad Neustadt a.d. Saale",
          street: "Schweinfurter Str.",
          number: "5-9",
          addition: null,
          isBusiness: true,
          additionalInfo: "Preh GmbH",
        },
        shippingAddress: {
          category: "ShippingAddress",
          countryCode: "DE",
          postalCode: "97616",
          city: "Bad Neustadt",
          street: "Saalestraße",
          number: "48",
          addition: null,
          isBusiness: true,
          additionalInfo: "Preh GmbH",
        },
        supplierAddress: {
          category: "SupplierAddress",
          countryCode: "DE",
          postalCode: "48663",
          city: "Ahaus",
          street: "Postfach",
          number: "13 20",
          addition: null,
          isBusiness: true,
          additionalInfo: "ISO-TECH Kunststoff GmbH",
        },
      },
    },
    contactInformation: {
      debitorContactEmail: "Anja.Hesselbach@Preh.de",
      debitorOrderConfirmationEmail: null,
      debitorInvoiceConfirmationEmail: "rechnungspruefung@preh.de",
      debitorContactName: "Anja Hesselbach",
      creditorContactEmail: "verkauf@iso-tech.net",
      creditorContactName: "ISO-TECH Kunststoff GmbH",
      distributorContactEmail: null,
      distributorContactName: null,
      debitor: null,
    },
    additionalInformation: {
      vatId: "DE811147764",
    },
    orderPositions: {
      items: [
        {
          lineNumber: 1,
          sku: "F443500",
          description: "Kunststoffplatte It. Zg. WK27297 Pos.301",
          qty: 1,
          unit: "Stück",
          unitPrice: 197.95,
          totalPrice: 197.95,
          vendorSku: "F443500",
          material: "ISO-LEN® 500 confetti (reg.)",
          color: null,
          drawingNumber: null,
          drawingName: null,
          drawingPosition: null,
          dimensions: {
            length: 740,
            lengthUnit: "mm",
            width: 690,
            widthUnit: "mm",
            height: 20,
            heightUnit: "mm",
          },
          article: {
            id: "F443500",
            sku: "F443500",
            vendorSku: null,
            name: "Kunststoffplatte lt. Zg.",
            drawingNumber: "WK27297 Pos. 301",
            material: "00000011",
            color: null,
            length: 740,
            width: 690,
            height: 20,
            score: 12.761529,
          },
        },
      ],
    },
  };

  const orderPositions = {
    items: [
      {
        lineNumber: 1,
        sku: "F443500",
        description: "Kunststoffplatte It. Zg. WK27297 Pos.301",
        qty: 1,
        unit: "Stück",
        unitPrice: 197.95,
        totalPrice: 197.95,
        vendorSku: "F443500",
        material: "ISO-LEN® 500 confetti (reg.)",
        color: null,
        drawingNumber: null,
        drawingName: null,
        drawingPosition: null,
        dimensions: {
          length: 740,
          lengthUnit: "mm",
          width: 690,
          widthUnit: "mm",
          height: 20,
          heightUnit: "mm",
        },
        article: {
          id: "F443500",
          sku: "F443500",
          vendorSku: null,
          name: "Kunststoffplatte lt. Zg.",
          drawingNumber: "WK27297 Pos. 301",
          material: "00000011",
          color: null,
          length: 740,
          width: 690,
          height: 20,
          score: 12.761529,
        },
      },
    ],
  };

  // define a rule for detecting the player has exceeded foul limits.  Foul out any player who:
  // (has committed 5 fouls AND game is 40 minutes) OR (has committed 6 fouls AND game is 48 minutes)
  engine.addRule({
    // define the 'conditions' for when "hello world" should display
    conditions: {
      all: [
        {
          fact: "llm_output",
          path: "$.orderPositions",
          operator: "equal",
          value: true,
        },
      ],
    },
    // define the 'event' that will fire when the condition evaluates truthy
    event: {
      type: "message",
      params: {
        data: "is ok",
      },
    },
  });
  engine.addRule({
    conditions: {
      all:[
        {
          fact: "cwoData",
          path: "$.output.contactInformation.debitor.name",
          operator: "equal",
          value: {
            fact: "cwoData",
            path: "$.output.generalInformation.companyName"
          }
        }
      ]
    },
    event: {
      type: "nameEqual",
      params:{
        message: 'Debitornamen sind identisch',
        gesuchtDebitor: {
          fact: "cwoData",
          path: "$.output.contactInformation.debitor.name"
        },
        gelesenDebitor: {
          fact: "cwoData",
          path: "$.output.generalInformation.companyName"
        }
        
      }
    }

  })
  engine.addRule({
    conditions: {
      all:[
        {
          fact: "cwoData",
          path: "$.output.contactInformation.debitor.name",
          operator: "notEqual",
          value: {
            fact: "cwoData",
            path: "$.output.generalInformation.companyName"
          }
        }
      ]
    },
    event: {
      type: "nameUnequal",
      params:{
        gesuchtDebitor: {
          fact: "cwoData",
          path: "$.output.contactInformation.debitor.name",
        },
        gelesenDebitor: {
          fact: "cwoData",
          path: "$.output.generalInformation.companyName"
        }
      }
    }

  })

  // engine.addRule({
  //   event:{
  //     type: "plausible"
  //   }
  // })
  // engine.addRule({
  //   event:{
  //     type: "missingData"
  //   }
  // })
  // engine.addRule({
  //   event:{
  //     type: "implausible"
  //   }
  // })

  /**
   * Define a 'displayMessage' as a constant value
   * Fact values do NOT need to be known at engine runtime; see the
   * 03-dynamic-facts.js example for how to pull in data asynchronously during runtime
   */
  const facts = { displayMessage: true, llm_output: llm_output , cwoData: cwoData};

  // engine.run() evaluates the rule using the facts provided
  const { events } = await engine.run(facts);

  events.map((event) => console.log(event));
}
start();
/*
 * OUTPUT:
 *
 * Player has fouled out!
 */
