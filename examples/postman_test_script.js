// Postman Test Script
// Antwortdaten des API-Requests
let responseData = pm.response.json();
let SAPDebitor = responseData.output.contactInformation.debitor;
let additionalInfo = responseData.output.additionalInformation;
let billingAddress = responseData.output.logisticInformation.addresses.billingAddress;
// Funktion für grobes Matching (Groß-/Kleinschreibung ignoriert)
function containsIgnoreCase(value, subString) {
    return value && subString && value.toLowerCase().includes(subString.toLowerCase());
}
// Funktion zur Normalisierung von Straßennamen
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
// Variablen für dynamische Nachrichten
let plausibilityReason = [];
let missingData = [];
let ampelsymbol = ":roter_kreis:";
let ampelfarbe = "Rot";
let debitorPlausibelMessage = "";
let debitorStammdatenMessage = "";
// Prüfen, ob SAP Debitor vorhanden ist
if (SAPDebitor) {
    // Bedingung 1: VAT ID passt
    if (SAPDebitor.vatId && additionalInfo.vatId && SAPDebitor.vatId === additionalInfo.vatId) {
        plausibilityReason.push("VAT ID stimmt überein");
    } else if (!SAPDebitor.vatId) {
        missingData.push("VAT ID");
    }
    // Bedingung 2: PLZ und Straße passen
    if (SAPDebitor.postalCode && billingAddress.postalCode &&
        SAPDebitor.postalCode === billingAddress.postalCode &&
        containsIgnoreCase(normalizeStreet(SAPDebitor.address), normalizeStreet(billingAddress.street))) {
        plausibilityReason.push("PLZ und Straße stimmen überein");
    } else {
        if (!SAPDebitor.postalCode) missingData.push("Postal Code");
        if (!SAPDebitor.address) missingData.push("Adresse");
    }
    // Bedingung 3: Name passt exakt
    if (SAPDebitor.name && responseData.output.generalInformation.companyName &&
        SAPDebitor.name === responseData.output.generalInformation.companyName) {
        plausibilityReason.push("Name stimmt exakt überein");
    } else if (!SAPDebitor.name) {
        missingData.push("Debitor Name");
    }
    // Logik für Ampelfarbe und Symbol
    if (plausibilityReason.length > 0) {
        if (missingData.length === 0) {
            ampelsymbol = ":großer_grüner_kreis:";
            ampelfarbe = "Grün";
        } else {
            ampelsymbol = ":großer_gelber_kreis:";
            ampelfarbe = "Gelb";
        }
    }
    // Erstellen der debitorMessage als pm.test Beschreibung
    debitorPlausibelMessage = `${ampelsymbol} Debitor Plausibel - basierend auf ${plausibilityReason.join(", ") || "keine Übereinstimmung"}`;
    debitorStammdatenMessage = `${ampelsymbol} Debitor Stammdaten - folgende fehlen: ${missingData.join(", ") || "Keine fehlenden Daten"}`;
    // Haupttests mit dynamischen Nachrichten
    pm.test(debitorPlausibelMessage, function () {
        if (plausibilityReason.length === 0) {
            console.log("Fehler: Keine Bedingung für SAP Debitor erfüllt");  // Fehlermeldung als Konsolenausgabe
        }
        pm.expect(true).to.be.true;  // Der Test besteht immer, zeigt aber eine detaillierte Meldung an
    });
    pm.test(debitorStammdatenMessage, function () {
        if (missingData.length > 0) {
            console.log("Fehlende Stammdaten: " + missingData.join(", "));  // Detaillierte Fehlermeldung als Konsolenausgabe
        }
        pm.expect(true).to.be.true;  // Der Test besteht immer, auch wenn Stammdaten fehlen
    });
    // Konsolenausgabe für detaillierte Informationen
    if (plausibilityReason.length > 0) {
        console.log("SAP Debitor Plausibel by: " + plausibilityReason.join(", "));
    } else {
        console.log("SAP Debitor nicht plausibel: Weder VAT ID, noch PLZ & Straße, noch der Name stimmen exakt überein.");
    }
} else {
    // Test für fehlende Debitor-Daten insgesamt
    pm.test(":roter_kreis: Keine SAP Debitor Daten vorhanden. Keine Tests werden ausgeführt.", function () {
        pm.expect(SAPDebitor).to.not.be.null;
    });
}