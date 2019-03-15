var instituicoesEnsino = [
    {nome: 'Centro Universitário para o Desenvolvimento do Alto Vale do Itajaí', lat: -27.2089202, lng: -49.646385},
    {nome: 'Colégio Sinodal Ruy Barbosa', lat: -27.2226135, lng: -49.6496359},
    {nome: 'Instituto Maria Auxiliadora', lat: -27.2172692, lng: -49.6447687},
    {nome: 'Colégio Dom Bosco', lat: -27.2149077, lng: -49.6458046}
];

var mapa;
var FOURSQUARE_CLIENT_ID = 'XEODQMYLJUKI3EJXIRTAB1QHULHXA0JPRK01Z203FBG2URVL';
var FOURSQUARE_CLIENT_SECRET = 'GAN1OO1HN4R14U4XAQ1U1P3WIKAZQ233L0POZJEOZR2EIIPP';

var Mapas = function (data) {
  var self = this;

  this.nome = ko.observable(data.nome);
  this.lat = ko.observable(data.lat);
  this.lng = ko.observable(data.lng);
  this.endereco = ko.observable('');

  this.estadoMarcador = ko.observable(true);

  this.marcador = new google.maps.Marker({
      position: new google.maps.LatLng(data.lat, data.lng),
      map: mapa,
      title: data.nome,
      animation: google.maps.Animation.DROP
  });

  this.conteudoInformacaoEscola = "<p>" + data.nome + "</p>";
  this.informacaoEscola = new google.maps.InfoWindow({content: self.conteudoInformacaoEscola});


  this.marcador.addListener('click', function () {
      self.informacaoEscola.setContent(self.conteudoInformacaoEscola);
      self.informacaoEscola.open(mapa, this);
  });

    this.mostraMarcadorInstituicao = ko.computed(function() {
        if(this.estadoMarcador() === true) {
            this.marcador.setMap(mapa);
        } else {
            this.marcador.setMap(null);
        }
        return true;
    }, this);


    var foursquareAPI = 'https://api.foursquare.com/v2/venues/explore?client_id='+ FOURSQUARE_CLIENT_ID +'&client_secret='+ FOURSQUARE_CLIENT_SECRET +'' +
        '&v=20180323&limit=1&ll='+ this.lat() +','+ this.lng() +'&query='+ self.nome() +'';
    $.getJSON(foursquareAPI, function (data) {
        var resultado = data.response;
        console.log(resultado);

    })


};

function MapaViewModel() {
    var self = this;

    mapa = new google.maps.Map(document.getElementById('map'), {
        center: {lat: -27.2180696, lng: -49.6450662},
        zoom: 15
    });

    this.listaInstituicoesEnsino = ko.observableArray([]);
    this.consultaInstituicao = ko.observable("");

    instituicoesEnsino.forEach(function (instituicaoEnsino) {
        self.listaInstituicoesEnsino.push(new Mapas(instituicaoEnsino));
    });

    self.listaInstituicaoFiltrada = self.listaInstituicoesEnsino;

    self.filtraInstituicoes = ko.computed(function() {
        var filter = self.consultaInstituicao().toLowerCase();
        if (!filter) {
            self.listaInstituicaoFiltrada().forEach(function(instituicaoEnsino){
                instituicaoEnsino.estadoMarcador(true);
            });
            return self.listaInstituicaoFiltrada();
        } else {
            return ko.utils.arrayFilter(self.listaInstituicaoFiltrada(), function(instituicaoEnsino) {
                var string = instituicaoEnsino.nome().toLowerCase().indexOf(filter) >= 0;
                instituicaoEnsino.estadoMarcador(string);
                return string;
            });
        }
    }, self);


    this.instituicaoEnsinoSelecionada = ko.observable(this.listaInstituicoesEnsino()[0]);
    this.setInstituicaoEnsino = function (instituicaoEnsino) {
        google.maps.event.trigger(instituicaoEnsino.marcador, 'click');
    }
}

function inicializaMapa() {
    ko.applyBindings(new MapaViewModel());
}
