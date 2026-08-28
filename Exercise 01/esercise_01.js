/**
 * Utilizzare strumenti come UaModeler per creare uno o più namespaces, 
 * esportarli e utilizzarli per popolare l'addressSpace del server che vogliamo realizzare.
 * I namespaces importati avranno namespace index > 1.
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
     */
    const server = new opcua.OPCUAServer({
      port: 4334, 
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
     * Una volta che il server è stato inizializzato, possiamo associare 
     * dei valori runtime ai nostri nodi personalizzati.
     * - Ad esempio vogliamo assegnare dei valori agli oggetti dell'addressSpace
     *
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
    const mySensor1 = addressSpace.findNode('ns=2;i=5003')

    /**
     * Aggiornare il valore del componente dell’istanza.
     */
    mySensor1.producer.setValueFromSource({
      dataType: opcua.DataType.String,
      value: "Siemens"
    });
  
    /**
     *Aggiornare il valore del componente dell’istanza.
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
      const value = 6 + 5 * Math.sin(Date.now() / 10000) + Math.random() * 0.2;
      mySensor1.temperature.setValueFromSource({ 
        dataType: opcua.DataType.Double, 
        value });
    }, 100);
   
    /**
     * Passaggio 2: Cercare attraverso il nodeId l’oggetto 
     * che contiene le proprietà e le variabili che vogliamo aggiornare. 
     * 
     * I valori degli indici i, possono essere ricavati da UaModeler, 
     * per il namespace bisogna ricordarsi che se in UaModeler ns=1, 
     * allora adesso il valore ns reale è 2.
     */
    const mySensor2=addressSpace.findNode('ns=2;i=5006')

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
      const value = 19 + 5 * Math.sin(Date.now() / 10000) + Math.random() * 0.2;
      mySensor2.temperature.setValueFromSource({ dataType: opcua.DataType.Double, value });
    }, 100);
   
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