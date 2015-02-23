/**
 * Created with JetBrains WebStorm.
 * User: hermenegildoromero
 * Date: 10/01/15
 * Time: 08:02
 * To change this template use File | Settings | File Templates.
 */

app.service('reportModel' , function ($http, $q, $filter, ngTableParams) {
    this.data = null;

    hashCode = function(s){
        return s.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);
    }

    this.getReport = function($scope, id, done) {
        /*
        var d = $q.defer();

        $http({method: 'GET', url: '/api/get_report', params: {id: id}})
            .success(angular.bind(this, function (data) {
                d.resolve(data);
                if (data.result == 0) {
                    noty({text: data.msg,  timeout: 2000, type: 'error'});
                    return;
                }

                done(data.item);
            }))
            .error(angular.bind(this, function (data) {
                this.data = null;
            }));

        return d.promise;


         */

        if (id == '11111')
            done({_id:'11111',reportType:"chart",reportSubType:"line",properties:[{xkey:"day",ykeys:["visitorsCount"],labels:["Total Visits"],xlabels:["day"]}],queries:[]});
        if (id == '22222')
            done({_id:'22222',reportType:"chart",reportSubType:"donut",properties:[{labelField:"thelabelfield",valueField:"theValueField"}],queries:[]});
        if (id == '33333')
            done({_id:'33333',reportType:"chart",reportSubType:"bar",properties:[{xkey:"y",ykeys:["a","b"],labels:["Series A","Series B"]}],queries:[]});
        if (id == '44444')
            done({_id:'44444',reportType:"chart",reportSubType:"area",properties:[{xkey:"y",ykeys:["a","b"],labels:["Series A","Series B"],colors:["#FF0000","#ce8483"]}],queries:[]});
        if (id == '55555')
            done({_id:'55555',reportType:"grid",reportSubType:"",properties:[{fields:[{fieldName:"nombrecampo1",fieldAlias:"Alias campo 1"},{fieldName:"nombrecampo2",fieldAlias:"Alias campo 2"},{fieldName:"nombrecampo3",fieldAlias:"Alias campo 3"},{fieldName:"nombrecampo4",fieldAlias:"Alias campo 4"}]}]});
        if (id == '66666')
            done({_id:'66666',reportType:"pivot",reportSubType:"",properties:[{fields:[{fieldName:"nombrecampo1",fieldAlias:"Alias campo 1"},{fieldName:"nombrecampo2",fieldAlias:"Alias campo 2"},{fieldName:"nombrecampo3",fieldAlias:"Alias campo 3"},{fieldName:"nombrecampo4",fieldAlias:"Alias campo 4"}]}]});
        if (id == '77777')
            done({_id:'77777',reportType:"indicator",reportSubType:"style1",properties:[],queries:[]});
        if (id == '88888')
            done({_id:'88888',reportType:"indicator",reportSubType:"style2",properties:[],queries:[]});
        if (id == '99999')
            done({_id:'99999',reportType:"indicator",reportSubType:"style3",properties:[],queries:[]});
        if (id == '101010')
            done({_id:'101010',reportType:"vectorMap",reportSubType:"world",properties:[],queries:[]});
        if (id == '22222a')
            done({_id:'22222a',reportType:"chart",reportSubType:"donut",properties:[{labelField:"thelabelfield",valueField:"theValueField"}],queries:[]});

        if (id == '22222b')
            done({_id:'22222b',reportType:"chart",reportSubType:"donut",properties:[{labelField:"thelabelfield",valueField:"theValueField",colors:['#00ff37','#FF0000']}],queries:[]});

        if (id == '22222c')
            done({_id:'22222c',reportType:"chart",reportSubType:"donut",properties:[{labelField:"thelabelfield",valueField:"theValueField"}],queries:[]});

        if (id == '22222d')
            done({_id:'22222d',reportType:"chart",reportSubType:"donut",properties:[{labelField:"thelabelfield",valueField:"theValueField"}],queries:[]});

        if (id == '88888a')
            done({_id:'88888a',reportType:"indicator",reportSubType:"style2",properties:[{valueText:"Valor de cliente",valueType:"nominal",valueIcon:"li-cloud",backgroundColor:"#68B828",fontColor:"#fff"}],queries:[]});
        if (id == '88888b')
            done({_id:'88888b',reportType:"indicator",reportSubType:"style2",properties:[{valueText:"Tasa de retorno de clientes",valueType:"percentage",valueIcon:"li-cloud",backgroundColor:"#68B828",fontColor:"#fff"}],queries:[]});


        if (id == '99999a')
            done({_id:'99999a',reportType:"indicator",reportSubType:"style3",properties:[{valueText:"Gasto medio por cliente / día",valueType:"currency",valueIcon:"li-cloud",currencySymbol:"€",backgroundColor:"#59b0f2",fontColor:"#fff",auxFontColor:"#fff"}],queries:[]});

        if (id == '55555a')
            done({_id:'55555a',reportType:"grid",reportSubType:"",properties:[{idField:"id",fields:[{fieldName:"nombre",fieldAlias:"Nombre"},{fieldName:"nacionalidad",fieldAlias:"Nacionalidad"},{fieldName:"fecha",fieldAlias:"Ultima visita"},{fieldName:"valor",fieldAlias:"valor"},{fieldName:"satisfaccion",fieldAlias:"Ind. Satisfacción"},{fieldName:"origen",fieldAlias:"Origen"}],actions:[{actionEvent:"onRowClick",actionType:"goToDashBoard",targetID:"clientDashboard",targetFilters:['customerID']}]}]});
        if (id == '101011')
            done({_id:'101011',reportType:"readOnlyForm",reportSubType:"",properties:[{idField:"id",fields:[{fieldName:"nombre",fieldAlias:"Nombre"},{fieldName:"nacionalidad",fieldAlias:"Nacionalidad"},{fieldName:"fecha",fieldAlias:"Ultima visita"},{fieldName:"valor",fieldAlias:"valor"},{fieldName:"satisfaccion",fieldAlias:"Ind. Satisfacción"},{fieldName:"origen",fieldAlias:"Origen"},{fieldName:"observaciones",fieldAlias:"Observaciones"}],actions:[{actionEvent:"onRowClick",actionType:"goToDashBoard",targetID:"clientDashboard",targetFilters:['customerID']}]}]});

        if (id == 'XXXXXXa')
            done({_id:'XXXXXXa',reportType:"grid",reportSubType:"",properties:[{fields:[{fieldName:"fecha",fieldAlias:"Fecha"},{fieldName:"dias",fieldAlias:"Nº Dias"},{fieldName:"personas",fieldAlias:"Nº Personas"},{fieldName:"habitaciones",fieldAlias:"Nº Habitaciones"},{fieldName:"origen",fieldAlias:"Origen"}],actions:[{actionEvent:"onRowClick",actionType:"goToDashBoard",targetID:"clientDashboard",targetFilters:['customerID']}]}]});

        if (id == 'XXXXXXb')
            done({_id:'XXXXXXb',reportType:"grid",reportSubType:"",properties:[{idField:"id",fields:[{fieldName:"id",fieldAlias:"Nº incidencia"},{fieldName:"fecha",fieldAlias:"Fecha"},{fieldName:"estado",fieldAlias:"Estado"},{fieldName:"asunto",fieldAlias:"Asunto"}],actions:[{actionEvent:"onRowClick",actionType:"goToDashBoard",targetID:"clientDashboard",targetFilters:['customerID']}]}]});

        if (id == 'XXXXXXc')
            done({_id:'XXXXXXc',reportType:"grid",reportSubType:"",properties:[{fields:[{fieldName:"id",fieldAlias:"Nº Factura"},{fieldName:"fecha",fieldAlias:"Fecha"},{fieldName:"importe",fieldAlias:"Importe"},{fieldName:"abonado",fieldAlias:"Pagado con"}],actions:[{actionEvent:"onRowClick",actionType:"goToDashBoard",targetID:"clientDashboard",targetFilters:['customerID']}]}]});


    };

    function getTheData(id, done)
    {
        if (id == "22222a")
        {
            done(  [{label: "Clientes Nuevos", value: 78},{label: "Clientes Recurrentes", value: 22}]);
        }

        if (id == "22222b")
        {
            done(  [{label: "Generación propia", value: 12},{label: "Touroperadores", value: 88}]);
        }

        if (id == "22222c")
        {
            done(  [{label: "Download Sales", value: 12},{label: "In-Store Sales", value: 30},{label: "Mail-Order Sales", value: 20}]);
        }

        if (id == "88888a")
        {
            done(  [{value: 6,evolution:12}]);
        }
        if (id == "88888b")
        {
            done(  [{value: 12,evolution:32}]);
        }
        if (id == "99999a")
        {
            done(  [{value: 145.32,evolution:2}]);
        }

        if (id == "55555")
        {
            done(  [
                { nombrecampo1: '2006', nombrecampo2: 100, nombrecampo3: 90, nombrecampo4: "Mene" },
                { nombrecampo1: '2006', nombrecampo2: 100, nombrecampo3: 90, nombrecampo4: "Mene2" },
                { nombrecampo1: '2006', nombrecampo2: 100, nombrecampo3: 90, nombrecampo4: "Mene3" },
                { nombrecampo1: '2006', nombrecampo2: 600, nombrecampo3: 90, nombrecampo4: "Mene4" },
                { nombrecampo1: '2006', nombrecampo2: 100, nombrecampo3: 90, nombrecampo4: "Mene5" },
                { nombrecampo1: '2006', nombrecampo2: 100, nombrecampo3: 90, nombrecampo4: "Mene6" },
                { nombrecampo1: '2006', nombrecampo2: 500, nombrecampo3: 90, nombrecampo4: "Mene7" }
            ]);
        }

        if (id == "55555a")
        {
            done(  [
                {
                    "id": 1000,
                    "nombre": "Philip Haney",
                    "nacionalidad": "Saint Lucia",
                    "fecha": "08/12/2014",
                    "valor": 4,
                    "satisfaccion": 5,
                    "origen": "integrador"
                },
                {
                    "id": 1001,
                    "nombre": "Vanna Camacho",
                    "nacionalidad": "Tuvalu",
                    "fecha": "29/12/2014",
                    "valor": 4,
                    "satisfaccion": 5,
                    "origen": "agencia"
                },
                {
                    "id": 1002,
                    "nombre": "Susan Clemons",
                    "nacionalidad": "Fiji",
                    "fecha": "05/12/2014",
                    "valor": 9,
                    "satisfaccion": 2,
                    "origen": "Touroperador"
                },
                {
                    "id": 1003,
                    "nombre": "Briar Richards",
                    "nacionalidad": "Monaco",
                    "fecha": "13/01/2015",
                    "valor": 6,
                    "satisfaccion": 5,
                    "origen": "agencia"
                },
                {
                    "id": 1004,
                    "nombre": "Len Acevedo",
                    "nacionalidad": "Georgia",
                    "fecha": "29/12/2014",
                    "valor": 10,
                    "satisfaccion": 1,
                    "origen": "agencia"
                },
                {
                    "id": 1005,
                    "nombre": "April Conner",
                    "nacionalidad": "Estonia",
                    "fecha": "02/01/2015",
                    "valor": 9,
                    "satisfaccion": 4,
                    "origen": "integrador"
                },
                {
                    "id": 1006,
                    "nombre": "Reese Booth",
                    "nacionalidad": "Armenia",
                    "fecha": "14/01/2015",
                    "valor": 6,
                    "satisfaccion": 3,
                    "origen": "agencia"
                },
                {
                    "id": 1007,
                    "nombre": "Nadine Moses",
                    "nacionalidad": "Burkina Faso",
                    "fecha": "31/12/2014",
                    "valor": 3,
                    "satisfaccion": 2,
                    "origen": "agencia"
                },
                {
                    "id": 1008,
                    "nombre": "Doris Richardson",
                    "nacionalidad": "Curaçao",
                    "fecha": "14/12/2014",
                    "valor": 6,
                    "satisfaccion": 2,
                    "origen": "agencia"
                },
                {
                    "id": 1009,
                    "nombre": "Rylee Cochran",
                    "nacionalidad": "Madagascar",
                    "fecha": "12/12/2014",
                    "valor": 10,
                    "satisfaccion": 5,
                    "origen": "web"
                },
                {
                    "id": 1010,
                    "nombre": "Dara Estes",
                    "nacionalidad": "Tajikistan",
                    "fecha": "06/12/2014",
                    "valor": 5,
                    "satisfaccion": 1,
                    "origen": "web"
                },
                {
                    "id": 1011,
                    "nombre": "Nolan Buckner",
                    "nacionalidad": "Qatar",
                    "fecha": "08/12/2014",
                    "valor": 9,
                    "satisfaccion": 5,
                    "origen": "web"
                },
                {
                    "id": 1012,
                    "nombre": "Rogan Raymond",
                    "nacionalidad": "Madagascar",
                    "fecha": "21/12/2014",
                    "valor": 10,
                    "satisfaccion": 3,
                    "origen": "agencia"
                },
                {
                    "id": 1013,
                    "nombre": "Raven Odom",
                    "nacionalidad": "Trinidad and Tobago",
                    "fecha": "01/01/2015",
                    "valor": 1,
                    "satisfaccion": 2,
                    "origen": "agencia"
                },
                {
                    "id": 1014,
                    "nombre": "Gretchen Conway",
                    "nacionalidad": "South Africa",
                    "fecha": "07/01/2015",
                    "valor": 5,
                    "satisfaccion": 1,
                    "origen": "Touroperador"
                },
                {
                    "id": 1015,
                    "nombre": "Wynter Dudley",
                    "nacionalidad": "Puerto Rico",
                    "fecha": "08/12/2014",
                    "valor": 3,
                    "satisfaccion": 2,
                    "origen": "integrador"
                },
                {
                    "id": 1016,
                    "nombre": "Hadley Hughes",
                    "nacionalidad": "Japan",
                    "fecha": "17/12/2014",
                    "valor": 8,
                    "satisfaccion": 5,
                    "origen": "integrador"
                },
                {
                    "id": 1017,
                    "nombre": "Nathan French",
                    "nacionalidad": "Heard Island and Mcdonald Islands",
                    "fecha": "10/01/2015",
                    "valor": 7,
                    "satisfaccion": 2,
                    "origen": "integrador"
                },
                {
                    "id": 1018,
                    "nombre": "Veronica Donaldson",
                    "nacionalidad": "Dominica",
                    "fecha": "03/12/2014",
                    "valor": 1,
                    "satisfaccion": 2,
                    "origen": "integrador"
                },
                {
                    "id": 1019,
                    "nombre": "Unity Rutledge",
                    "nacionalidad": "South Sudan",
                    "fecha": "31/12/2014",
                    "valor": 1,
                    "satisfaccion": 4,
                    "origen": "web"
                },
                {
                    "id": 1020,
                    "nombre": "Allistair Chandler",
                    "nacionalidad": "New Caledonia",
                    "fecha": "03/01/2015",
                    "valor": 7,
                    "satisfaccion": 4,
                    "origen": "agencia"
                },
                {
                    "id": 1021,
                    "nombre": "Halee Allison",
                    "nacionalidad": "Panama",
                    "fecha": "17/12/2014",
                    "valor": 2,
                    "satisfaccion": 2,
                    "origen": "integrador"
                },
                {
                    "id": 1022,
                    "nombre": "Olympia Bartlett",
                    "nacionalidad": "Macedonia",
                    "fecha": "27/12/2014",
                    "valor": 8,
                    "satisfaccion": 2,
                    "origen": "Touroperador"
                },
                {
                    "id": 1023,
                    "nombre": "Idona Walsh",
                    "nacionalidad": "Lebanon",
                    "fecha": "12/01/2015",
                    "valor": 1,
                    "satisfaccion": 3,
                    "origen": "integrador"
                },
                {
                    "id": 1024,
                    "nombre": "Diana Phillips",
                    "nacionalidad": "Jamaica",
                    "fecha": "14/01/2015",
                    "valor": 3,
                    "satisfaccion": 4,
                    "origen": "Touroperador"
                },
                {
                    "id": 1025,
                    "nombre": "Serina Bright",
                    "nacionalidad": "Turks and Caicos Islands",
                    "fecha": "01/01/2015",
                    "valor": 7,
                    "satisfaccion": 5,
                    "origen": "integrador"
                },
                {
                    "id": 1026,
                    "nombre": "Alika Lawson",
                    "nacionalidad": "French Guiana",
                    "fecha": "04/12/2014",
                    "valor": 2,
                    "satisfaccion": 2,
                    "origen": "Touroperador"
                },
                {
                    "id": 1027,
                    "nombre": "Emery Herrera",
                    "nacionalidad": "Colombia",
                    "fecha": "03/12/2014",
                    "valor": 10,
                    "satisfaccion": 3,
                    "origen": "web"
                },
                {
                    "id": 1028,
                    "nombre": "Zenaida Wade",
                    "nacionalidad": "Holy See (Vatican City State)",
                    "fecha": "01/12/2014",
                    "valor": 8,
                    "satisfaccion": 2,
                    "origen": "web"
                },
                {
                    "id": 1029,
                    "nombre": "Ora Benton",
                    "nacionalidad": "Canada",
                    "fecha": "30/12/2014",
                    "valor": 3,
                    "satisfaccion": 4,
                    "origen": "integrador"
                },
                {
                    "id": 1030,
                    "nombre": "Nell Hebert",
                    "nacionalidad": "Tokelau",
                    "fecha": "13/01/2015",
                    "valor": 5,
                    "satisfaccion": 1,
                    "origen": "agencia"
                },
                {
                    "id": 1031,
                    "nombre": "Quyn Lynch",
                    "nacionalidad": "Chad",
                    "fecha": "21/12/2014",
                    "valor": 2,
                    "satisfaccion": 2,
                    "origen": "agencia"
                },
                {
                    "id": 1032,
                    "nombre": "Ima Stout",
                    "nacionalidad": "Belize",
                    "fecha": "25/12/2014",
                    "valor": 7,
                    "satisfaccion": 2,
                    "origen": "agencia"
                },
                {
                    "id": 1033,
                    "nombre": "Clarke Martinez",
                    "nacionalidad": "Qatar",
                    "fecha": "05/01/2015",
                    "valor": 2,
                    "satisfaccion": 4,
                    "origen": "web"
                },
                {
                    "id": 1034,
                    "nombre": "Natalie Barron",
                    "nacionalidad": "Turkmenistan",
                    "fecha": "06/12/2014",
                    "valor": 3,
                    "satisfaccion": 2,
                    "origen": "integrador"
                },
                {
                    "id": 1035,
                    "nombre": "Brielle Workman",
                    "nacionalidad": "Bermuda",
                    "fecha": "23/12/2014",
                    "valor": 1,
                    "satisfaccion": 1,
                    "origen": "Touroperador"
                },
                {
                    "id": 1036,
                    "nombre": "Colt Goodwin",
                    "nacionalidad": "Panama",
                    "fecha": "03/12/2014",
                    "valor": 3,
                    "satisfaccion": 2,
                    "origen": "web"
                },
                {
                    "id": 1037,
                    "nombre": "Liberty Gillespie",
                    "nacionalidad": "Serbia",
                    "fecha": "02/01/2015",
                    "valor": 10,
                    "satisfaccion": 5,
                    "origen": "integrador"
                },
                {
                    "id": 1038,
                    "nombre": "Paula Juarez",
                    "nacionalidad": "Wallis and Futuna",
                    "fecha": "09/01/2015",
                    "valor": 3,
                    "satisfaccion": 1,
                    "origen": "web"
                },
                {
                    "id": 1039,
                    "nombre": "Ocean Mays",
                    "nacionalidad": "French Polynesia",
                    "fecha": "03/01/2015",
                    "valor": 3,
                    "satisfaccion": 3,
                    "origen": "integrador"
                },
                {
                    "id": 1040,
                    "nombre": "Scarlet Scott",
                    "nacionalidad": "Panama",
                    "fecha": "02/12/2014",
                    "valor": 3,
                    "satisfaccion": 4,
                    "origen": "agencia"
                },
                {
                    "id": 1041,
                    "nombre": "Bruce Riley",
                    "nacionalidad": "Barbados",
                    "fecha": "08/01/2015",
                    "valor": 7,
                    "satisfaccion": 3,
                    "origen": "agencia"
                },
                {
                    "id": 1042,
                    "nombre": "Vielka Jenkins",
                    "nacionalidad": "Latvia",
                    "fecha": "17/12/2014",
                    "valor": 6,
                    "satisfaccion": 5,
                    "origen": "integrador"
                },
                {
                    "id": 1043,
                    "nombre": "September Sawyer",
                    "nacionalidad": "Saudi Arabia",
                    "fecha": "13/12/2014",
                    "valor": 9,
                    "satisfaccion": 2,
                    "origen": "agencia"
                },
                {
                    "id": 1044,
                    "nombre": "Elton Hooper",
                    "nacionalidad": "Laos",
                    "fecha": "29/12/2014",
                    "valor": 1,
                    "satisfaccion": 2,
                    "origen": "agencia"
                },
                {
                    "id": 1045,
                    "nombre": "Jenna Waters",
                    "nacionalidad": "Egypt",
                    "fecha": "24/12/2014",
                    "valor": 3,
                    "satisfaccion": 4,
                    "origen": "agencia"
                },
                {
                    "id": 1046,
                    "nombre": "TaShya Carroll",
                    "nacionalidad": "Indonesia",
                    "fecha": "21/12/2014",
                    "valor": 7,
                    "satisfaccion": 3,
                    "origen": "integrador"
                },
                {
                    "id": 1047,
                    "nombre": "Hamilton Cleveland",
                    "nacionalidad": "Kuwait",
                    "fecha": "13/12/2014",
                    "valor": 6,
                    "satisfaccion": 2,
                    "origen": "Touroperador"
                },
                {
                    "id": 1048,
                    "nombre": "Warren Mccarthy",
                    "nacionalidad": "Virgin Islands, British",
                    "fecha": "21/12/2014",
                    "valor": 2,
                    "satisfaccion": 3,
                    "origen": "web"
                },
                {
                    "id": 1049,
                    "nombre": "Stacy Spencer",
                    "nacionalidad": "South Africa",
                    "fecha": "23/12/2014",
                    "valor": 6,
                    "satisfaccion": 1,
                    "origen": "agencia"
                },
                {
                    "id": 1050,
                    "nombre": "Nyssa Morton",
                    "nacionalidad": "Dominican Republic",
                    "fecha": "02/01/2015",
                    "valor": 1,
                    "satisfaccion": 3,
                    "origen": "Touroperador"
                },
                {
                    "id": 1051,
                    "nombre": "Irene Fuller",
                    "nacionalidad": "Cape Verde",
                    "fecha": "04/01/2015",
                    "valor": 8,
                    "satisfaccion": 1,
                    "origen": "web"
                },
                {
                    "id": 1052,
                    "nombre": "Maris Cox",
                    "nacionalidad": "Northern Mariana Islands",
                    "fecha": "17/12/2014",
                    "valor": 4,
                    "satisfaccion": 3,
                    "origen": "Touroperador"
                },
                {
                    "id": 1053,
                    "nombre": "Lunea Suarez",
                    "nacionalidad": "Estonia",
                    "fecha": "08/01/2015",
                    "valor": 6,
                    "satisfaccion": 5,
                    "origen": "integrador"
                },
                {
                    "id": 1054,
                    "nombre": "Claire Jordan",
                    "nacionalidad": "Botswana",
                    "fecha": "05/12/2014",
                    "valor": 9,
                    "satisfaccion": 1,
                    "origen": "web"
                },
                {
                    "id": 1055,
                    "nombre": "Armando Haley",
                    "nacionalidad": "Togo",
                    "fecha": "03/12/2014",
                    "valor": 5,
                    "satisfaccion": 4,
                    "origen": "agencia"
                },
                {
                    "id": 1056,
                    "nombre": "Orson Tanner",
                    "nacionalidad": "Wallis and Futuna",
                    "fecha": "12/01/2015",
                    "valor": 10,
                    "satisfaccion": 4,
                    "origen": "web"
                },
                {
                    "id": 1057,
                    "nombre": "Joel Foley",
                    "nacionalidad": "Cayman Islands",
                    "fecha": "07/01/2015",
                    "valor": 1,
                    "satisfaccion": 2,
                    "origen": "agencia"
                },
                {
                    "id": 1058,
                    "nombre": "Neville French",
                    "nacionalidad": "Spain",
                    "fecha": "21/12/2014",
                    "valor": 8,
                    "satisfaccion": 5,
                    "origen": "web"
                },
                {
                    "id": 1059,
                    "nombre": "Brenda Mann",
                    "nacionalidad": "Heard Island and Mcdonald Islands",
                    "fecha": "31/12/2014",
                    "valor": 1,
                    "satisfaccion": 2,
                    "origen": "integrador"
                },
                {
                    "id": 1060,
                    "nombre": "Jada Aguilar",
                    "nacionalidad": "Equatorial Guinea",
                    "fecha": "07/12/2014",
                    "valor": 4,
                    "satisfaccion": 2,
                    "origen": "agencia"
                },
                {
                    "id": 1061,
                    "nombre": "Alvin Bowman",
                    "nacionalidad": "Senegal",
                    "fecha": "22/12/2014",
                    "valor": 10,
                    "satisfaccion": 2,
                    "origen": "web"
                },
                {
                    "id": 1062,
                    "nombre": "Nehru Townsend",
                    "nacionalidad": "Mauritius",
                    "fecha": "09/12/2014",
                    "valor": 4,
                    "satisfaccion": 5,
                    "origen": "Touroperador"
                },
                {
                    "id": 1063,
                    "nombre": "Grace Wagner",
                    "nacionalidad": "Iceland",
                    "fecha": "30/12/2014",
                    "valor": 10,
                    "satisfaccion": 5,
                    "origen": "integrador"
                },
                {
                    "id": 1064,
                    "nombre": "Cameran Mcconnell",
                    "nacionalidad": "Bosnia and Herzegovina",
                    "fecha": "02/01/2015",
                    "valor": 8,
                    "satisfaccion": 3,
                    "origen": "integrador"
                },
                {
                    "id": 1065,
                    "nombre": "Helen Blake",
                    "nacionalidad": "Dominica",
                    "fecha": "13/12/2014",
                    "valor": 8,
                    "satisfaccion": 1,
                    "origen": "web"
                },
                {
                    "id": 1066,
                    "nombre": "Gail Jordan",
                    "nacionalidad": "Tonga",
                    "fecha": "09/12/2014",
                    "valor": 6,
                    "satisfaccion": 1,
                    "origen": "Touroperador"
                },
                {
                    "id": 1067,
                    "nombre": "Sage Villarreal",
                    "nacionalidad": "Anguilla",
                    "fecha": "30/12/2014",
                    "valor": 6,
                    "satisfaccion": 2,
                    "origen": "web"
                },
                {
                    "id": 1068,
                    "nombre": "Maxwell Hall",
                    "nacionalidad": "Northern Mariana Islands",
                    "fecha": "03/12/2014",
                    "valor": 7,
                    "satisfaccion": 3,
                    "origen": "agencia"
                },
                {
                    "id": 1069,
                    "nombre": "Lawrence Ratliff",
                    "nacionalidad": "Swaziland",
                    "fecha": "03/01/2015",
                    "valor": 1,
                    "satisfaccion": 3,
                    "origen": "Touroperador"
                },
                {
                    "id": 1070,
                    "nombre": "Joel Beck",
                    "nacionalidad": "Tokelau",
                    "fecha": "06/12/2014",
                    "valor": 6,
                    "satisfaccion": 1,
                    "origen": "Touroperador"
                },
                {
                    "id": 1071,
                    "nombre": "Tyler Dixon",
                    "nacionalidad": "Montserrat",
                    "fecha": "16/12/2014",
                    "valor": 1,
                    "satisfaccion": 2,
                    "origen": "web"
                },
                {
                    "id": 1072,
                    "nombre": "Riley Paul",
                    "nacionalidad": "Micronesia",
                    "fecha": "11/01/2015",
                    "valor": 8,
                    "satisfaccion": 3,
                    "origen": "Touroperador"
                },
                {
                    "id": 1073,
                    "nombre": "Boris Potts",
                    "nacionalidad": "Belize",
                    "fecha": "22/12/2014",
                    "valor": 6,
                    "satisfaccion": 4,
                    "origen": "agencia"
                },
                {
                    "id": 1074,
                    "nombre": "Jerome Snyder",
                    "nacionalidad": "Uzbekistan",
                    "fecha": "09/01/2015",
                    "valor": 1,
                    "satisfaccion": 5,
                    "origen": "web"
                },
                {
                    "id": 1075,
                    "nombre": "Cyrus Jenkins",
                    "nacionalidad": "Bermuda",
                    "fecha": "12/12/2014",
                    "valor": 5,
                    "satisfaccion": 5,
                    "origen": "agencia"
                },
                {
                    "id": 1076,
                    "nombre": "Stacy Dunlap",
                    "nacionalidad": "Cook Islands",
                    "fecha": "06/12/2014",
                    "valor": 9,
                    "satisfaccion": 1,
                    "origen": "integrador"
                },
                {
                    "id": 1077,
                    "nombre": "Janna Warren",
                    "nacionalidad": "Jamaica",
                    "fecha": "30/12/2014",
                    "valor": 8,
                    "satisfaccion": 4,
                    "origen": "integrador"
                },
                {
                    "id": 1078,
                    "nombre": "Francesca Kerr",
                    "nacionalidad": "Cape Verde",
                    "fecha": "05/01/2015",
                    "valor": 6,
                    "satisfaccion": 2,
                    "origen": "integrador"
                },
                {
                    "id": 1079,
                    "nombre": "Rogan Prince",
                    "nacionalidad": "Yemen",
                    "fecha": "13/01/2015",
                    "valor": 5,
                    "satisfaccion": 4,
                    "origen": "Touroperador"
                },
                {
                    "id": 1080,
                    "nombre": "Phillip Sellers",
                    "nacionalidad": "Mayotte",
                    "fecha": "30/12/2014",
                    "valor": 10,
                    "satisfaccion": 3,
                    "origen": "agencia"
                },
                {
                    "id": 1081,
                    "nombre": "Brynne Dunlap",
                    "nacionalidad": "Cape Verde",
                    "fecha": "07/01/2015",
                    "valor": 6,
                    "satisfaccion": 1,
                    "origen": "Touroperador"
                },
                {
                    "id": 1082,
                    "nombre": "Bradley Mathis",
                    "nacionalidad": "Slovakia",
                    "fecha": "08/12/2014",
                    "valor": 8,
                    "satisfaccion": 3,
                    "origen": "agencia"
                },
                {
                    "id": 1083,
                    "nombre": "Benedict Michael",
                    "nacionalidad": "Lesotho",
                    "fecha": "04/12/2014",
                    "valor": 6,
                    "satisfaccion": 4,
                    "origen": "web"
                },
                {
                    "id": 1084,
                    "nombre": "Curran Meyers",
                    "nacionalidad": "Saudi Arabia",
                    "fecha": "28/12/2014",
                    "valor": 4,
                    "satisfaccion": 3,
                    "origen": "agencia"
                },
                {
                    "id": 1085,
                    "nombre": "Channing Sanchez",
                    "nacionalidad": "Timor-Leste",
                    "fecha": "19/12/2014",
                    "valor": 3,
                    "satisfaccion": 3,
                    "origen": "web"
                },
                {
                    "id": 1086,
                    "nombre": "Dominique Spence",
                    "nacionalidad": "Nauru",
                    "fecha": "07/12/2014",
                    "valor": 8,
                    "satisfaccion": 5,
                    "origen": "agencia"
                },
                {
                    "id": 1087,
                    "nombre": "Selma Callahan",
                    "nacionalidad": "Faroe Islands",
                    "fecha": "09/01/2015",
                    "valor": 1,
                    "satisfaccion": 3,
                    "origen": "Touroperador"
                },
                {
                    "id": 1088,
                    "nombre": "Denise Hayden",
                    "nacionalidad": "Taiwan",
                    "fecha": "16/12/2014",
                    "valor": 5,
                    "satisfaccion": 4,
                    "origen": "web"
                },
                {
                    "id": 1089,
                    "nombre": "Melvin Carney",
                    "nacionalidad": "Nigeria",
                    "fecha": "11/01/2015",
                    "valor": 8,
                    "satisfaccion": 5,
                    "origen": "Touroperador"
                },
                {
                    "id": 1090,
                    "nombre": "Calvin Roach",
                    "nacionalidad": "Lebanon",
                    "fecha": "29/12/2014",
                    "valor": 7,
                    "satisfaccion": 1,
                    "origen": "Touroperador"
                },
                {
                    "id": 1091,
                    "nombre": "Shoshana Cantrell",
                    "nacionalidad": "Virgin Islands, British",
                    "fecha": "10/01/2015",
                    "valor": 6,
                    "satisfaccion": 5,
                    "origen": "integrador"
                },
                {
                    "id": 1092,
                    "nombre": "Fleur Goodwin",
                    "nacionalidad": "Papua New Guinea",
                    "fecha": "08/01/2015",
                    "valor": 10,
                    "satisfaccion": 1,
                    "origen": "agencia"
                },
                {
                    "id": 1093,
                    "nombre": "Acton Mccarty",
                    "nacionalidad": "Jordan",
                    "fecha": "14/12/2014",
                    "valor": 9,
                    "satisfaccion": 4,
                    "origen": "Touroperador"
                },
                {
                    "id": 1094,
                    "nombre": "Meghan Robles",
                    "nacionalidad": "Burkina Faso",
                    "fecha": "03/01/2015",
                    "valor": 5,
                    "satisfaccion": 1,
                    "origen": "web"
                },
                {
                    "id": 1095,
                    "nombre": "Belle Crane",
                    "nacionalidad": "Qatar",
                    "fecha": "10/12/2014",
                    "valor": 1,
                    "satisfaccion": 4,
                    "origen": "agencia"
                },
                {
                    "id": 1096,
                    "nombre": "Kaden Ferguson",
                    "nacionalidad": "Tanzania",
                    "fecha": "20/12/2014",
                    "valor": 2,
                    "satisfaccion": 3,
                    "origen": "integrador"
                },
                {
                    "id": 1097,
                    "nombre": "Merrill Owens",
                    "nacionalidad": "Jamaica",
                    "fecha": "24/12/2014",
                    "valor": 4,
                    "satisfaccion": 3,
                    "origen": "integrador"
                },
                {
                    "id": 1098,
                    "nombre": "Tanner Obrien",
                    "nacionalidad": "Thailand",
                    "fecha": "11/01/2015",
                    "valor": 2,
                    "satisfaccion": 3,
                    "origen": "integrador"
                },
                {
                    "id": 1099,
                    "nombre": "Shafira Joseph",
                    "nacionalidad": "Christmas Island",
                    "fecha": "15/12/2014",
                    "valor": 1,
                    "satisfaccion": 4,
                    "origen": "integrador"
                }
            ]);
        }

        if (id == "101011")
        {
            done(  [
                {
                    "id": 1013,
                    "nombre": "Raven Odom",
                    "nacionalidad": "Trinidad and Tobago",
                    "fecha": "01/01/2015",
                    "valor": 6,
                    "satisfaccion": 4,
                    "origen": "agencia",
                    "observaciones": "Al cliente le gusta especialmente que haya flores frescas en su habitación el día de su llegada al hotel"
                }
            ]);
        }



        if (id == "XXXXXXa")
        {
            done(  [
                {
                    "fecha": "15/02/2014",
                    "dias": 8,
                    "personas": 8,
                    "habitaciones": 3,
                    "origen": "agencia",
                    "pago": "MASTERCARD"
                },
                {
                    "fecha": "02/01/2016",
                    "dias": 9,
                    "personas": 3,
                    "habitaciones": 2,
                    "origen": "agencia",
                    "pago": "MASTERCARD"
                },
                {
                    "fecha": "06/10/2014",
                    "dias": 8,
                    "personas": 5,
                    "habitaciones": 1,
                    "origen": "touroperador",
                    "pago": "AMEX"
                }
            ]);
        }

        if (id == "XXXXXXb")
        {
            done(  [
                {
                    "id": 100010,
                    "fecha": "23/11/2015",
                    "estado": "pendiente",
                    "Asunto": "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus."
                },
                {
                    "id": 100011,
                    "fecha": "20/03/2014",
                    "estado": "cerrada",
                    "Asunto": "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus. Ut nec"
                }
            ]);
        }

        if (id == "XXXXXXc")
        {
            done(  [
                {
                    "id": 900010,
                    "fecha": "16/10/2015",
                    "importe": "1538€",
                    "abonado": "CASH"
                },
                {
                    "id": 900011,
                    "fecha": "25/07/2015",
                    "importe": "1579€",
                    "abonado": "AMEX"
                },
                {
                    "id": 900012,
                    "fecha": "14/06/2014",
                    "importe": "1979€",
                    "abonado": "MASTERCARD"
                },
                {
                    "id": 900013,
                    "fecha": "03/03/2015",
                    "importe": "1340€",
                    "abonado": "VISA"
                }
            ]);
        }

    }


    this.getReportBlock = function($scope, id, done)
    {

        this.getReport($scope,id, function(report){

            console.log(id);

            if (!report)
            {
                done(1);
                return;
            }


            if (report.reportType == "chart")
                generateChart(id,report,function(errorCode) {
                   done(errorCode);
                });

            if (report.reportType == "grid")
                generateGrid($scope,id,report,function(errorCode) {
                    //generateRepeater($scope,id,report,function(errorCode) {
                    done(errorCode);
                });
            if (report.reportType == "pivot")
                generatePivot($scope,id,report,function(errorCode) {
                    done(errorCode);
                });
            if (report.reportType == "indicator")
                generateIndicator($scope,id,report,function(errorCode) {
                    done(errorCode);
                });
            if (report.reportType == "vectorMap")
                generateVectorMap($scope,id,report,function(errorCode) {
                    done(errorCode);
                });
            if (report.reportType == "readOnlyForm")
                generateReadOnlyForm($scope,id,report,function(errorCode) {
                    done(errorCode);
                });

        });

    }
    /*
    this.getChart = function($scope,id,done)
    {
        this.getReport($scope,id, function(report){

            if (!report)
            {
                done(1);
                return;
            }


            if (report.reportType == "chart")
                generateChartHTML(id,report,function(errorCode) {
                    done(errorCode);
                });

        });

    }
    */
    function generateChart(id,report,done) {
        var found = false;

        if (report.reportSubType == 'line')
        {
            var theData = [
                {day:'1/1/2014',visitorsCount: 10},
                {day:'2/1/2014',visitorsCount: 5},
                {day:'3/1/2014',visitorsCount: 34},
                {day:'4/1/2014',visitorsCount: 23},
                {day:'5/1/2014',visitorsCount: 13},
                {day:'6/1/2014',visitorsCount: 3},
                {day:'7/1/2014',visitorsCount: 2},
                {day:'8/1/2014',visitorsCount: 15},
                {day:'9/1/2014',visitorsCount: 22},
                {day:'10/1/2014',visitorsCount: 33},
                {day:'11/1/2014',visitorsCount: 10},
                {day:'12/1/2014',visitorsCount: 5}
            ]


            if (report.properties[0].colors)
                var theColors = report.properties[0].colors;

            new Morris.Line({
                element: id,
                data: theData,
                xkey: report.properties[0].xkey,
                ykeys: report.properties[0].ykeys,
                labels: report.properties[0].labels,
                xlabels: report.properties[0].xlabels,
                lineColors: theColors,
                hideHover: true,
                resize: true,
                parseTime: false,
                dateFormat: function (x) { return ''; }
            }).on('click', function(i, row){
                    console.log(i, row);
                });


            done(0);
            return;


        }

        if (report.reportSubType == 'donut')
        {

            getTheData(id, function(theData){

                if (theData)
                {
                    if (report.properties[0].colors)
                        var theColors = report.properties[0].colors;

                    Morris.Donut({
                        element: id,
                        data: theData,
                        resize: true,
                        colors: theColors
                    }).on('click', function(i, row){
                            console.log(i, row);
                        });

                    done(0);
                    return;
                }
            });



        }

        if (report.reportSubType == 'bar')
        {

            var theData = [
                { y: '2006', a: 100, b: 90 },
                { y: '2007', a: 75,  b: 65 },
                { y: '2008', a: 50,  b: 40 },
                { y: '2009', a: 75,  b: 65 },
                { y: '2010', a: 50,  b: 40 },
                { y: '2011', a: 75,  b: 65 },
                { y: '2012', a: 100, b: 90 }
            ];

            if (report.properties[0].colors)
                var theColors = report.properties[0].colors;

            Morris.Bar({
                element: id,
                data: theData,
                xkey: report.properties[0].xkey,
                ykeys: report.properties[0].ykeys,
                labels: report.properties[0].labels,
                resize: true,
                barColors: theColors
            }).on('click', function(i, row){
                    console.log(i, row);
                });

            done(0);
            return;
        }

        if (report.reportSubType == 'area')
        {

            var theData = [
                    { y: '2006', a: 100, b: 90 },
                    { y: '2007', a: 75,  b: 65 },
                    { y: '2008', a: 50,  b: 40 },
                    { y: '2009', a: 75,  b: 65 },
                    { y: '2010', a: 50,  b: 40 },
                    { y: '2011', a: 75,  b: 65 },
                    { y: '2012', a: 100, b: 90 }
                ];



            if (report.properties[0].colors)
                theColors = report.properties[0].colors;

            Morris.Area({
                element: id,
                data: theData,
                xkey: report.properties[0].xkey,
                ykeys: report.properties[0].ykeys,
                labels: report.properties[0].labels,
                resize: true,
                lineColors: theColors
            }).on('click', function(i, row){
                    console.log(i, row);
                });

            done(0);
            return;

        }

        done(2); //error chart type not found

        /*
        var params = {};

        params.websiteID = $stateParams.websiteID;

        $q.all([
                adminModel.getVisitorsLast30(params)
            ]).then(function(data) {
                var theData =[];

                for (var i in data[0])
                {
                    console.log(JSON.stringify(data[0][i]));
                    theData.push({day:data[0][i]._id.day+'/'+data[0][i]._id.month+'/'+data[0][i]._id.year,visitorsCount: data[0][i].visitorsCount})
                }

                console.log(JSON.stringify(data));

                $scope.sentin_chart[id].data = theData;

                done(<linechart params="sentin_chart" ></linechart>);
            });
        */

    }

    function generateGrid($scope,id,report,done) {

        var htmlCode = '';
        var quote = "'";

        getTheData(id, function(theData){

            if (theData)
            {

                if (!$scope.theData)
                    $scope.theData = [];

                //console.log('los datos del grid '+id+' ----->   '+theData);

                var hashedID = hashCode(id);

                $scope.theData[hashedID] = theData;

                ////NG TABLE PARAMS
                if (!$scope.tableParams)
                    $scope.tableParams = [];

                $scope.tableParams[hashedID] = new ngTableParams({
                    page: 1,            // show first page
                    count: 1000           // count per page
                }, {
                    counts: [], // hide page counts control
                    total: theData.length,  // length of data

                    getData: function($defer, params) {
                        // use build-in angular filter
                        var orderedData = params.sorting ?
                            $filter('orderBy')(theData, params.orderBy()) :
                            theData;
                        orderedData = params.filter ?
                            $filter('filter')(orderedData, params.filter()) :
                            orderedData;

                        //$scope.users = orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count());

                        params.total(orderedData.length); // set total for recalc pagination
                        //$defer.resolve($scope.users);
                    }
                });

                /////END NGTABLE PARAMS


                //actions:[{actionEvent:"onRowClick",actionType:"goToDashBoard",targetID:"clientDashboard",targetFilters:['customerID'];

                var rowClickEvent = '';

                for(var i = 0; i < report.properties[0].actions.length; i++)
                {
                    if (report.properties[0].actions[i].actionEvent == 'onRowClick')
                        rowClickEvent = ' ng-click="onReportAction('+quote+report.properties[0].actions[i].actionType+quote+','+quote+report.properties[0].actions[i].targetID+quote+','+quote+report.properties[0].actions[i].targetFilters+quote+','+quote+'{{item.'+report.properties[0].idField+'}}'+quote+')"'
                    //rowClickEvent = ' ng-click="onReportAction('+report.properties[0].actions[i].actionType+','+report.properties[0].actions[i].targetID+','+report.properties[0].actions[i].targetFilters+')"'

                }

                console.log('the row click event '+rowClickEvent);


                //htmlCode += '<table border="1px"><thead></thead>';

                htmlCode += '<table ng-table="tableParams['+hashedID+']" show-filter="false" class="table">';

                //htmlCode += '<table class="table">';
                /*
                for(var i = 0; i < report.properties[0].fields.length; i++)
                {
                    htmlCode += '<td>'+report.properties[0].fields[i].fieldAlias+'</td>';
                }

                htmlCode += '</thead><tbody>';
                */

                //ng-click="item.$selected = !item.$selected; changeSelection(item)"


                htmlCode += '<tr ng-repeat="item in theData['+hashedID+']"   ng-class="{'+quote+'active'+quote+': item.$selected}" > ';

                    for(var i = 0; i < report.properties[0].fields.length; i++)
                        {
                            htmlCode += '<td data-title="'+quote+report.properties[0].fields[i].fieldAlias+quote+'" filter="{ '+quote+report.properties[0].fields[i].fieldName+quote+': '+quote+'select'+quote+' }" sortable="'+quote+report.properties[0].fields[i].fieldName+quote+'" ng-class="{ '+quote+'emphasis'+quote+': item.nombrecampo2 > 500}" '+rowClickEvent+'>{{item.'+report.properties[0].fields[i].fieldName+'}}</td>';
                        }

                htmlCode += '</tr></table>';


                //console.log(htmlCode);

                        var el = document.getElementById(id);
                        if (el)
                        {
                            var $div = $(htmlCode);
                            angular.element(el).append($div);
                            angular.element(document).injector().invoke(function($compile) {
                                var scope = angular.element($div).scope();
                                $compile($div)(scope);
                            });
                        }
                done(0);
                return;
            }
        });
    }





    function generateRepeater($scope,id,report,done)
    {


        //https://github.com/kamilkp/angular-vs-repeat

        var quote = "'";
        getTheData(id, function(theData){

            if (theData)
            {

                if (!$scope.theData)
                    $scope.theData = [];

                //console.log('los datos del grid '+id+' ----->   '+theData);

                var hashedID = hashCode(id);
                //$scope.theData[quote+id+quote] = theData;
                $scope.theData[hashedID] = theData;
                var htmlCode = '';

                htmlCode += '<div vs-repeat>';
                    htmlCode += '<div ng-repeat="item in theData['+hashedID+']" style="position: absolute;z-index: 1;">';

                        for(var i = 0; i < report.properties[0].fields.length; i++)
                        {
                            htmlCode += '<span>{{item.'+report.properties[0].fields[i].fieldName+'}}</span> ';
                        }

                    htmlCode += '</div>';
                htmlCode += '</div>';

                var el = document.getElementById(id);
                if (el)
                {
                    var $div = $(htmlCode);
                    angular.element(el).append($div);
                    angular.element(document).injector().invoke(function($compile) {
                        var scope = angular.element($div).scope();
                        $compile($div)(scope);
                    });
                }
                done(0);
                return;
            }
        });

    }


    function generatePivot($scope,id,report,done)
    {
        var htmlCode = '';

        var theData = [
            {
                employee : {id:1, label:'John Brown'},
                department : 1,
                year : 2013,
                month : 1,
                day : 10,
                amount : 34
            },
            {
                employee : {id:2, label:'Bill Green'},
                department : 1,
                year : 2013,
                month : 1,
                day : 10,
                amount : 34
            },
            {
                employee : {id:3, label:'Daniel White'},
                department : 2,
                year : 2013,
                month : 1,
                day : 10,
                amount : 48
            },
            {
                employee : {id:4, label:'Bryan Gold'},
                department : 2,
                year : 2013,
                month : 1,
                day : 10,
                amount : 58
            },
            {
                employee : {id:5, label:'Suzy Fowler'},
                department : 3,
                year : 2013,
                month : 1,
                day : 10,
                amount : 12
            },
            {
                employee : {id:6, label:'Julia Smith'},
                department : 3,
                year : 2013,
                month : 1,
                day : 10,
                amount : 19
            },

            // Feb

            {
                employee : {id:1, label:'John Brown'},
                department : 1,
                year : 2013,
                month : 2,
                day : 14,
                amount : 24
            },
            {
                employee : {id:2, label:'Bill Green'},
                department : 1,
                year : 2013,
                month : 2,
                day : 4,
                amount : 16
            },
            {
                employee : {id:3, label:'Daniel White'},
                department : 2,
                year : 2013,
                month : 2,
                day : 19,
                amount : 30
            },
            {
                employee : {id:4, label:'Bryan Gold'},
                department : 2,
                year : 2013,
                month : 2,
                day : 20,
                amount : 98
            },
            {
                employee : {id:5, label:'Suzy Fowler'},
                department : 3,
                year : 2013,
                month : 2,
                day : 19,
                amount : 24
            },
            {
                employee : {id:6, label:'Julia Smith'},
                department : 3,
                year : 2013,
                month : 2,
                day : 10,
                amount : 14
            },

            // Mar
            {
                employee : {id:1, label:'John Brown'},
                department : 1,
                year : 2013,
                month : 3,
                day : 14,
                amount : 21
            },
            {
                employee : {id:2, label:'Bill Green'},
                department : 1,
                year : 2013,
                month : 3,
                day : 4,
                amount : 26
            },
            {
                employee : {id:3, label:'Daniel White'},
                department : 2,
                year : 2013,
                month : 3,
                day : 19,
                amount : 39
            },
            {
                employee : {id:4, label:'Bryan Gold'},
                department : 2,
                year : 2013,
                month : 3,
                day : 20,
                amount : 49
            },
            {
                employee : {id:5, label:'Suzy Fowler'},
                department : 3,
                year : 2013,
                month : 3,
                day : 19,
                amount : 22
            },
            {
                employee : {id:6, label:'Julia Smith'},
                department : 3,
                year : 2013,
                month : 3,
                day : 10,
                amount : 24
            },

            // Apr
            {
                employee : {id:1, label:'John Brown'},
                department : 1,
                year : 2013,
                month : 4,
                day : 14,
                amount : 10
            },
            {
                employee : {id:2, label:'Bill Green'},
                department : 1,
                year : 2013,
                month : 4,
                day : 4,
                amount : 29
            },
            {
                employee : {id:3, label:'Daniel White'},
                department : 2,
                year : 2013,
                month : 4,
                day : 19,
                amount : 27
            },
            {
                employee : {id:4, label:'Bryan Gold'},
                department : 2,
                year : 2013,
                month : 4,
                day : 20,
                amount : 29
            },
            {
                employee : {id:5, label:'Suzy Fowler'},
                department : 3,
                year : 2013,
                month : 4,
                day : 19,
                amount : 32
            },
            {
                employee : {id:6, label:'Julia Smith'},
                department : 3,
                year : 2013,
                month : 4,
                day : 10,
                amount : 34
            },


            // May
            {
                employee : {id:1, label:'John Brown'},
                department : 1,
                year : 2013,
                month : 5,
                day : 14,
                amount : 40
            },
            {
                employee : {id:2, label:'Bill Green'},
                department : 1,
                year : 2013,
                month : 5,
                day : 4,
                amount : 19
            },
            {
                employee : {id:3, label:'Daniel White'},
                department : 2,
                year : 2013,
                month : 5,
                day : 19,
                amount : 37
            },
            {
                employee : {id:4, label:'Bryan Gold'},
                department : 2,
                year : 2013,
                month : 5,
                day : 20,
                amount : 22
            },
            {
                employee : {id:5, label:'Suzy Fowler'},
                department : 3,
                year : 2013,
                month : 5,
                day : 19,
                amount : 36
            },
            {
                employee : {id:6, label:'Julia Smith'},
                department : 3,
                year : 2013,
                month : 5,
                day : 10,
                amount : 39
            },

            // Jun
            {
                employee : {id:1, label:'John Brown'},
                department : 1,
                year : 2013,
                month : 6,
                day : 14,
                amount : 40
            },
            {
                employee : {id:2, label:'Bill Green'},
                department : 1,
                year : 2013,
                month : 6,
                day : 4,
                amount : 15
            },
            {
                employee : {id:3, label:'Daniel White'},
                department : 2,
                year : 2013,
                month : 6,
                day : 19,
                amount : 15
            },
            {
                employee : {id:4, label:'Bryan Gold'},
                department : 2,
                year : 2013,
                month : 6,
                day : 20,
                amount : 23
            },
            {
                employee : {id:5, label:'Suzy Fowler'},
                department : 3,
                year : 2013,
                month : 6,
                day : 19,
                amount : 29
            },
            {
                employee : {id:6, label:'Julia Smith'},
                department : 3,
                year : 2013,
                month : 6,
                day : 10,
                amount : 31
            },

            // Jul
            {
                employee : {id:1, label:'John Brown'},
                department : 1,
                year : 2013,
                month : 7,
                day : 14,
                amount : 38
            },
            {
                employee : {id:2, label:'Bill Green'},
                department : 1,
                year : 2013,
                month : 7,
                day : 4,
                amount : 26
            },
            {
                employee : {id:3, label:'Daniel White'},
                department : 2,
                year : 2013,
                month : 7,
                day : 19,
                amount : 13
            },
            {
                employee : {id:4, label:'Bryan Gold'},
                department : 2,
                year : 2013,
                month : 7,
                day : 20,
                amount : 21
            },
            {
                employee : {id:5, label:'Suzy Fowler'},
                department : 3,
                year : 2013,
                month : 7,
                day : 19,
                amount : 45
            },
            {
                employee : {id:6, label:'Julia Smith'},
                department : 3,
                year : 2013,
                month : 7,
                day : 10,
                amount : 20
            },

            // Aug
            {
                employee : {id:1, label:'John Brown'},
                department : 1,
                year : 2013,
                month : 8,
                day : 14,
                amount : 30
            },
            {
                employee : {id:2, label:'Bill Green'},
                department : 1,
                year : 2013,
                month : 8,
                day : 4,
                amount : 21
            },
            {
                employee : {id:3, label:'Daniel White'},
                department : 2,
                year : 2013,
                month : 8,
                day : 19,
                amount : 38
            },
            {
                employee : {id:4, label:'Bryan Gold'},
                department : 2,
                year : 2013,
                month : 8,
                day : 20,
                amount : 14
            },
            {
                employee : {id:5, label:'Suzy Fowler'},
                department : 3,
                year : 2013,
                month : 8,
                day : 19,
                amount : 25
            },
            {
                employee : {id:6, label:'Julia Smith'},
                department : 3,
                year : 2013,
                month : 8,
                day : 10,
                amount : 31
            },

            // Sep
            {
                employee : {id:1, label:'John Brown'},
                department : 1,
                year : 2013,
                month : 9,
                day : 14,
                amount : 24
            },
            {
                employee : {id:2, label:'Bill Green'},
                department : 1,
                year : 2013,
                month : 9,
                day : 4,
                amount : 18
            },
            {
                employee : {id:3, label:'Daniel White'},
                department : 2,
                year : 2013,
                month : 9,
                day : 19,
                amount : 10
            },
            {
                employee : {id:4, label:'Bryan Gold'},
                department : 2,
                year : 2013,
                month : 9,
                day : 20,
                amount : 24
            },
            {
                employee : {id:5, label:'Suzy Fowler'},
                department : 3,
                year : 2013,
                month : 9,
                day : 19,
                amount : 450000000.12345678
            },
            {
                employee : {id:6, label:'Julia Smith'},
                department : 3,
                year : 2013,
                month : 9,
                day : 10,
                amount : 21
            },

            // Oct
            {
                employee : {id:1, label:'John Brown'},
                department : 1,
                year : 2013,
                month : 10,
                day : 14,
                amount : 26
            },
            {
                employee : {id:2, label:'Bill Green'},
                department : 1,
                year : 2013,
                month : 10,
                day : 4,
                amount : 46
            },
            {
                employee : {id:3, label:'Daniel White'},
                department : 2,
                year : 2013,
                month : 10,
                day : 19,
                amount : 48
            },
            {
                employee : {id:4, label:'Bryan Gold'},
                department : 2,
                year : 2013,
                month : 10,
                day : 20,
                amount : 17
            },
            {
                employee : {id:5, label:'Suzy Fowler'},
                department : 3,
                year : 2013,
                month : 10,
                day : 19,
                amount : 20
            },
            {
                employee : {id:6, label:'Julia Smith'},
                department : 3,
                year : 2013,
                month : 10,
                day : 10,
                amount : 3
            },

            // Nov
            {
                employee : {id:1, label:'John Brown'},
                department : 1,
                year : 2013,
                month : 11,
                day : 14,
                amount : 10
            },
            {
                employee : {id:2, label:'Bill Green'},
                department : 1,
                year : 2013,
                month : 11,
                day : 4,
                amount : 39
            },
            {
                employee : {id:3, label:'Daniel White'},
                department : 2,
                year : 2013,
                month : 11,
                day : 19,
                amount : 16
            },
            {
                employee : {id:4, label:'Bryan Gold'},
                department : 2,
                year : 2013,
                month : 11,
                day : 20,
                amount : 22
            },
            {
                employee : {id:5, label:'Suzy Fowler'},
                department : 3,
                year : 2013,
                month : 11,
                day : 19,
                amount : 26
            },
            {
                employee : {id:6, label:'Julia Smith'},
                department : 3,
                year : 2013,
                month : 11,
                day : 10,
                amount : 26
            },

            // Dec
            {
                employee : {id:1, label:'John Brown'},
                department : 1,
                year : 2013,
                month : 12,
                day : 14,
                amount : 12
            },
            {
                employee : {id:2, label:'Bill Green'},
                department : 1,
                year : 2013,
                month : 12,
                day : 4,
                amount : 15
            },
            {
                employee : {id:3, label:'Daniel White'},
                department : 2,
                year : 2013,
                month : 12,
                day : 19,
                amount : 18
            },
            {
                employee : {id:4, label:'Bryan Gold'},
                department : 2,
                year : 2013,
                month : 12,
                day : 20,
                amount : 13
            },
            {
                employee : {id:5, label:'Suzy Fowler'},
                department : 3,
                year : 2013,
                month : 12,
                day : 19,
                amount : 29
            },
            {
                employee : {id:6, label:'Julia Smith'},
                department : 3,
                year : 2013,
                month : 12,
                day : 10,
                amount : 12
            },

        ];



        $.each(theData, function(idx, value){
            value.total = 1;
        });

        if (!$scope.thaData)
            $scope.theData = [];

        $scope.theData[id] = theData;

        var dimensions = {
            employee : {
                label :'Employee'
            },
            department : {
                label :'Department',
                values : function(context) {
                    return [
                        {id:1, label:'Administration general'},
                        {id:2, label:'Logistics'},
                        {id:3, label:'Accounting'}
                    ];
                }
            },
            year : {
                label :'Year'
            },
            month : {
                label :'Month',
                values : function(context) {
                    return [
                        {id:1, label:'Jan'},
                        {id:2, label:'Feb'},
                        {id:3, label:'Mar'},
                        {id:4, label:'Apr'},
                        {id:5, label:'May'},
                        {id:6, label:'Jun'},
                        {id:7, label:'Jul'},
                        {id:8, label:'Aug'},
                        {id:9, label:'Sep'},
                        {id:10, label:'Oct'},
                        {id:11, label:'Nov'},
                        {id:12, label:'Dec'},
                    ];
                }
            },
            total : {
                label :'Total',
                values : function(context) {
                    return [
                        {id:1, label:'Total'}
                    ];
                }
            }
        };


        //var el = document.getElementById(id);
        //if (el)
        //{
        $(document).ready(function(){
            $("#66666").cypivot({
            data : $scope.theData[id],
            dimensions : dimensions,
            verticalDimensions : ["total", "year", "month"],
            horizontalDimensions : ["department", "employee"],
            valueDataFields : ['amount'],
            configuration : false,
            resizable : true,
            resizableWidth : true,
            resizableHeight : false
            });
        });
        //}

        done(0);
        return;
    }

    function generateIndicator($scope, id, report,  done)
    {
        var htmlCode = '';

        getTheData(id, function(theData){

            if (theData)
            {

         console.log('el valor ' + theData[0].value);
                var theValue = theData[0].value;

                if (report.properties[0].valueType == 'percentage')
                {
                    theValue = theData[0].value + ' %';
                }

                if (report.properties[0].valueType == 'currency' && report.properties[0].currencySymbol)
                {
                    theValue = theData[0].value + ' '+report.properties[0].currencySymbol;
                }


                var theEvolution = theData[0].evolution + ' %';

                var trend = 'same';
                var trendLabel = 'igual'; //TODO:traduccion

                if (theData[0].evolution > 0)
                    {
                      trend = 'up';
                      trendLabel = 'incremento'; //TODO:traduccion
                    }
                if (theData[0].evolution < 0)
                    {
                    trend = 'down';
                    trendLabel = 'menos'; //TODO:traduccion
                    }

                //TODO: otros valores currency tienen que tomar la moneda para ponerle el simbolo, mirar formateo por defecto del navegador

                var theBackgroundColor = '#68b828';
                if (report.properties[0].backgroundColor)
                    theBackgroundColor = report.properties[0].backgroundColor;
                var theFontColor = '#fff';
                if (report.properties[0].fontColor)
                    theFontColor = report.properties[0].fontColor;

                var theAuxFontColor = '#fff'
                if (report.properties[0].auxFontColor)
                    theAuxFontColor = report.properties[0].auxFontColor;

                if (report.reportSubType == 'style1')
                {
                    htmlCode += '<div class="xe-widget xe-counter xe-counter-info" data-count=".num" data-from="1000" data-to="2470" data-duration="4" data-easing="true">';
                    htmlCode += '   <div class="xe-icon">';
                    htmlCode += '       <i class="'+report.properties[0].valueIcon+'"></i>';
                    htmlCode += '   </div>';
                    htmlCode += '   <div class="xe-label">';
                    htmlCode += '       <strong class="num">'+theValue+'</strong>';
                    htmlCode += '       <span>'+report.properties[0].valueText+'</span>';
                    htmlCode += '   </div>';
                    htmlCode += '</div>';

                    //TODO: Animation over data-from data-to
                }

                if (report.reportSubType == 'style2')
                {
                    htmlCode += '<div class="xe-widget xe-counter-block" xe-counter="" data-count=".num" data-from="0" data-to="99.9" data-suffix="%" data-duration="2" style="background-color: '+theBackgroundColor+'">';
                    htmlCode += '   <div class="xe-upper"  style="background-color: '+theBackgroundColor+'">';
                    htmlCode += '       <div class="xe-icon">';
                    htmlCode += '           <i class="'+report.properties[0].valueIcon+'"></i> ';
                    htmlCode += '       </div>';
                    htmlCode += '       <div class="xe-label">';
                    htmlCode += '           <strong class="num">'+theValue+'</strong>';
                    htmlCode += '           <span>'+report.properties[0].valueText+'</span> ';
                    htmlCode += '       </div> ';
                    htmlCode += '   </div>';
                    htmlCode += '   <div class="xe-lower"> ';
                    htmlCode += '       <div class="border"></div> ';
                    htmlCode += '           <span>Resultado</span> ';
                    htmlCode += '           <strong>'+theEvolution+'  '+trendLabel+'</strong> ';
                    htmlCode += '       </div> ';
                    htmlCode += '   </div> ';
                    htmlCode += '</div> ';
                }

                if (report.reportSubType == 'style3')
                {
                    htmlCode += '<div class="chart-item-bg-2" style="background-color: '+theBackgroundColor+';color:'+theFontColor+'">';
                    htmlCode += '   <div class="chart-item-num" xe-counter="" data-count="this" data-from="0" data-to="98" data-suffix="%" data-duration="2" style="color:'+theFontColor+'">'+theValue+'</div>';
                    htmlCode += '       <div class="chart-item-desc" > ';
                    //htmlCode += '           <p class="col-lg-7">Carriage quitting securing be appetite it declared. High eyes kept so busy feel call in.</p> ';
                    htmlCode += '           <p style="color:'+theAuxFontColor+'">'+report.properties[0].valueText+'</p> ';
                    htmlCode += '       </div> ';
                   /*
                    htmlCode += '       <div class="chart-item-env"> ';
                    htmlCode += '           <div id="doughnut-1" style="width: 200px; -webkit-user-select: none;" class="dx-visibility-change-handler"></div>';
                    htmlCode += '       </div>';
                   */
                    htmlCode += '   </div>';
                    htmlCode += '</div>';
                }


                var el = document.getElementById(id);
                if (el)
                {
                    var $div = $(htmlCode);
                    angular.element(el).append($div);
                    angular.element(document).injector().invoke(function($compile) {
                        var scope = angular.element($div).scope();
                        $compile($div)(scope);
                    });
                }
                done(0);
                return;

            }

        });



        //Style 1
        /*
        <div class="xe-widget xe-counter xe-counter-info" data-count=".num" data-from="1000" data-to="2470" data-duration="4" data-easing="true">
            <div class="xe-icon">
                <i class="linecons-camera"></i>
            </div>
            <div class="xe-label">
                <strong class="num">2,470</strong>
                <span>New Daily Photos</span>
            </div>
        </div>
        */

        //Style 2
        /*
        <div class="xe-widget xe-counter-block" xe-counter="" data-count=".num" data-from="0" data-to="99.9" data-suffix="%" data-duration="2">
            <div class="xe-upper">

                <div class="xe-icon">
                    <i class="linecons-cloud"></i>
                </div>
                <div class="xe-label">
                    <strong class="num">99.9%</strong>
                    <span>Server uptime</span>
                </div>

            </div>
            <div class="xe-lower">
                <div class="border"></div>

                <span>Result</span>
                <strong>78% Increase</strong>
            </div>
        </div>
        */

        //Style 3
        /*
        <div class="chart-item-bg-2">
            <div class="chart-item-num" xe-counter="" data-count="this" data-from="0" data-to="98" data-suffix="%" data-duration="2">98%</div>
            <div class="chart-item-desc">
                <p class="col-lg-7">Carriage quitting securing be appetite it declared. High eyes kept so busy feel call in.</p>
            </div>
            <div class="chart-item-env">
                <div id="doughnut-1" style="width: 200px; -webkit-user-select: none;" class="dx-visibility-change-handler"><svg width="200" height="130" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" stroke="none" stroke-width="0" fill="none" class="dxc dxc-chart" direction="ltr" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0); display: block; overflow: hidden;"><defs><clipPath id="DevExpress_93"><rect x="0" y="0" width="200" height="130" rx="0" ry="0" fill="none" stroke="none" stroke-width="0"></rect></clipPath><pattern id="DevExpress_94" width="10" height="10" patternUnits="userSpaceOnUse"><rect x="0" y="0" width="10" height="10" rx="0" ry="0" fill="#68b828" opacity="0.75"></rect><path stroke-width="4" stroke="#68b828" d="M 5 -5 L -5 5M 0 10 L 10 0 M 15 5 L 5 15"></path></pattern><pattern id="DevExpress_95" width="10" height="10" patternUnits="userSpaceOnUse"><rect x="0" y="0" width="10" height="10" rx="0" ry="0" fill="#68b828" opacity="0.5"></rect><path stroke-width="4" stroke="#68b828" d="M 5 -5 L -5 5M 0 10 L 10 0 M 15 5 L 5 15"></path></pattern><pattern id="DevExpress_96" width="10" height="10" patternUnits="userSpaceOnUse"><rect x="0" y="0" width="10" height="10" rx="0" ry="0" fill="#7c38bc" opacity="0.75"></rect><path stroke-width="4" stroke="#7c38bc" d="M 5 -5 L -5 5M 0 10 L 10 0 M 15 5 L 5 15"></path></pattern><pattern id="DevExpress_97" width="10" height="10" patternUnits="userSpaceOnUse"><rect x="0" y="0" width="10" height="10" rx="0" ry="0" fill="#7c38bc" opacity="0.5"></rect><path stroke-width="4" stroke="#7c38bc" d="M 5 -5 L -5 5M 0 10 L 10 0 M 15 5 L 5 15"></path></pattern><pattern id="DevExpress_98" width="10" height="10" patternUnits="userSpaceOnUse"><rect x="0" y="0" width="10" height="10" rx="0" ry="0" fill="#0e62c7" opacity="0.75"></rect><path stroke-width="4" stroke="#0e62c7" d="M 5 -5 L -5 5M 0 10 L 10 0 M 15 5 L 5 15"></path></pattern><pattern id="DevExpress_99" width="10" height="10" patternUnits="userSpaceOnUse"><rect x="0" y="0" width="10" height="10" rx="0" ry="0" fill="#0e62c7" opacity="0.5"></rect><path stroke-width="4" stroke="#0e62c7" d="M 5 -5 L -5 5M 0 10 L 10 0 M 15 5 L 5 15"></path></pattern><pattern id="DevExpress_100" width="10" height="10" patternUnits="userSpaceOnUse"><rect x="0" y="0" width="10" height="10" rx="0" ry="0" fill="#fcd036" opacity="0.75"></rect><path stroke-width="4" stroke="#fcd036" d="M 5 -5 L -5 5M 0 10 L 10 0 M 15 5 L 5 15"></path></pattern><pattern id="DevExpress_101" width="10" height="10" patternUnits="userSpaceOnUse"><rect x="0" y="0" width="10" height="10" rx="0" ry="0" fill="#fcd036" opacity="0.5"></rect><path stroke-width="4" stroke="#fcd036" d="M 5 -5 L -5 5M 0 10 L 10 0 M 15 5 L 5 15"></path></pattern><pattern id="DevExpress_102" width="10" height="10" patternUnits="userSpaceOnUse"><rect x="0" y="0" width="10" height="10" rx="0" ry="0" fill="#4fcdfc" opacity="0.75"></rect><path stroke-width="4" stroke="#4fcdfc" d="M 5 -5 L -5 5M 0 10 L 10 0 M 15 5 L 5 15"></path></pattern><pattern id="DevExpress_103" width="10" height="10" patternUnits="userSpaceOnUse"><rect x="0" y="0" width="10" height="10" rx="0" ry="0" fill="#4fcdfc" opacity="0.5"></rect><path stroke-width="4" stroke="#4fcdfc" d="M 5 -5 L -5 5M 0 10 L 10 0 M 15 5 L 5 15"></path></pattern><pattern id="DevExpress_104" width="10" height="10" patternUnits="userSpaceOnUse"><rect x="0" y="0" width="10" height="10" rx="0" ry="0" fill="#00b19d" opacity="0.75"></rect><path stroke-width="4" stroke="#00b19d" d="M 5 -5 L -5 5M 0 10 L 10 0 M 15 5 L 5 15"></path></pattern><pattern id="DevExpress_105" width="10" height="10" patternUnits="userSpaceOnUse"><rect x="0" y="0" width="10" height="10" rx="0" ry="0" fill="#00b19d" opacity="0.5"></rect><path stroke-width="4" stroke="#00b19d" d="M 5 -5 L -5 5M 0 10 L 10 0 M 15 5 L 5 15"></path></pattern><pattern id="DevExpress_106" width="10" height="10" patternUnits="userSpaceOnUse"><rect x="0" y="0" width="10" height="10" rx="0" ry="0" fill="#ff6264" opacity="0.75"></rect><path stroke-width="4" stroke="#ff6264" d="M 5 -5 L -5 5M 0 10 L 10 0 M 15 5 L 5 15"></path></pattern><pattern id="DevExpress_107" width="10" height="10" patternUnits="userSpaceOnUse"><rect x="0" y="0" width="10" height="10" rx="0" ry="0" fill="#ff6264" opacity="0.5"></rect><path stroke-width="4" stroke="#ff6264" d="M 5 -5 L -5 5M 0 10 L 10 0 M 15 5 L 5 15"></path></pattern><pattern id="DevExpress_108" width="10" height="10" patternUnits="userSpaceOnUse"><rect x="0" y="0" width="10" height="10" rx="0" ry="0" fill="#f7aa47" opacity="0.75"></rect><path stroke-width="4" stroke="#f7aa47" d="M 5 -5 L -5 5M 0 10 L 10 0 M 15 5 L 5 15"></path></pattern><pattern id="DevExpress_109" width="10" height="10" patternUnits="userSpaceOnUse"><rect x="0" y="0" width="10" height="10" rx="0" ry="0" fill="#f7aa47" opacity="0.5"></rect><path stroke-width="4" stroke="#f7aa47" d="M 5 -5 L -5 5M 0 10 L 10 0 M 15 5 L 5 15"></path></pattern><pattern id="DevExpress_110" width="10" height="10" patternUnits="userSpaceOnUse"><rect x="0" y="0" width="10" height="10" rx="0" ry="0" fill="#9aea5a" opacity="0.75"></rect><path stroke-width="4" stroke="#9aea5a" d="M 5 -5 L -5 5M 0 10 L 10 0 M 15 5 L 5 15"></path></pattern><pattern id="DevExpress_111" width="10" height="10" patternUnits="userSpaceOnUse"><rect x="0" y="0" width="10" height="10" rx="0" ry="0" fill="#9aea5a" opacity="0.5"></rect><path stroke-width="4" stroke="#9aea5a" d="M 5 -5 L -5 5M 0 10 L 10 0 M 15 5 L 5 15"></path></pattern><pattern id="DevExpress_112" width="10" height="10" patternUnits="userSpaceOnUse"><rect x="0" y="0" width="10" height="10" rx="0" ry="0" fill="#ae6aee" opacity="0.75"></rect><path stroke-width="4" stroke="#ae6aee" d="M 5 -5 L -5 5M 0 10 L 10 0 M 15 5 L 5 15"></path></pattern><pattern id="DevExpress_113" width="10" height="10" patternUnits="userSpaceOnUse"><rect x="0" y="0" width="10" height="10" rx="0" ry="0" fill="#ae6aee" opacity="0.5"></rect><path stroke-width="4" stroke="#ae6aee" d="M 5 -5 L -5 5M 0 10 L 10 0 M 15 5 L 5 15"></path></pattern><filter id="DevExpress_114" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur in="SourceGraphic" result="gaussianBlurResult" stdDeviation="2"></feGaussianBlur><feOffset in="gaussianBlurResult" result="offsetResult" dx="0" dy="4"></feOffset><feFlood result="floodResult" flood-color="#000000" flood-opacity="0.4"></feFlood><feComposite in="floodResult" in2="offsetResult" operator="in" result="compositeResult"></feComposite><feComposite in="SourceGraphic" in2="compositeResult" operator="over"></feComposite></filter></defs><g class="dxc-legend" clip-path="url(#DevExpress_93)"></g><g class="dxc-series-group"><g class="dxc-series"><g class="dxc-markers"><path stroke-linejoin="round" fill="#68b828" stroke="#ffffff" stroke-width="0" d="M 42.45253929419554 95.22068441173845 A 65 65 0 0 0 165 65.00000000000001 L 132 65.00000000000001 A 32 32 0 0 1 71.6689424217578 79.877875402702 Z"></path><path stroke-linejoin="round" fill="#7c38bc" stroke="#ffffff" stroke-width="0" d="M 35.9371217445065 54.00238072936612 A 65 65 0 0 0 42.45253929419554 95.22068441173845 L 71.6689424217578 79.877875402702 A 32 32 0 0 1 68.46135224344935 59.585787435995634 Z"></path><path stroke-linejoin="round" fill="#0e62c7" stroke="#ffffff" stroke-width="0" d="M 39.931580671694995 40.16484347947625 A 65 65 0 0 0 35.9371217445065 54.00238072936612 L 68.46135224344935 59.585787435995634 A 32 32 0 0 1 70.42785509991138 52.773461405280614 Z"></path><path stroke-linejoin="round" fill="#fcd036" stroke="#ffffff" stroke-width="0" d="M 53.48679482995417 19.596016201117095 A 65 65 0 0 0 39.931580671694995 40.16484347947625 L 70.42785509991138 52.773461405280614 A 32 32 0 0 1 77.10119130090051 42.64726951439611 Z"></path><path stroke-linejoin="round" fill="#4fcdfc" stroke="#ffffff" stroke-width="0" d="M 79.03913209598424 3.472428808619455 A 65 65 0 0 0 53.48679482995417 19.596016201117095 L 77.10119130090051 42.64726951439611 A 32 32 0 0 1 89.68080349340762 34.709503413474195 Z"></path><path stroke-linejoin="round" fill="#00b19d" stroke="#ffffff" stroke-width="0" d="M 80.43798988447506 3.0134872715031733 A 65 65 0 0 0 79.03913209598424 3.472428808619455 L 89.68080349340762 34.709503413474195 A 32 32 0 0 1 90.36947194312619 34.48356296443233 Z"></path><path stroke-linejoin="round" fill="#ff6264" stroke="#ffffff" stroke-width="0" d="M 110.57568745559664 0.8661178873324786 A 65 65 0 0 0 80.43798988447506 3.0134872715031733 L 90.36947194312619 34.48356296443233 A 32 32 0 0 1 105.2064922858322 33.42639649837906 Z"></path><path stroke-linejoin="round" fill="#f7aa47" stroke="#ffffff" stroke-width="0" d="M 138.42830559945935 12.5760996419137 A 65 65 0 0 0 110.57568745559664 0.8661178873324786 L 105.2064922858322 33.42639649837906 A 32 32 0 0 1 118.91855044896461 39.19131059294213 Z"></path><path stroke-linejoin="round" fill="#9aea5a" stroke="#ffffff" stroke-width="0" d="M 157.97775376799646 35.613267142848755 A 65 65 0 0 0 138.42830559945935 12.5760996419137 L 118.91855044896461 39.19131059294213 A 32 32 0 0 1 128.54289416270595 50.53268536263323 Z"></path><path stroke-linejoin="round" fill="#ae6aee" stroke="#ffffff" stroke-width="0" d="M 165 65 A 65 65 0 0 0 157.97775376799646 35.613267142848755 L 128.54289416270595 50.53268536263323 A 32 32 0 0 1 132 65 Z"></path></g></g></g><g class="dxc-labels-group"></g><g class="dxc-labels" visibility="hidden" opacity="1"></g><g class="dxc-tooltip"><path d="M 0 0 Z" filter="url(#DevExpress_114)" stroke-width="1" stroke="#d3d3d3" visibility="hidden"></path><g text-anchor="middle" visibility="hidden" style="font-family: 'Segoe UI', 'Helvetica Neue', 'Trebuchet MS', Verdana; font-weight: 400; font-size: 12px; fill: rgb(35, 35, 35); cursor: default;"><text x="0" y="0" style="font-size: 12px;"></text></g></g><g class="dxc-trackers" opacity="0.0001" stroke="gray" fill="gray"><g class="dxc-crosshair-trackers" stroke="none" fill="grey"></g><g class="dxc-series-trackers"></g><g class="dxc-markers-trackers" stroke="none" fill="grey"><g><path stroke-linejoin="round" d="M 42.45253929419554 95.22068441173845 A 65 65 0 0 0 165 65.00000000000001 L 132 65.00000000000001 A 32 32 0 0 1 71.6689424217578 79.877875402702 Z"></path><path stroke-linejoin="round" d="M 35.9371217445065 54.00238072936612 A 65 65 0 0 0 42.45253929419554 95.22068441173845 L 71.6689424217578 79.877875402702 A 32 32 0 0 1 68.46135224344935 59.585787435995634 Z"></path><path stroke-linejoin="round" d="M 39.931580671694995 40.16484347947625 A 65 65 0 0 0 35.9371217445065 54.00238072936612 L 68.46135224344935 59.585787435995634 A 32 32 0 0 1 70.42785509991138 52.773461405280614 Z"></path><path stroke-linejoin="round" d="M 53.48679482995417 19.596016201117095 A 65 65 0 0 0 39.931580671694995 40.16484347947625 L 70.42785509991138 52.773461405280614 A 32 32 0 0 1 77.10119130090051 42.64726951439611 Z"></path><path stroke-linejoin="round" d="M 79.03913209598424 3.472428808619455 A 65 65 0 0 0 53.48679482995417 19.596016201117095 L 77.10119130090051 42.64726951439611 A 32 32 0 0 1 89.68080349340762 34.709503413474195 Z"></path><path stroke-linejoin="round" d="M 80.43798988447506 3.0134872715031733 A 65 65 0 0 0 79.03913209598424 3.472428808619455 L 89.68080349340762 34.709503413474195 A 32 32 0 0 1 90.36947194312619 34.48356296443233 Z"></path><path stroke-linejoin="round" d="M 110.57568745559664 0.8661178873324786 A 65 65 0 0 0 80.43798988447506 3.0134872715031733 L 90.36947194312619 34.48356296443233 A 32 32 0 0 1 105.2064922858322 33.42639649837906 Z"></path><path stroke-linejoin="round" d="M 138.42830559945935 12.5760996419137 A 65 65 0 0 0 110.57568745559664 0.8661178873324786 L 105.2064922858322 33.42639649837906 A 32 32 0 0 1 118.91855044896461 39.19131059294213 Z"></path><path stroke-linejoin="round" d="M 157.97775376799646 35.613267142848755 A 65 65 0 0 0 138.42830559945935 12.5760996419137 L 118.91855044896461 39.19131059294213 A 32 32 0 0 1 128.54289416270595 50.53268536263323 Z"></path><path stroke-linejoin="round" d="M 165 65 A 65 65 0 0 0 157.97775376799646 35.613267142848755 L 128.54289416270595 50.53268536263323 A 32 32 0 0 1 132 65 Z"></path></g></g></g><g></g></svg></div>
            </div>
        </div>
        */
    }

    function generateVectorMap($scope, id, report,  done)
    {
        var htmlCode = '';
        var theData = {"af":"16","al":"11","dz":"158","ao":"85","ag":"1","ar":"351","am":"8","au":"1219","at":"366","az":"52","bs":"7","bh":"21","bd":"105.4","bb":"3.96","by":"52.89","be":"461.33","bz":"1.43","bj":"6.49","bt":"1.4","bo":"19.18","ba":"16.2","bw":"12.5","br":"2023.53","bn":"11.96","bg":"44.84","bf":"8.67","bi":"1.47","kh":"11.36","cm":"21.88","ca":"1563.66","cv":"1.57","cf":"2.11","td":"7.59","cl":"199.18","cn":"5745.13","co":"283.11","km":"0.56","cd":"12.6","cg":"11.88","cr":"35.02","ci":"22.38","hr":"59.92","cy":"22.75","cz":"195.23","dk":"304.56","dj":"1.14","dm":"0.38","do":"50.87","ec":"61.49","eg":"216.83","sv":"21.8","gq":"14.55","er":"2.25","ee":"19.22","et":"30.94","fj":"3.15","fi":"231.98","fr":"2555.44","ga":"12.56","gm":"1.04","ge":"11.23","de":"3305.9","gh":"18.06","gr":"305.01","gd":"0.65","gt":"40.77","gn":"4.34","gw":"0.83","gy":"2.2","ht":"6.5","hn":"15.34","hk":"226.49","hu":"132.28","is":"12.77","in":"1430.02","id":"695.06","ir":"337.9","iq":"84.14","ie":"204.14","il":"201.25","it":"2036.69","jm":"13.74","jp":"5390.9","jo":"27.13","kz":"129.76","ke":"32.42","ki":"0.15","kr":"986.26","undefined":"5.73","kw":"117.32","kg":"4.44","la":"6.34","lv":"23.39","lb":"39.15","ls":"1.8","lr":"0.98","ly":"77.91","lt":"35.73","lu":"52.43","mk":"9.58","mg":"8.33","mw":"5.04","my":"218.95","mv":"1.43","ml":"9.08","mt":"7.8","mr":"3.49","mu":"9.43","mx":"1004.04","md":"5.36","mn":"5.81","me":"3.88","ma":"91","mz":"10","mm":"35","na":"11","np":"15","nl":"770","nz":"138","ni":"6","ne":"5","ng":"206","no":"413","om":"53","pk":"174","pa":"27","pg":"8","py":"17","pe":"153","ph":"189","pl":"438","pt":"223","qa":"126","ro":"158","ru":"1476","rw":"5","ws":"1","st":"1","sa":"434","sn":"12","rs":"39","sc":"1","sl":"2","sg":"217","sk":"86","si":"46","sb":"1","za":"354","es":"1374","lk":"48","kn":"1","lc":"1","vc":"1","sd":"65","sr":"3","sz":"3","se":"444","ch":"522","sy":"59","tw":"426","tj":"5","tz":"22","th":"312","tl":"1","tg":"3","to":"1","tt":"21","tn":"43","tr":"729","tm":0,"ug":"17","ua":"136","ae":"239","gb":"2258","us":"14624","uy":"40","uz":"37","vu":"1","ve":"285","vn":"101","ye":"30","zm":"15","zw":"5"};


        htmlCode += '<div id="VMAP_'+id+'" style="width: 600px; height: 400px"></div>';


        var el = document.getElementById(id);
        if (el)
        {
            var $div = $(htmlCode);
            angular.element(el).append($div);
            angular.element(document).injector().invoke(function($compile) {
                var scope = angular.element($div).scope();
                $compile($div)(scope);
                $('#VMAP_'+id).vectorMap();
            });
        }
        done(0);
        return;

        /*
         $('#world-map').vectorMap({
         map: 'world-map',
         series: {
         regions: [{
         values: sample_data,
         scale: ['#C8EEFF', '#0071A4'],
         normalizeFunction: 'polynomial'
         }]
         },
         onRegionTipShow: function(e, el, code){
         el.html(el.html()+' (GDP - '+gdpData[code]+')');
         }
         });
         */



    }

    function generateReadOnlyForm($scope, id, report,  done)
    {
        var quote = "'";

        getTheData(id, function(theData){

            if (theData)
            {

                if (!$scope.theData)
                     $scope.theData = [];


                var hashedID = hashCode(id);

                $scope.theData[hashedID] = theData;


                if (!$scope.tableParams)
                    $scope.tableParams = [];

                $scope.tableParams[hashedID] = new ngTableParams({
                    page: 1,            // show first page
                    count: 1000           // count per page
                }, {
                    counts: [], // hide page counts control
                    total: theData.length,  // length of data

                    getData: function($defer, params) {
                        // use build-in angular filter
                        var orderedData = params.sorting ?
                            $filter('orderBy')(theData, params.orderBy()) :
                            theData;
                        orderedData = params.filter ?
                            $filter('filter')(orderedData, params.filter()) :
                            orderedData;

                        //$scope.users = orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count());

                        params.total(orderedData.length); // set total for recalc pagination
                        //$defer.resolve($scope.users);
                    }
                });


                var htmlCode = '';


               // htmlCode += '<table class"table readOnlyForm"></div>';
                htmlCode += '<table ng-table="tableParams['+hashedID+']" show-filter="false" class="table">';


                for(var i = 0; i < report.properties[0].fields.length; i++)
                {
                    htmlCode += '<tr ><td class="readOnlyFormFieldAlias" >'+report.properties[0].fields[i].fieldAlias+'</td><td class="readOnlyFormFieldData" >{{theData['+hashedID+'][0].'+report.properties[0].fields[i].fieldName+'}}</td></tr>';
                }

                htmlCode += '</table>';

                var el = document.getElementById(id);
                if (el)
                {
                    var $div = $(htmlCode);
                    angular.element(el).append($div);
                    angular.element(document).injector().invoke(function($compile) {
                        var scope = angular.element($div).scope();
                        $compile($div)(scope);
                    });
                }
                done(0);
                return;

            }
        });

        /*
         $('#world-map').vectorMap({
         map: 'world-map',
         series: {
         regions: [{
         values: sample_data,
         scale: ['#C8EEFF', '#0071A4'],
         normalizeFunction: 'polynomial'
         }]
         },
         onRegionTipShow: function(e, el, code){
         el.html(el.html()+' (GDP - '+gdpData[code]+')');
         }
         });
         */



    }


    //TODO: Incluir sparkline en la rejilla de datos
    //TODO: Incluir indicadores únicos como en la plantilla ACE

    //Cynteka pivot table http://ukman.github.io/





        /*

         http://ngmodules.org/modules/ng-table
         crear una hoja de calculo

         http://thomasstreet.com/blog/legacy/spreadsheet.html


         <table>
         <tr ng-repeat="row in rows">
         <td ng-repeat="column in columns">
         <div>
         <input ng-model="cells[column+row]"></input>
         <div ng-bind="compute(column+row)"
         class="output"></div>
         </div>
         </td>
         </tr>
         </table>

  --------------------
  PIVOTTABLE

         https://github.com/nicolaskruchten/pivottable/issues/208


         -------------------

        <div class="box-body table-responsive no-padding"   ng-init="getVisitorsByDate()">
            <table class="table table-striped table-hover table-bordered" >
                <thead>
                    <tr>

                        <td>IP</td>
                        <td>date</td>
                        <td>Profile</td>
                        <td>language</td>
                        <td>Country</td>
                        <td>City</td>
                        <td>Referer</td>

                    </tr>
                </thead>
                <tbody>
                    <tr class="table-row" ng-repeat="theItem in visitors" id="{{theItem._id}}">
                        <td>{{theItem.ip}}</td>
                        <td>{{theItem.date}}</td>
                        <td>{{theItem.visitorProfile}}</td>
                        <td>{{theItem.language}}</td>
                        <td>{{theItem.country}}</td>
                        <td>{{theItem.city}}</td>
                        <td>
                            <a href="{{theItem.referer}}">{{theItem.referer}}</a>
                            <br>
                                <b>Asking for page: </b>{{theItem.requestedPage}}
                                <br>
                                    <small>{{theItem.userAgent}}</small>
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    */


    return this;

});
