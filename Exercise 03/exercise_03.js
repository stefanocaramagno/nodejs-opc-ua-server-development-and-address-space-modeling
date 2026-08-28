/**
 * Utilizzare strumenti come UaModeler per creare uno o più namespaces, 
 * esportarli e utilizzarli per popolare l'addressSpace del server che vogliamo realizzare.
 * Aggiungere ad un AddressSpace creato nuovi Nodi tramite le funzioni di libreria dello stack OPC UA.
 * - Popolando sempre il namespace index 1.
 * 
 * Il programma che realizza un server OPC UA dovrà essere articolato nella seguente maniera:
 * 1. dichiarazioni varie;
 * 2. creazione dell'istanza del server;
 * 3. inizializzazione del server;
 * 4. personalizzazione dell’addressSpace;
 * 5. avvio del server.
 *
 * Il programma è basato sul costrutto async/await.
 * Ci sono delle operazioni che devono essere eseguite in modo sincrono/bloccante:
 * - inizializzazione del server;
 * - avvio del server,
 */

/**
 * Lo stack node-opcua è reso disponibile 
 * all'applicazione dall'istruzione 'require'.
 */
const opcua = require("node-opcua");

/**
 * Inseriamo nella variabile aspace il percorso 
 * del file xml esportato in precedenza.
 */
const aspace = "./myserver.xml"

/**
 * Creiamo una variabile che contiene l’information model standard (OPC UA)
 * più il custom namespace creato prima in UaModeler.
 * 
 * Ricordarsi che l'addressSpace avrà sempre i seguenti namespaces:
 * - Namespace di indice 0: contiene tutte le definizioni standard di OPC UA.
 * - Namespace di indice 1: riservato al server che espone l'addressSpace.
 * - Namespace di indice 2, etc.: usati nel caso di definizioni custom.
 * 
 * Questo significa che le nostre definizioni custom 
 * avranno indice 2 e non 1, come in ambito UaModeler.
 */
var xmlFiles = [
    opcua.nodesets.standard,
    aspace
];

/**
 * In JavaScript esiste un metodo chiamato isValidUser.
 *
 * Questo metodo può essere utilizzato per definire l'elenco delle coppie username e password 
 * che possono essere autorizzate, quando avviene l'autenticazione da parte del client.
 *
 * Definiamoci il seguente oggetto Javascript,che utilizza il metodo isValidUser.
 */
const userManager = {
  isValidUser: function(userName, password) {
    if (userName === "user1" && password === "pas1") {
        return true;
    }
    if (userName === "user2" && password === "pas2") {
        return true;
    }
    return false;
  }
};
  

(async()=>{
  try {

    /**
     * È necessario creare un'istanza del server OPC UA. 
     * Per personalizzare il nostro server possono essere aggiunte 
     * delle opzioni che modificano il comportamento del server.
     *
     * La configurazione della porta e del resourcePath permetterà 
     * di costruire l’URI del Discovery Endpoint del nostro server:
     * - opc.tcp://<hostname>:4334/UA/MyLittleServer --> Server started at opc.tcp://MSI:4334/UA/MyLittleServer
     * - <hostname> sarà sostituito dal nome del computer o dal nome di dominio completo.
     *
     * Al parametro nodeset_filename viene passata la variabile 
     * contenente l’addressSpace definito precedentemente 
     * 
     * Nella creazione dell'istanza del server, è possibile negare l'accesso anonimo 
     * e definire gli accessi (ad esempio con username e password).
     */
    const server = new opcua.OPCUAServer({
      port: 4334, 
      userManager,
      allowAnonymous: false,
      resourcePath: "/UA/MyLittleServer",
      nodeset_filename: xmlFiles,
    });
    
    /**
     * Una volta creato il server deve essere inizializzato. 
     * Durante l'inizializzazione, il server caricherà il suo set di nodi predefinito 
     * e preparerà l'associazione di tutte le variabili OPC UA standard.
     *
     * L'operazione di inizializzazione deve essere bloccante, 
     * in quanto nessuna altra operazione può essere fatta 
     * fino a quando il server non viene inizializzato.
     */
    await server.initialize();

    /**
     * Una volta che il server è stato inizializzato, possiamo:
     * - associare dei valori runtime ai nostri nodi creati con UaModeler;
     * - creare nuovi nodi ed associare ad essi dei valori runtime.
     * Per fare questo dobbiamo seguire i seguenti passaggi.
     */

    /**
     * Passaggio 1: Accedere all’addressSpace.
     */   
    const addressSpace = server.engine.addressSpace
   
    /**
     * Passaggio 2: Cercare attraverso il nodeId l’oggetto 
     * che contiene le proprietà e le variabili che vogliamo aggiornare. 
     * 
     * I valori degli indici i, possono essere ricavati da UaModeler, 
     * per il namespace bisogna ricordarsi che se in UaModeler ns=1, 
     * allora adesso il valore ns reale è 2.
     */
    const mySensor1=addressSpace.findNode('ns=2;i=5003')

    /**
     * Aggiornare il valore del componente dell’istanza.
     */
    mySensor1.producer.setValueFromSource({
        dataType: opcua.DataType.String,
        value: "Siemens"
    });
  
    /**
     * Aggiornare il valore del componente dell’istanza.
     */
    mySensor1.maintenance.setValueFromSource({
        dataType: opcua.DataType.String,
        value: "Intervallo"
    });
   
    /**
     * Aggiornare il valore del componente dell’istanza.
     */
    mySensor1.serialNumber.setValueFromSource({
        dataType: opcua.DataType.String,
        value: "1ABB3"
    });

    /**
     * Richiama ripetutamente una funzione o esegue un frammento di codice, 
     * con un ritardo fisso tra ogni chiamata.
     */    
    setInterval(() => {
        const value = 10 + 5 * Math.sin(Date.now() / 10000) + Math.random()*0.2;
        mySensor1.temperature.setValueFromSource({ dataType: opcua.DataType.Double, value });
    }, 100);
   
    /**
     * Passaggio 2: Cercare attraverso il nodeId l’oggetto 
     * che contiene le proprietà e le variabili che vogliamo aggiornare. 
     * 
     * I valori degli indici i, possono essere ricavati da UaModeler, 
     * per il namespace bisogna ricordarsi che se in UaModeler ns=1, 
     * allora adesso il valore ns reale è 2.
     */
    const mySensor2 = addressSpace.findNode('ns=2;i=5006')

    /**
     * Aggiornare il valore del componente dell’istanza.
     */    
    mySensor2.producer.setValueFromSource({
        dataType: opcua.DataType.String,
        value: "Siemens"
    });
  
     /**
     * Aggiornare il valore del componente dell’istanza.
     */    
    mySensor2.serialNumber.setValueFromSource({
        dataType: opcua.DataType.String,
        value: "1ABB3"
    });

    /**
     * Richiama ripetutamente una funzione o esegue un frammento di codice, 
     * con un ritardo fisso tra ogni chiamata.
     */       
    setInterval(() => {
        const value = 29 + 5 * Math.sin(Date.now() / 10000) + Math.random()*0.2;
        mySensor2.temperature.setValueFromSource({ dataType: opcua.DataType.Double, value });
    }, 100);
   
    /**
     * Passaggio 3: Accedere alla porzione riservata al server (Namespace index=1).
     */     
    const mynamespace = addressSpace.getOwnNamespace(); 
        
    /**
     * Una volta avuto accesso al namespace del server è possibile creare
     * tutti gli oggetti e/o tipi che si desidera, così come poi inizializzarli.
     * 
     * Nel seguito supporremo di realizzare un semplice esempio:
     * - definiamo un sottotipo di BaseObjectType, di nome "TemperatureSensorType", 
     *   composto da  DataVariable e da Proprietà (con Modelling Rules);
     * - definiamo un Folder sotto la cartella standard Objects, di nome "MySensors"
     * - istanziamo uno o più oggetti di tipo TemperatureSensorType
     *   dentro questa cartella MySensors;
     * - assegniamo dei valori agli oggetti istanziati.
     */ 

    /** 
     * Creiamo sotto lo standard Folder Objects, un Folder di nome "MySensors".
     */
    var objectFolder = mynamespace.addFolder(addressSpace.rootFolder.objects, { 
        browseName: "MySensors"
    });
    
    /** 
     * Creiamo nel namespace di index 1 del server, un nuovo ObjectType
     * TemperatureSensorType definito come SubType di BaseObjectType.
     * 
     * E' possibile inserire e inizializzare altri attributi.
     */
    var temperatureSensorType = mynamespace.addObjectType({
        browseName: "TemperatureSensorType"
    });
    
    /** 
     * Arricchiamo l'ObjectType TemperatureSensorType 
     * con componenti e proprietà. 
     * 
     * Ad esempio aggiungere una proprietà (Model) 
     * e una variabile (Temperature) all'ObjectType.
     * 
     * Nota: Ricordiamoci che possiamo specificare modellingRule 
     * come "Mandatory", "Optional", "PlaceHolderMandatory", "PlaceHolderOptional". 
     * Se manca modellingRule, si assume "Mandatory".
     */

    var model = mynamespace.addVariable({
        propertyOf: temperatureSensorType,
        browseName: 'Model',
        dataType: opcua.DataType.String,
        modellingRule: 'Mandatory',
    });
    
    var nSeries = mynamespace.addVariable({
        propertyOf: temperatureSensorType,
        browseName: 'NSeries',
        dataType: opcua.DataType.String,
        modellingRule: 'Mandatory',
    });
    
    var temperature = mynamespace.addVariable({
        componentOf: temperatureSensorType,
        browseName: 'Temperature',
        dataType: opcua.DataType.Double,
        modellingRule: 'Mandatory',
    });
    
    /**
     * Istanziamo un nodo Object dall'ObjectType TemperatureSensorType, 
     * inserendo le istanze nella cartella MySensors creata ad hoc.
     */
    var mySensor = temperatureSensorType.instantiate({
        browseName: "MyTemperatureSensor",
        organizedBy: objectFolder,
    });
    
    /** 
     * Per aggiornare il valore di un componente dell'oggetto appena istanziato, 
     * è stato già visto come fare
    */

    /**
     * Aggiornare il valore del componente dell’istanza.
     */
    mySensor.model.setValueFromSource({
        dataType: opcua.DataType.String,
        value: "1-Way",
    });
       
    /**
     * Aggiornare il valore del componente dell’istanza.
     */
    mySensor.nSeries.setValueFromSource({
        dataType: opcua.DataType.String,
        value: "ABCDEFGH",
    });
       
    /**
     * Richiama ripetutamente una funzione o esegue un frammento di codice, 
     * con un ritardo fisso tra ogni chiamata.
     */
    setInterval(() => {
        const value = 9 + 5 * Math.sin(Date.now() / 10000) + Math.random()*0.2;
        mySensor.temperature.setValueFromSource({ dataType: opcua.DataType.Double, value });
    }, 100);


   /** 
    * E' possibile fare anche altre operazioni, ad esempio quella di creare 
    * un nuovo ObjectType come SubType di un tipo derivato, 
    * ad esempio del tipo precedentemente creato TemperatureSensorType.
    */
    var specialTemperatureSensorType = namespace.addObjectType({
      browseName: "specialTemperatureSensorType",
      subTypeOf: temperatureSensorType
    });
    
    /**
     * Una volta che il server è stato creato e inizializzato, 
     * utilizziamo il metodo start per consentire al server 
     * di avviare tutti i suoi endpoint e iniziare ad ascoltare i client.
     * 
     * Anche questa operazione è bloccante.
     */ 
    await server.start();

    /**
     * Server started at opc.tcp://<hostname>:4334/UA/MyLittleServer
     */
    console.log("server started at ", server.getEndpointUrl());
    
  } catch(err) {
    console.log(err);
    process.exit(1);
  }
})();