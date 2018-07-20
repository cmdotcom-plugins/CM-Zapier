require('json5/lib/register')
const config = require('../config.json5')

const ZapierRequest = require("../model/ZapierRequest")
const VoiceMessage = require("../model/VoiceMessage")
const Voice = require("../model/Voice")
const errorHandler = require("../ErrorHandlerCM")
const { ZapierField, ZapierGroup, ZapierInputField } = require("../model/ZapierFields")

const makeRequest = async (z, bundle) => {
    let toNumbersList = bundle.inputData.to
    toNumbersList = toNumbersList.length == 1 && toNumbersList[0].includes(",") ? toNumbersList[0].split(",") : toNumbersList
    
    const voice = new Voice(bundle.inputData.language, bundle.inputData.gender, bundle.inputData.number)
    const voiceMessage = new VoiceMessage(bundle.inputData.from, toNumbersList, bundle.inputData.messageContent, voice)
    
    const response = await z.request(new ZapierRequest("https://api.cmtelecom.com/voiceapi/v2/Notification", "POST", voiceMessage))
    
    errorHandler(response.status, response.content)
    
    return {
        result: "success"
    }
}

module.exports = {
	key: 'voiceMessage',
	noun: 'Voice',
	
	display: {
		label: 'Send Voice (Text to Speech) Message',
		description: 'Send a voice message to one or multiple people. A speech engine will tell the text message you gave in the selected language, dialect and gender. The recipient will receive the message as a call.',
		hidden: false,
		important: true
	},
	
	operation: {
		inputFields: [
            new ZapierInputField.Builder("from", "From")
                .setDescription(`The sender of the message, which must be a [phone number (with country code)](${config.links.helpDocs.phoneNumberFormat}).`)
                .build(), 
            new ZapierInputField.Builder("to", "To")
                .setDescription(`The [recipient numbers (with country code)](${config.links.helpDocs.phoneNumberFormat}) to whom you want to send the message.\n\nYou can use the list functionality, or put all your numbers into the first field seperated by a comma.`)
                .asList()
                .build(), 
            new ZapierInputField.Builder("messageContent", "Text", "text")
                .setDescription(`The content of the message. The speech engine will tell this message.\n\nNote: emoji don't work, you can't use emoji in spoken language.`)
                .build(), 
            {
                key: "voice_options",
                label: "Voice Options",
                children: [
                    {
                        key: 'language',
                        label: 'Language',
                        helpText: `The language of the message.\nThere are several languages and dialects available.`,
                        type: 'string',
                        required: true,
                        dynamic: "voiceLanguages.id.name"
                    }, {
                        key: 'gender',
                        label: 'Gender',
                        helpText: `The voice of the generated message.\n\nNote: not all voices support all genders, [check this list for the supported genders](${config.links.helpDocs.voiceGenders}).`,
                        type: 'string',
                        required: true,
                        default: 'Female',
                        choices: { 
                            Female: 'Female', 
                            Male: 'Male' 
                        }
                    }, {
                        key: 'number',
                        label: 'Number',
                        helpText: `The number of the voice to use, [check this list for the supported numbers](${config.links.helpDocs.voiceNumbers}).`,
                        type: 'integer',
                        required: true,
                        default: '1'
                    }
                ]
            }
		],
		outputFields: [
            {
                key: "result",
                label: "Result"
            }
        ],
		perform: makeRequest,
		sample: {
            result: "success"
        }
	}
}