var mapa;
var CLIMA_TEMPO_TOKEN = 'bae772a8c76b488cd2b8971dc5a7e0c8';

var Mapas = function (data) {
  var self = this;

  this.nome = ko.observable(data.nome);
  this.lat = ko.observable(data.lat);
  this.lng = ko.observable(data.lng);
  this.estadoMarcador = ko.observable(true);
  this.condicaoTempo = ko.observable();
  this.temperatura = ko.observable();

    var climatempoURL = 'http://apiadvisor.climatempo.com.br/api/v1/weather/locale/4818/current?token='+ CLIMA_TEMPO_TOKEN +'';
    ko.computed(function() {
        $.ajax(climatempoURL, {
            success: function (data) {
                var resultado = data.data;
                self.condicaoTempo = resultado.condition;
                self.temperatura = resultado.temperature;
            }
        }).done(function () {
            self.conteudoInformacaoEscola = "<h5>" + self.nome() +"</h5><br/>" +
                                            "<p style='font-size: 18px'>" + self.condicaoTempo +"</p>" +
                                            "<p style='font-size: 18px'>" + "Temperatura: "+ self.temperatura + " Graus"+"</p>";
        }).fail(function () {
            alert("erro")
        });
    }, this);

  this.marcador = new google.maps.Marker({
      position: new google.maps.LatLng(data.lat, data.lng),
      map: mapa,
      title: data.nome,
      animation: google.maps.Animation.DROP
  });


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

};


function MapaViewModel() {
    var self = this;

    mapa = new google.maps.Map(document.getElementById('map'), {
        center: {lat: -27.2180696, lng: -49.6450662},
        zoom: 15,
        styles: styles
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
    };

}

function inicializaMapa() {
    ko.applyBindings(
        new MapaViewModel());
}
