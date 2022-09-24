const mqtt = require('mqtt');
const MongoClient = require('mongodb');

console.log('middleware running...'); // test

const mqttClient = mqtt.connect('mqtt://127.0.0.1'/*'mqtts://mqtt.litcons.eu'*/,
 {username: 'litmqtt', password:'litmqtt1980'}
);

const mongodbUrl = 'mongodb+srv://xxxxxx:xxxxxx@liturgy0-opnag.mongodb.net?retryWrites=true&w=majority';

const odb = 'allObjects';

mqttClient.on('connect', function(){
    console.log('connected to liturgy mqtt broker'); // test 
    mqttClient.subscribe('objects/raw');  
});

MongoClient.connect(mongodbUrl, {
    useUnifiedTopology: true,
    useNewUrlParser: true
}, (error, odbClient) => {
    if (error){
        return console.log('cannot connect to db');
    }
    console.log('connected!'); // test
    const handOnDb = odbClient.db(odb);
    mqttClient.on('message', function(topic, message){
        // console.log(JSON.parse(message)); // test only
        try {
            integratedMessage = JSON.parse(message);
            objectID = integratedMessage.id;
            collectionName = objectID;
            delete integratedMessage.id;
            cleanMessage = integratedMessage;
            cleanMessage.when = Date.now();
            // console.log(cleanMessage); // test only
            if (objectID != null || objectID != undefined){
                handOnDb.listCollections({"name": objectID}).next(function (err, collinfo){
                    if(!collinfo) {
                        // console.log('collection does not exist, creating a new one...'); // test
                        handOnDb.createCollection(objectID, {"capped": true, "size": 1785600, "max": 14400}, function(err, collection){
                            // console.log(collection);
                            if (err) throw console.log('could not create a new collection!');
                            collection.insertOne(cleanMessage, function(err, result){
                                if (err) throw console.log('could not write to the new collection!');
                                // console.log('inserted');
                            });
                        })
                    } else {
                        // console.log('collection already exists...inserting in existing one'); //test
                        handOnDb.collection(collectionName).insertOne(cleanMessage, function (err, result) {
                            if (err) throw console.log('cannot write to an already existing collection!');
                            // console.log('inserted'); // test
                        })
                    }
                });
            } else {
                // console.log('the id sent was undefined!...'); // test
            }
        } catch (err){
            // console.log('parse error'); // test
        }
    });
});
