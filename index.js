// This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
// Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
// session persistence, api calls, and more.
const Alexa = require('ask-sdk-core');
const i18n = require('i18next');
const sprintf = require('i18next-sprintf-postprocessor');

const languageStrings = {
    en: {
        translation: {
            WELCOME_MESSAGE: 'Welcome to Tutifruti, ask for a letter to begin',
            CLARIFY_MESSAGE: 'Yo can say "give me a letter" or "i want a letter" to begin',
            RANDOM_LETTER_ASK: 'Take it, this is the letter you ask for: %s',
            TEXT_RESULT: 'Your answer has been %s, took you %s seconds and your score is %s'
        }
    },
    es: {
        translation: {
            WELCOME_MESSAGE: 'Bienvenido a Tutifruti, pide "una letra" para empezar',
            CLARIFY_MESSAGE: 'Puedes decir "dame una letra" o "quiero una letra" para empezar',
            RANDOM_LETTER_ASK: 'Toma, esta es la letra que debes usar: %s',
            TEXT_RESULT: 'Tu respuesta ha sido %s, has tardado %s segundos y tu puntuación es %s'
        }
    }
};

const timerUtils = require('./timerUtils');

const randomLetterGenerator = require('./randomLetterGenerator');
let gameState = 0;
let letra = '';
let puntuacion = 0;

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
        const speechText = requestAttributes.t('WELCOME_MESSAGE');
        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};
const RandomLetterIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'RandomLetterIntent';
    },
    handle(handlerInput) {
        const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
        const randomLetter = randomLetterGenerator.getOneRandomLetter();
        const speechText = requestAttributes.t('RANDOM_LETTER_ASK', randomLetter);
        timerUtils.startTimer();
        puntuacion = 0;
        letra = randomLetter;
        gameState = 1;
        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};
const WaitAnswerIntentHandler = {
    canHandle(handlerInput){
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
        && Alexa.getIntentName(handlerInput.requestEnvelope) === 'WaitAnswerIntent'
        && gameState > 0;
    },
    handle(handlerInput){
        const intent = handlerInput.requestEnvelope.request.intent;

        const animal = intent.slots.ANIMAL.value;
        const country = intent.slots.COUNTRY.value;
        const color = intent.slots.COLOR.value;
        const food = intent.slots.FOOD.value;

        let cadenaFinal = '';
        let tiempoFinal = 0;

        if(animal && animal[0]===letra){
            puntuacion = puntuacion + 10;
            cadenaFinal = cadenaFinal + ' ' + animal;
        }
        if(country && country[0]===letra){
            puntuacion = puntuacion + 10;
            cadenaFinal = cadenaFinal + ' ' + country;
        }
        if(color && color[0]===letra){
            puntuacion = puntuacion + 10;
            cadenaFinal = cadenaFinal + ' ' + color;
        }
        if(food && food[0]===letra){
            puntuacion = puntuacion + 10;
            cadenaFinal = cadenaFinal + ' ' + food;
        }

        tiempoFinal = timerUtils.endTimer();
        puntuacion = puntuacion - tiempoFinal;

        if(!cadenaFinal){cadenaFinal='ninguna'}
        const repromtText = 'pídeme otra letra para seguir jugando';
        const speakOutput = `Tu respuesta válida fue ${cadenaFinal}, has tardado ${tiempoFinal.toString()} segundos y tu puntuación es ${puntuacion.toString()}`;
        gameState = 0;
        return handlerInput.responseBuilder
        .speak(speakOutput)
        .reprompt(repromtText)
        .getResponse();
    }
};
const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'You can say hello to me! How can I help?';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Adios!';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse();
    }
};

// The intent reflector is used for interaction model testing and debugging.
// It will simply repeat the intent the user said. You can create custom handlers
// for your intents by defining them above, then also adding them to the request
// handler chain below.
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = requestAttributes.t('CLARIFY_MESSAGE');
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

// Generic error handling to capture any syntax or routing errors. If you receive an error
// stating the request handler chain is not found, you have not implemented a handler for
// the intent being invoked or included it in the skill builder below.
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`~~~~ Error handled: ${error.stack}`);
        const speakOutput = `Sorry, I had trouble doing what you asked. Please try again.`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const LoggingRequestInterceptor = {
    process(handlerInput) {
        console.log(`Incoming request: ${JSON.stringify(handlerInput.requestEnvelope.request)}`);
    }
}
const LoggingResponseInterceptor = {
    process(handlerInput, response) {
        console.log(`Outgoing response: ${JSON.stringify(response)}`);
    }
}

const LocatizationInterceptor = {
    process(handlerInput) {
        const localizationClient = i18n.use(sprintf).init({
            lng: handlerInput.requestEnvelope.request.locale,
            falbackLng: 'en',
            overloadTranslationOptionHandler: sprintf.overloadTranslationOptionHandler,
            resources: languageStrings,
            returnObjects: true
        });

        const attributes = handlerInput.attributesManager.getRequestAttributes();
        attributes.t = function(...args) {
            return localizationClient.t(...args);
        }

    }
}

// The SkillBuilder acts as the entry point for your skill, routing all request and response
// payloads to the handlers above. Make sure any new handlers or interceptors you've
// defined are included below. The order matters - they're processed top to bottom.
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        RandomLetterIntentHandler,
        WaitAnswerIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler, // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
    )
    .addErrorHandlers(
        ErrorHandler,
    )
    .addRequestInterceptors(LoggingRequestInterceptor, LocatizationInterceptor)
    .addResponseInterceptors(LoggingResponseInterceptor)
    .lambda();
